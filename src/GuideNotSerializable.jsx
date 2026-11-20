import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideNotSerializable() {
  return (
    <ArticlePage
      h1="TypeError: Object of Type X Is Not JSON Serializable (Python Fix)"
      intro="Why json.dumps fails on datetime, Decimal, set, UUID, dataclasses and your own classes, and the right fix for each, from a one-line default= to a reusable encoder. Every example was run on Python 3.14."
      updated="November 20, 2026"
      faqKey="object-is-not-json-serializable"
      related={[
        ['/json-in-python', 'JSON in Python'],
        ['/jsondecodeerror-expecting-value', 'JSONDecodeError in Python'],
        ['/json-to-python', 'JSON to Python classes'],
        ['/', 'JSON Formatter'],
      ]}
    >
      <h2>What the Error Means</h2>
      <p>
        JSON only knows strings, numbers, booleans, null, arrays and objects. <code>json.dumps()</code>
        converts Python&apos;s <code>dict</code>, <code>list</code>, <code>tuple</code>, <code>str</code>,
        <code> int</code>, <code>float</code>, <code>bool</code> and <code>None</code> automatically. Anything else
        stops it:
      </p>
      <Code label="Error">{`TypeError: Object of type datetime is not JSON serializable`}</Code>
      <p>
        The type name in the message tells you which value to fix. Recent Python versions also add
        notes that show <strong>where</strong> the value is. For
        <code> {'{'}&apos;order&apos;: {'{'}&apos;when&apos;: datetime(...){'}'}{'}'}</code> Python 3.14 printed:
      </p>
      <Code label="Traceback ending">{`TypeError: Object of type datetime is not JSON serializable
when serializing dict item 'when'
when serializing dict item 'order'`}</Code>

      <h2>Which Types Fail</h2>
      <p>We passed each of these to <code>json.dumps()</code> on Python 3.14:</p>
      <table>
        <thead>
          <tr><th>Value</th><th>Error says</th><th>Good JSON form</th></tr>
        </thead>
        <tbody>
          <tr><td><code>datetime</code>, <code>date</code></td><td><code>datetime</code>, <code>date</code></td><td>ISO string: <code>value.isoformat()</code></td></tr>
          <tr><td><code>Decimal</code></td><td><code>Decimal</code></td><td><code>str(value)</code> to keep every digit, or <code>float(value)</code></td></tr>
          <tr><td><code>set</code>, <code>frozenset</code></td><td><code>set</code></td><td>A list: <code>sorted(value)</code> or <code>list(value)</code></td></tr>
          <tr><td><code>UUID</code></td><td><code>UUID</code></td><td><code>str(value)</code></td></tr>
          <tr><td><code>bytes</code></td><td><code>bytes</code></td><td>Base64 text, or <code>value.decode(&quot;utf-8&quot;)</code> if it is text</td></tr>
          <tr><td>A dataclass</td><td>the class name, e.g. <code>Point</code></td><td><code>dataclasses.asdict(value)</code></td></tr>
          <tr><td>Your own class</td><td>the class name, e.g. <code>User</code></td><td><code>vars(value)</code> or a <code>to_dict()</code> method</td></tr>
          <tr><td><code>Enum</code></td><td>the enum name, e.g. <code>Color</code></td><td><code>value.value</code></td></tr>
          <tr><td><code>pathlib.Path</code></td><td><code>WindowsPath</code> / <code>PosixPath</code></td><td><code>str(value)</code></td></tr>
        </tbody>
      </table>
      <p>
        A <code>tuple</code> does work: it becomes a JSON array. NumPy values fail the same way with the
        NumPy type name (such as <code>int64</code> or <code>ndarray</code>); convert them with
        <code> .item()</code> or <code>.tolist()</code> first.
      </p>

      <h2>The Quick Fix: default=str (and Its Catch)</h2>
      <p>
        <code>default</code> is a function <code>json.dumps</code> calls for every value it cannot handle.
        Passing <code>str</code> makes the error go away:
      </p>
      <Code label="Python">{`json.dumps(order, default=str)`}</Code>
      <p>But look at what it produced for a UUID, a datetime, a Decimal and a set:</p>
      <Code label="Output">{`{"id": "12345678-1234-5678-1234-567812345678", "created": "2026-11-20 09:30:00",
 "total": "19.99", "tags": "{'new'}"}`}</Code>
      <p>
        The date has a space instead of the ISO <code>T</code>, which many APIs and JavaScript&apos;s
        <code> Date</code> do not accept reliably, and the set became the useless string
        <code> &quot;{'{'}&apos;new&apos;{'}'}&quot;</code> instead of a list. Fine for logging; not for data
        other programs read.
      </p>

      <h2>The Right Fix: Your Own default Function</h2>
      <Code label="Python">{`import dataclasses, datetime, decimal, enum, json, uuid

def to_json(value):
    if isinstance(value, (datetime.datetime, datetime.date)):
        return value.isoformat()
    if isinstance(value, decimal.Decimal):
        return str(value)
    if isinstance(value, (set, frozenset)):
        return sorted(value)
    if isinstance(value, uuid.UUID):
        return str(value)
    if dataclasses.is_dataclass(value):
        return dataclasses.asdict(value)
    if isinstance(value, enum.Enum):
        return value.value
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")

json.dumps(order, default=to_json)`}</Code>
      <Code label="Output">{`{"id": "12345678-1234-5678-1234-567812345678", "created": "2026-11-20T09:30:00",
 "total": "19.99", "tags": ["new"]}`}</Code>
      <p>
        The last line matters: types you did not plan for still raise an error instead of being
        silently turned into strings. The ISO dates read back exactly with
        <code> datetime.fromisoformat()</code>.
      </p>

      <h2>Reusable: Subclass JSONEncoder</h2>
      <p>If many places in your code write JSON, put the rules in one encoder class:</p>
      <Code label="Python">{`class AppEncoder(json.JSONEncoder):
    def default(self, value):
        if isinstance(value, (datetime.datetime, datetime.date)):
            return value.isoformat()
        return super().default(value)   # raises the normal TypeError

json.dumps({"when": datetime.date(2026, 11, 20)}, cls=AppEncoder)
# {"when": "2026-11-20"}`}</Code>
      <p>
        <code>default=</code> and <code>cls=</code> work the same with <code>json.dump()</code> when writing a file.
      </p>

      <h2>Your Own Classes and Dataclasses</h2>
      <Code label="Python">{`from dataclasses import dataclass, asdict

@dataclass
class Point:
    x: int
    y: int

json.dumps(asdict(Point(1, 2)))        # {"x": 1, "y": 2}

class User:
    def __init__(self, name, email):
        self.name, self.email = name, email

json.dumps(vars(User("Emily", "emily@example.com")))
# {"name": "Emily", "email": "emily@example.com"}`}</Code>
      <p>
        <code>vars()</code> returns the object&apos;s attributes, including any you might not want to
        share, such as passwords or internal caches. For anything sent to a client, write an
        explicit <code>to_dict()</code> method that lists the fields. For larger projects, Pydantic
        models have <code>model_dump_json()</code>, and the <a href="/json-to-python">JSON to Python</a> tool
        can generate dataclasses or Pydantic models from example JSON.
      </p>

      <h2>Frameworks</h2>
      <ul>
        <li><strong>Flask</strong>&apos;s <code>jsonify()</code> converts Decimal, UUID and dataclasses, and dates too, but as HTTP date strings (<code>Fri, 20 Nov 2026 09:30:00 GMT</code>), not ISO. Your own classes still need a <code>to_dict()</code>.</li>
        <li><strong>Django</strong> has <code>DjangoJSONEncoder</code> for dates, Decimal and UUID: <code>json.dumps(data, cls=DjangoJSONEncoder)</code>.</li>
        <li><strong>FastAPI</strong> converts Pydantic models, dates and UUIDs in responses automatically.</li>
      </ul>
    </ArticlePage>
  )
}

export default GuideNotSerializable
