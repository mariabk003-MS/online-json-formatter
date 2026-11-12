import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonComments() {
  return (
    <ArticlePage
      h1="Can JSON Have Comments? (And What to Do Instead)"
      intro="Standard JSON does not allow comments. Here is why, which file types quietly accept them, and the best ways to add notes to JSON."
      updated="November 12, 2026"
      faqKey="json-comments"
      related={[
        ['/json-repair', 'JSON Repair (removes comments)'],
        ['/', 'JSON Formatter'],
        ['/json-to-yaml', 'JSON to YAML'],
        ['/json-syntax-rules', 'JSON Syntax Rules'],
      ]}
    >
      <h2>The Short Answer: No</h2>
      <p>
        The JSON standard (RFC 8259) has no comments. Both <code>// line</code> and
        <code> /* block */</code> comments make JSON invalid, and strict parsers
        like <code>JSON.parse</code> or Python&apos;s <code>json.loads</code> will throw an error.
      </p>
      <Code label="Invalid JSON">{`{
  // The user's display name
  "name": "Emily",
  "theme": "dark" /* light or dark */
}`}</Code>
      <p>
        Douglas Crockford, who described JSON, left comments out on purpose so
        people could not use them to hide parsing instructions, and so every
        JSON parser would behave the same way.
      </p>

      <h2>Where Comments Do Work</h2>
      <ul>
        <li><strong>JSONC</strong> (&quot;JSON with comments&quot;): used by VS Code settings, <code>tsconfig.json</code> and <code>jsconfig.json</code>.</li>
        <li><strong>JSON5</strong>: a JSON superset with comments, trailing commas and single quotes.</li>
        <li><strong>YAML</strong>: a different format that supports <code># comments</code> and is common for config files.</li>
      </ul>
      <p>
        These files only work with tools that expect them. If you send them to
        a normal JSON parser or an API, they will fail.
      </p>

      <h2>How to Remove Comments from JSON</h2>
      <p>
        Paste the file into our <a href="/json-repair">JSON Repair</a> tool or the
        <a href="/"> JSON Formatter</a>. Both remove <code>//</code> and
        <code> /* */</code> comments automatically and also fix trailing
        commas, so you get valid JSON in one click.
      </p>

      <h2>Alternatives to Comments</h2>
      <h3>1. A comment field</h3>
      <Code label="Valid JSON">{`{
  "_comment": "Theme can be light or dark",
  "name": "Emily",
  "theme": "dark"
}`}</Code>
      <p>Simple and valid, but the field becomes part of your data, so make sure your code ignores it.</p>

      <h3>2. A description in a JSON Schema</h3>
      <p>
        Put explanations in a separate <a href="/json-schema-generator">JSON Schema</a>
        using the <code>description</code> keyword. Editors like VS Code then show
        the description as a tooltip.
      </p>

      <h3>3. Use YAML for config files</h3>
      <p>
        If people need to edit the file by hand and leave notes, YAML may be the
        better choice. Convert with our <a href="/json-to-yaml">JSON to YAML</a> tool.
      </p>

      <h3>4. Keep notes in the README</h3>
      <p>Document what each field means next to the file, in your project&apos;s README or docs.</p>

      <h3>5. Use YAML for hand-edited config</h3>
      <p>
        If people edit the file by hand and need comments, YAML may be a better
        fit: it supports <code># comments</code> and holds the same data. Convert
        with <a href="/json-to-yaml">JSON to YAML</a>, and read
        <a href="/json-vs-yaml"> JSON vs YAML</a> to decide.
      </p>
    </ArticlePage>
  )
}

export default GuideJsonComments
