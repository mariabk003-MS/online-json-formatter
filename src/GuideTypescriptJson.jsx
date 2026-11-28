import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideTypescriptJson() {
  return (
    <ArticlePage
      h1="JSON in TypeScript: Parse, Type and Validate It Safely"
      intro="Why JSON.parse gives you any, why 'as User' does not check anything, and the three safe ways to get typed data: unknown with a type guard, Zod, and generated types. Every example was type-checked with TypeScript 5.9 in strict mode and run with Node.js 24."
      updated="November 28, 2026"
      faqKey="json-in-typescript"
      related={[
        ['/json-to-typescript', 'JSON to TypeScript'],
        ['/json-to-zod', 'JSON to Zod'],
        ['/javascript-json-parse', 'JSON.parse in JavaScript'],
        ['/json-schema-generator', 'JSON Schema Generator'],
      ]}
    >
      <h2>The Problem: JSON.parse Returns any</h2>
      <p>
        TypeScript&apos;s own type for <code>JSON.parse</code> is <code>parse(text: string, reviver?): any</code>.
        <code> any</code> switches type checking off, so a cast like <code>as User</code> is only a promise you make
        to the compiler. Nothing checks it when the code runs:
      </p>
      <Code label="TypeScript">{`interface User {
  id: number
  name: string
  email: string
}

const text = '{"id": 1, "fullName": "Emily Clark"}'
const user = JSON.parse(text) as User   // compiles without a warning
console.log(user.name.toUpperCase())`}</Code>
      <Code label="Output">{`TypeError: Cannot read properties of undefined (reading 'toUpperCase')`}</Code>
      <p>
        The API sent <code>fullName</code>, not <code>name</code>. TypeScript believed the cast, so the mistake
        only showed up at runtime, often far from the line that caused it. The same is true for
        <code> response.json()</code> in <code>fetch</code>, which is typed as <code>Promise&lt;any&gt;</code>.
      </p>

      <h2>Safer: Parse to unknown</h2>
      <p>
        Give the result the type <code>unknown</code> instead. TypeScript then refuses to let you use it until you
        have checked it:
      </p>
      <Code label="TypeScript">{`const data: unknown = JSON.parse(text)
console.log(data.name)`}</Code>
      <Code label="Compiler error">{`error TS18046: 'data' is of type 'unknown'.`}</Code>
      <p>A <strong>type guard</strong> does the check by hand and tells TypeScript the result:</p>
      <Code label="TypeScript">{`function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === 'number' &&
    typeof (value as Record<string, unknown>).name === 'string' &&
    typeof (value as Record<string, unknown>).email === 'string'
  )
}

const data: unknown = JSON.parse(text)
if (isUser(data)) {
  console.log(data.name.toUpperCase())   // data is User here
} else {
  console.log('not a valid user')
}`}</Code>
      <p>
        For our example this prints <code>not a valid user</code> instead of crashing. Type guards need no library,
        but they get long for nested data, and nothing keeps them in step with the interface.
      </p>

      <h2>Best: Validate with Zod</h2>
      <p>
        A Zod schema checks the data at runtime <strong>and</strong> gives you the TypeScript type, so the two can
        never drift apart:
      </p>
      <Code label="TypeScript (Zod 4)">{`import { z } from 'zod'

const UserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.email(),
})
type User = z.infer<typeof UserSchema>

const result = UserSchema.safeParse(JSON.parse(text))
if (result.success) {
  console.log(result.data.name)          // result.data is User
} else {
  console.log(result.error.issues)
}`}</Code>
      <Code label="The issues for our example">{`name: Invalid input: expected string, received undefined
email: Invalid input: expected string, received undefined`}</Code>
      <p>
        Use <code>safeParse</code> when bad data is expected and you want to handle it, or <code>parse</code>, which
        throws a <code>ZodError</code>, when bad data is a bug. You do not have to write the schema by hand: paste an
        example response into <a href="/json-to-zod">JSON to Zod</a> and copy the result.
      </p>

      <h2>Typing a fetch Response</h2>
      <p>
        Wrap the call once, and every caller gets checked, typed data:
      </p>
      <Code label="TypeScript">{`async function getUser(id: number): Promise<User> {
  const response = await fetch(\`https://api.example.com/users/\${id}\`)
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
  return UserSchema.parse(await response.json())
}`}</Code>

      <h2>Only Need Types? Generate Them</h2>
      <p>
        If you trust the source, for example your own backend, interfaces may be enough. Writing them by hand for a
        large response is slow and error-prone; paste a sample into <a href="/json-to-typescript">JSON to TypeScript</a> to
        get every nested interface and optional field at once. Remember that these types disappear when the code is
        compiled, so they describe the data but never check it.
      </p>

      <h2>Comparing the Options</h2>
      <table>
        <thead>
          <tr><th>Approach</th><th>Checks real data?</th><th>Best for</th></tr>
        </thead>
        <tbody>
          <tr><td><code>JSON.parse(text) as User</code></td><td>No</td><td>Quick scripts with data you control</td></tr>
          <tr><td><code>unknown</code> + type guard</td><td>Yes, by hand</td><td>Small shapes, no extra library</td></tr>
          <tr><td>Zod schema</td><td>Yes</td><td>API responses, user input, config files</td></tr>
          <tr><td>Generated interfaces</td><td>No</td><td>Typing data from a trusted source</td></tr>
        </tbody>
      </table>

      <h2>Importing a .json File</h2>
      <p>
        Turn on <code>&quot;resolveJsonModule&quot;: true</code> in tsconfig.json and TypeScript reads the type straight
        from the file. In Node.js ES modules the import needs the <code>with {'{'} type: &apos;json&apos; {'}'}</code> attribute:
      </p>
      <Code label="TypeScript">{`import settings from './settings.json' with { type: 'json' }

const port: number = settings.port   // typed from the file: { name: string; port: number }`}</Code>
      <p>
        This is fine for config that ships with your code. For files that users or other programs change, read and
        validate them instead, as shown in <a href="/read-json-file-nodejs">Read a JSON File in Node.js</a>.
      </p>

      <h2>Dates and Other Values Change on the Way</h2>
      <p>
        JSON has no date type, so <code>JSON.stringify</code> writes a <code>Date</code> as text, and
        <code> JSON.parse</code> gives you a string back, whatever your interface says:
      </p>
      <Code label="TypeScript">{`const saved = JSON.stringify({ title: 'Launch', at: new Date('2026-11-28T09:30:00Z') })
// {"title":"Launch","at":"2026-11-28T09:30:00.000Z"}

typeof JSON.parse(saved).at   // 'string'

const EventSchema = z.object({ title: z.string(), at: z.coerce.date() })
EventSchema.parse(JSON.parse(saved)).at instanceof Date   // true`}</Code>
      <p>
        <code>JSON.stringify</code> also drops <code>undefined</code> values and functions:
        <code> JSON.stringify({'{'} a: 1, b: undefined, c: () =&gt; 1 {'}'})</code> gives <code>{'{"a":1}'}</code>. Values it
        cannot write at all, such as a <code>BigInt</code> or an object that refers to itself, throw; see
        <a href="/converting-circular-structure-to-json"> Converting Circular Structure to JSON</a>.
      </p>

      <h2>A Type for Any JSON Value</h2>
      <p>When the shape really is open, like a settings blob, describe &quot;any valid JSON&quot; precisely instead of using <code>any</code>:</p>
      <Code label="TypeScript">{`type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

const config: Json = { port: 8080, tags: ['a', 'b'], nested: { ok: true, none: null } }`}</Code>
      <p>
        TypeScript now rejects dates, functions and <code>undefined</code> in <code>config</code>, because they are not
        JSON. To check that a string is valid JSON before you parse it, use the <a href="/json-validator">JSON Validator</a>.
      </p>
    </ArticlePage>
  )
}

export default GuideTypescriptJson
