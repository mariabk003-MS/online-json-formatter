import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { inferModel, splitNullable, toCamelCase, toPascalCase } from './typeModel.js'

const BOXED = { int: 'Integer', long: 'Long', double: 'Double', boolean: 'Boolean' }

// Java type for a JSON type. "boxed" is needed inside List<...> and for optional fields.
function javaType(type, boxed) {
  const { base, nullable } = splitNullable(type)
  const box = boxed || nullable
  let t
  switch (base.kind) {
    case 'string':
      t = 'String'
      break
    case 'integer':
      t = 'long'
      break
    case 'number':
      t = 'double'
      break
    case 'boolean':
      t = 'boolean'
      break
    case 'object':
      t = base.name
      break
    case 'array':
      t = `List<${javaType(base.items, true)}>`
      break
    default:
      t = 'Object'
  }
  return box && BOXED[t] ? BOXED[t] : t
}

function jsonToJava(data, style, rootName, jackson) {
  const model = inferModel(data, rootName || 'Root')
  const usesList = JSON.stringify([...model.classes.values()]).includes('"array"')
  const imports = []
  if (usesList) imports.push('import java.util.List;')
  if (jackson) imports.push('import com.fasterxml.jackson.annotation.JsonProperty;')

  const blocks = [...model.classes].map(([name, fields], index) => {
    const modifier = index === 0 ? 'public ' : ''
    const props = fields.map((field) => {
      const camel = toCamelCase(field.key)
      const safe = /^(class|default|package|public|private|static|final|int|long|double|boolean|new|return|switch|case|import|interface|enum|this|super|void)$/.test(camel) ? `${camel}Value` : camel
      return { ...field, java: javaType(field.type, field.optional), name: safe, renamed: safe !== field.key }
    })
    const annotation = (p) => (jackson && p.renamed ? `@JsonProperty("${p.key}") ` : '')

    if (style === 'record') {
      const params = props.map((p) => `    ${annotation(p)}${p.java} ${p.name}`).join(',\n')
      return `${modifier}record ${name}(\n${params}\n) {}`
    }
    const body = []
    for (const p of props) body.push(`    ${annotation(p)}private ${p.java} ${p.name};`)
    for (const p of props) {
      const cap = toPascalCase(p.name)
      const getter = p.java === 'boolean' ? `is${cap}` : `get${cap}`
      body.push('', `    public ${p.java} ${getter}() {\n        return ${p.name};\n    }`)
      body.push('', `    public void set${cap}(${p.java} ${p.name}) {\n        this.${p.name} = ${p.name};\n    }`)
    }
    return `${modifier}class ${name} {\n${body.join('\n')}\n}`
  })

  const note =
    blocks.length > 1
      ? '// Put each class in its own .java file, or make the extra classes "static" inside the first one.\n\n'
      : ''
  return (imports.length ? imports.join('\n') + '\n\n' : '') + note + blocks.join('\n\n') + '\n'
}

const SAMPLE = JSON.stringify(
  {
    id: 1024,
    first_name: 'Emily',
    last_name: 'Clark',
    email: 'emily.clark@example.com',
    active: true,
    balance: 2500.75,
    address: { city: 'London', postcode: 'SW1A 1AA' },
    orders: [
      { order_id: 'A-100', total: 49.99 },
      { order_id: 'A-101', total: 19.5, coupon: 'SAVE10' },
    ],
  },
  null,
  2
)

function JsonToJava() {
  const [style, setStyle] = useState('class')
  const [rootName, setRootName] = useState('Customer')
  const [jackson, setJackson] = useState(true)

  return (
    <ConverterPage
      h1="JSON to Java Class Generator – POJO & Records"
      intro="Paste JSON and get Java classes (POJOs with getters and setters) or Java records, with nested classes, lists and Jackson annotations."
      inputTitle="JSON Input"
      outputTitle="Java"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${rootName || 'Root'}.java`, mimeType: 'text/x-java-source' }}
      actions={[
        {
          label: 'Generate Java',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToJava(data, style, rootName, jackson)
            const count = (output.match(/^(public )?(class|record) /gm) || []).length
            return { output, message: `Generated ${count} Java ${style === 'record' ? 'record' : 'class'}${count === 1 ? '' : 'es'}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Style
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="class">Class (getters / setters)</option>
              <option value="record">Record (Java 16+)</option>
            </select>
          </label>
          <label className="option">
            Class name
            <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
          </label>
          <label className="option">
            <input type="checkbox" checked={jackson} onChange={(event) => setJackson(event.target.checked)} />
            Jackson @JsonProperty
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Java Converter?</h2>
        <p>
          A JSON to Java converter reads example JSON and writes matching Java
          classes, so you can map API responses to objects with Jackson, Gson
          or Spring without typing every field by hand.
        </p>

        <h2>How to Generate Java Classes from JSON</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Choose classes with getters and setters, or Java records.</li>
          <li>Click Generate Java, or press Ctrl + Enter.</li>
          <li>Copy the code or download the .java file.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Nested objects become their own classes, arrays become List&lt;...&gt;.</li>
          <li>snake_case keys become camelCase fields, with @JsonProperty to keep the JSON name.</li>
          <li>Optional and null values use boxed types like Long and Boolean.</li>
          <li>Java records for modern, immutable data classes.</li>
          <li>Runs in your browser. Your JSON is never uploaded.</li>
        </ul>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "user_id": 42,
  "firstName": "Emily",
  "email": "emily@example.com",
  "tags": ["admin"],
  "address": { "city": "London" },
  "manager": null
}`}</Code>
        <Code label="Java (record, with Jackson)">{`public record User(
    @JsonProperty("user_id") long userId,
    String firstName,
    String email,
    List<String> tags,
    Address address,
    Object manager
) {}

record Address(
    String city
) {}`}</Code>
        <p>
          <code>user_id</code> becomes the Java-style <code>userId</code>, and
          <code> @JsonProperty</code> tells Jackson which JSON key to read. Numbers
          without decimals become <code>long</code> so large IDs never overflow, and
          <code> manager</code> is <code>Object</code> because the sample only contains
          <code> null</code>. Change it to the real type if you know it.
        </p>

        <h2>Reading JSON with Jackson</h2>
        <Code label="Java">{`ObjectMapper mapper = new ObjectMapper();
User user = mapper.readValue(jsonText, User.class);
System.out.println(user.firstName());`}</Code>
        <p>
          Jackson supports records from version 2.12. If your JSON may contain
          fields that are not in the class, add
          <code> @JsonIgnoreProperties(ignoreUnknown = true)</code> to the class, or
          configure the mapper with
          <code> FAIL_ON_UNKNOWN_PROPERTIES</code> turned off.
        </p>

        <h2>Records or Classes?</h2>
        <ul>
          <li><strong>Records</strong> (Java 16+) are short and immutable: perfect for API responses you only read.</li>
          <li><strong>Classes</strong> with getters and setters work on older Java versions and with frameworks that need to change fields after creating the object.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-java']} />

        <RelatedTools
          links={[
            ['/json-to-python', 'JSON to Python'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-schema-generator', 'JSON Schema Generator'],
            ['/', 'JSON Formatter'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToJava
