import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonSchema() {
  return (
    <ArticlePage
      h1="What Is JSON Schema? A Beginner's Guide with Examples"
      intro="JSON Schema describes what valid JSON looks like: which fields are required, what type each value has, and which values are allowed. Here is how it works, with a complete example you can test."
      updated="November 12, 2026"
      faqKey="what-is-json-schema"
      related={[
        ['/json-schema-validator', 'JSON Schema Validator'],
        ['/json-schema-generator', 'JSON Schema Generator'],
        ['/json-syntax-rules', 'JSON Syntax Rules'],
        ['/json-to-typescript', 'JSON to TypeScript'],
      ]}
    >
      <h2>JSON Schema in One Sentence</h2>
      <p>
        A JSON Schema is itself a JSON document that sets the rules for other
        JSON. Think of it as a form with required fields: the data either fits
        the rules and is valid, or it breaks a rule and you get a clear error
        that says where and why.
      </p>

      <h2>A Complete Example</h2>
      <Code label="Schema">{`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "properties": {
    "id":    { "type": "integer", "minimum": 1 },
    "name":  { "type": "string", "minLength": 2 },
    "email": { "type": "string", "format": "email" },
    "role":  { "enum": ["admin", "editor", "viewer"] },
    "tags":  { "type": "array", "items": { "type": "string" }, "uniqueItems": true }
  },
  "required": ["id", "name", "email"],
  "additionalProperties": false
}`}</Code>
      <p>This data passes every rule:</p>
      <Code label="Valid">{`{ "id": 1, "name": "Emily Clark", "email": "emily@example.com", "role": "admin", "tags": ["json"] }`}</Code>
      <p>This data breaks five rules:</p>
      <Code label="Invalid">{`{ "id": 0, "name": "E", "email": "not-an-email", "role": "owner", "nickname": "Em" }`}</Code>
      <Code label="Errors">{`(root)  has an extra field "nickname" that is not allowed
/id     must be >= 1
/name   must NOT have fewer than 2 characters
/email  must match format "email"
/role   must be one of: "admin", "editor", "viewer"`}</Code>
      <p>
        Paste both into the <a href="/json-schema-validator">JSON Schema Validator</a> to
        see these errors yourself.
      </p>

      <h2>The Keywords You Will Use Most</h2>
      <table>
        <thead>
          <tr><th>Keyword</th><th>What it checks</th></tr>
        </thead>
        <tbody>
          <tr><td><code>type</code></td><td>string, number, integer, boolean, object, array or null</td></tr>
          <tr><td><code>properties</code></td><td>The rules for each field of an object</td></tr>
          <tr><td><code>required</code></td><td>Fields that must be present</td></tr>
          <tr><td><code>additionalProperties</code></td><td>Whether fields not listed are allowed</td></tr>
          <tr><td><code>minimum</code> / <code>maximum</code></td><td>Limits for numbers</td></tr>
          <tr><td><code>minLength</code> / <code>maxLength</code></td><td>Limits for text length</td></tr>
          <tr><td><code>pattern</code></td><td>A regular expression the text must match</td></tr>
          <tr><td><code>format</code></td><td>email, date, date-time, uri, uuid, ipv4 and more</td></tr>
          <tr><td><code>enum</code></td><td>A fixed list of allowed values</td></tr>
          <tr><td><code>items</code> / <code>minItems</code> / <code>uniqueItems</code></td><td>Rules for arrays</td></tr>
        </tbody>
      </table>

      <h2>Optional and Nullable Fields</h2>
      <p>
        A field that is <strong>not</strong> in <code>required</code> may be left
        out. A field that may be present but empty should allow
        <code> null</code> as a type:
      </p>
      <Code label="Schema">{`"manager": { "type": ["string", "null"] }`}</Code>

      <h2>Reusing Rules with $defs and $ref</h2>
      <p>
        When the same shape appears in several places, define it once and
        point to it:
      </p>
      <Code label="Schema">{`{
  "$defs": {
    "address": {
      "type": "object",
      "properties": { "city": { "type": "string" }, "zip": { "type": "string" } },
      "required": ["city"]
    }
  },
  "type": "object",
  "properties": {
    "home": { "$ref": "#/$defs/address" },
    "work": { "$ref": "#/$defs/address" }
  }
}`}</Code>

      <h2>Which Version Should I Use?</h2>
      <p>
        The <code>$schema</code> line says which version of JSON Schema you
        follow. Use <strong>draft 2020-12</strong> for new work; it is the
        current version and is used by OpenAPI 3.1. Many existing projects still
        use <strong>draft-07</strong>, which is also widely supported. Older
        schemas use <code>definitions</code> where newer ones use <code>$defs</code>.
      </p>

      <h2>Where JSON Schema Is Used</h2>
      <ul>
        <li><strong>APIs:</strong> check request bodies before your code runs, and describe them in OpenAPI docs.</li>
        <li><strong>Config files:</strong> editors like VS Code use schemas to autocomplete and check files such as package.json and tsconfig.json.</li>
        <li><strong>Forms:</strong> libraries can build forms and their validation from a schema.</li>
        <li><strong>Data pipelines:</strong> reject bad records before they reach a database.</li>
      </ul>

      <h2>Validate JSON in Code</h2>
      <Code label="JavaScript (Ajv)">{`import Ajv from 'ajv/dist/2020'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

if (!validate(data)) console.log(validate.errors)`}</Code>
      <Code label="Python (jsonschema)">{`from jsonschema import Draft202012Validator

validator = Draft202012Validator(schema)
for error in validator.iter_errors(data):
    print(error.json_path, error.message)`}</Code>

      <h2>Get Started in a Minute</h2>
      <p>
        You do not have to write a schema by hand. Paste a sample of your data
        into the <a href="/json-schema-generator">JSON Schema Generator</a>, add the
        extra rules you need, then test real data with the
        <a href="/json-schema-validator"> JSON Schema Validator</a>.
      </p>
    </ArticlePage>
  )
}

export default GuideJsonSchema
