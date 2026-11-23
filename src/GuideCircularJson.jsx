import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideCircularJson() {
  return (
    <ArticlePage
      h1="TypeError: Converting Circular Structure to JSON (How to Fix It)"
      intro="Why JSON.stringify throws on circular references, how to find the property that closes the circle, and safe ways to log or send the data. Plus the BigInt error and the values JSON.stringify drops without a warning. Every example was run in Node.js 24."
      updated="November 23, 2026"
      faqKey="converting-circular-structure-to-json"
      related={[
        ['/javascript-json-parse', 'JSON.parse and JSON.stringify'],
        ['/unexpected-token-in-json', 'Unexpected Token in JSON'],
        ['/json-viewer', 'JSON Viewer'],
        ['/', 'JSON Formatter'],
      ]}
    >
      <h2>What the Error Means</h2>
      <p>
        JSON is a tree: every value has one parent. A JavaScript object can point back to itself
        or to one of its parents, which makes a loop. <code>JSON.stringify</code> would follow that
        loop forever, so it stops with an error instead:
      </p>
      <Code label="JavaScript">{`const user = { name: 'Emily' }
user.self = user

JSON.stringify(user)`}</Code>
      <Code label="Node.js 24 and Chrome">{`TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'self' closes the circle`}</Code>
      <p>
        Firefox words it as <code>TypeError: cyclic object value</code> and Safari as
        <code> JSON.stringify cannot serialize cyclic structures</code>. Same problem.
      </p>

      <h2>Read the Message: It Shows the Loop</h2>
      <p>
        Chrome and Node.js print the path of the loop. For a team whose member points back to the team:
      </p>
      <Code label="JavaScript">{`const team = { name: 'Team' }
const member = { name: 'Emily', team }
team.members = [member]

JSON.stringify(team)`}</Code>
      <Code label="Error">{`TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'members' -> object with constructor 'Array'
    |     index 0 -> object with constructor 'Object'
    --- property 'team' closes the circle`}</Code>
      <p>
        Read it top to bottom: <code>team.members[0].team</code> points back to <code>team</code>. That is
        the property to leave out, or the place to change your data.
      </p>

      <h2>Where Circular Objects Come From</h2>
      <ul>
        <li><strong>Parent and child links</strong> in your own data, like the example above, or trees where nodes keep a <code>parent</code> reference.</li>
        <li><strong>DOM elements and browser events.</strong> An element links to its parent and its document. Log <code>event.target.value</code>, not the event.</li>
        <li><strong>HTTP library objects.</strong> Request, response and error objects (from fetch, Axios, Express or Node&apos;s <code>http</code> module) hold sockets and links to each other. Send or log <code>response.data</code> or <code>error.message</code>, not the whole object.</li>
        <li><strong>ORM documents and class instances</strong> that keep references to their connection or model. Convert them to plain data first, for example with the library&apos;s <code>toObject()</code> or <code>toJSON()</code> method.</li>
      </ul>

      <h2>Fix 1: Send Only the Data You Need</h2>
      <p>
        The best fix is usually to stop stringifying the big object and pick the plain values:
      </p>
      <Code label="JavaScript">{`JSON.stringify({ name: member.name, team: member.team.name })
// {"name":"Emily","team":"Team"}`}</Code>
      <p>Or drop the problem key with a replacer function:</p>
      <Code label="JavaScript">{`JSON.stringify(member, (key, value) => (key === 'team' ? undefined : value))
// {"name":"Emily"}`}</Code>

      <h2>Fix 2: Replace Loops with &quot;[Circular]&quot;</h2>
      <p>
        For logging or debugging, a replacer can mark repeated parents instead of failing. Many
        snippets online use a <code>WeakSet</code> of every object seen, but that also hides objects
        that are simply <strong>used twice</strong> without any loop. Our test with the same address
        object in two places:
      </p>
      <Code label="Common WeakSet version: wrong for shared objects">{`const address = { city: 'London' }
safeStringify({ home: address, work: address })
// {"home":{"city":"London"},"work":"[Circular]"}   ← work lost its data`}</Code>
      <p>
        This version only marks real loops, by tracking the chain of parents of the current value:
      </p>
      <Code label="JavaScript">{`function stringifyWithoutCycles(value, space) {
  const parents = []
  return JSON.stringify(value, function (key, val) {
    if (typeof val !== 'object' || val === null) return val
    // "this" is the object that holds the current key: drop parents we have left.
    while (parents.length && parents[parents.length - 1] !== this) parents.pop()
    if (parents.includes(val)) return '[Circular]'
    parents.push(val)
    return val
  }, space)
}

stringifyWithoutCycles({ home: address, work: address })
// {"home":{"city":"London"},"work":{"city":"London"}}

stringifyWithoutCycles(team)
// {"name":"Team","members":[{"name":"Emily","team":"[Circular]"}]}`}</Code>
      <p>
        Use a regular <code>function</code>, not an arrow function, so that <code>this</code> is the
        parent object. The result is valid JSON, but the loops are gone, so it cannot be turned back
        into the original object.
      </p>

      <h2>Fix 3: Logging Without JSON</h2>
      <p>
        If you only want to look at the object, you may not need JSON at all.
        <code> console.log(user)</code> handles loops, and in Node.js <code>util.inspect</code> marks them:
      </p>
      <Code label="Node.js">{`import { inspect } from 'node:util'

inspect(user)
// <ref *1> { name: 'Emily', self: [Circular *1] }`}</Code>
      <p>
        To copy an object with loops, <code>structuredClone(user)</code> works and keeps the loop,
        while <code>JSON.parse(JSON.stringify(user))</code> throws.
      </p>

      <h2>The Other JSON.stringify Error: BigInt</h2>
      <Code label="Error">{`JSON.stringify({ id: 12345678901234567890n })
// TypeError: Do not know how to serialize a BigInt`}</Code>
      <p>
        JSON has no BigInt type. Turn it into a string, which keeps every digit:
      </p>
      <Code label="JavaScript">{`JSON.stringify(data, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
// {"id":"12345678901234567890"}`}</Code>

      <h2>Values JSON.stringify Changes Without Warning</h2>
      <p>No error here, but the result is not what many people expect. All tested in Node.js 24:</p>
      <table>
        <thead>
          <tr><th>Input</th><th>Output</th></tr>
        </thead>
        <tbody>
          <tr><td><code>{'{'} a: undefined, b: () =&gt; 1, d: 1 {'}'}</code></td><td><code>{'{'}&quot;d&quot;:1{'}'}</code>: undefined, functions and symbols are dropped from objects</td></tr>
          <tr><td><code>[undefined, () =&gt; 1, 2]</code></td><td><code>[null,null,2]</code>: in arrays they become null</td></tr>
          <tr><td><code>{'{'} n: NaN, i: Infinity {'}'}</code></td><td><code>{'{'}&quot;n&quot;:null,&quot;i&quot;:null{'}'}</code></td></tr>
          <tr><td><code>new Date(...)</code></td><td><code>&quot;2026-11-23T09:30:00.000Z&quot;</code>: a string, not a Date, after parsing</td></tr>
          <tr><td><code>new Map([[&apos;a&apos;, 1]])</code>, <code>new Set([1, 2])</code></td><td><code>{'{'}{'}'}</code>: empty objects. Use <code>Object.fromEntries(map)</code> and <code>[...set]</code></td></tr>
          <tr><td><code>JSON.stringify(undefined)</code></td><td><code>undefined</code>, not a string</td></tr>
        </tbody>
      </table>
      <p>
        A class can decide how it is written by adding a <code>toJSON()</code> method; for a point with
        <code> toJSON() {'{'} return [this.x, this.y] {'}'}</code> the output was <code>[1,2]</code>.
        More on both directions in <a href="/javascript-json-parse">JSON.parse and JSON.stringify in JavaScript</a>.
      </p>
    </ArticlePage>
  )
}

export default GuideCircularJson
