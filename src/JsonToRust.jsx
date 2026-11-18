import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToRust } from './rustGen.js'

const SAMPLE = JSON.stringify(
  {"name":"rg-lite","version":"0.4.1","type":"binary","downloads":125034,"stable":true,"repository":{"url":"https://github.com/example/rg-lite","stars":842},"releases":[{"tag":"v0.4.1","size_mb":3.2},{"tag":"v0.4.0","size_mb":3.1,"yanked":true}]},
  null,
  2
)

function JsonToRust() {
  const [rootName, setRootName] = useState('Package')
  const [publicFields, setPublicFields] = useState(true)

  return (
    <ConverterPage
      h1="JSON to Rust Struct Generator (serde)"
      intro="Paste JSON and get Rust structs with serde derives, nested types, Vec<T>, Option<T> and rename attributes. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="Rust"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${(rootName || 'root').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()}.rs`, mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Generate Rust',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToRust(data, rootName, publicFields)
            const count = (output.match(/^(pub )?struct /gm) || []).length
            return { output, message: `Generated ${count} Rust struct${count === 1 ? '' : 's'}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Struct name
            <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
          </label>
          <label className="option">
            Fields
            <select value={publicFields ? 'pub' : 'private'} onChange={(event) => setPublicFields(event.target.value === 'pub')}>
              <option value="pub">pub (public)</option>
              <option value="private">private</option>
            </select>
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Rust Converter?</h2>
        <p>
          In Rust, JSON is almost always read with <strong>serde</strong> and
          <strong> serde_json</strong>: you define structs, add
          <code> #[derive(Serialize, Deserialize)]</code>, and serde does the parsing. A
          JSON to Rust converter writes those structs from an example, with the
          right number types, <code>Vec</code> for arrays, <code>Option</code> for values that can be
          missing and <code>#[serde(rename)]</code> where a key is not a valid Rust name.
        </p>

        <h2>How to Convert JSON to Rust Structs</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Choose a struct name, and public or private fields.</li>
          <li>Click Generate Rust, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as a .rs file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "name": "rg-lite",
  "version": "0.4.1",
  "type": "binary",
  "downloads": 125034,
  "stable": true,
  "repository": {
    "url": "https://github.com/example/rg-lite",
    "stars": 842
  },
  "releases": [
    { "tag": "v0.4.1", "size_mb": 3.2 },
    { "tag": "v0.4.0", "size_mb": 3.1, "yanked": true }
  ]
}`}</Code>
        <Code label="Rust">{`use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub r#type: String,
    pub downloads: i64,
    pub stable: bool,
    pub repository: Repository,
    pub releases: Vec<Release>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Repository {
    pub url: String,
    pub stars: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Release {
    pub tag: String,
    pub size_mb: f64,
    pub yanked: Option<bool>,
}`}</Code>
        <p>
          <code>type</code> is a Rust keyword, so the field is the raw identifier
          <code> r#type</code>; serde drops the <code>r#</code> and still reads the JSON key
          <code> &quot;type&quot;</code>. <code>yanked</code> is <code>Option&lt;bool&gt;</code> because only one
          release has it, and serde sets it to <code>None</code> when the key is missing.
          <code> size_mb</code> is already snake_case, so it needs no rename.
        </p>

        <h2>How the Types Are Chosen</h2>
        <table>
          <thead>
            <tr><th>JSON value</th><th>Rust type</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td><code>String</code></td></tr>
            <tr><td>Whole number</td><td><code>i64</code>. Use <code>u64</code> or a smaller type like <code>u32</code> if you know the range.</td></tr>
            <tr><td>Number with decimals</td><td><code>f64</code></td></tr>
            <tr><td>true / false</td><td><code>bool</code></td></tr>
            <tr><td>Object</td><td>Its own struct, like <code>Repository</code></td></tr>
            <tr><td>Array</td><td><code>Vec&lt;T&gt;</code>, like <code>Vec&lt;Release&gt;</code></td></tr>
            <tr><td>Missing in some items, or null</td><td><code>Option&lt;T&gt;</code></td></tr>
            <tr><td>Only null, or mixed types</td><td><code>serde_json::Value</code>, which can hold any JSON. Replace it with the real type if you know it.</td></tr>
          </tbody>
        </table>
        <p>
          Keys in camelCase or with dashes, like <code>userName</code>, become snake_case fields
          with <code>#[serde(rename = &quot;userName&quot;)]</code>, so the code follows Rust naming
          rules and still matches the JSON.
        </p>

        <h2>Parse JSON in Rust</h2>
        <Code label="Cargo.toml">{`[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"`}</Code>
        <Code label="main.rs">{`fn main() -> Result<(), Box<dyn std::error::Error>> {
    let text = std::fs::read_to_string("package.json")?;
    let package: Package = serde_json::from_str(&text)?;
    println!("{} has {} releases", package.name, package.releases.len());

    // And back to JSON:
    let json = serde_json::to_string_pretty(&package)?;
    println!("{json}");
    Ok(())
}`}</Code>
        <p>
          serde ignores JSON keys that your struct does not have, so new fields in
          an API response do not break your code. Add
          <code> #[serde(deny_unknown_fields)]</code> to a struct if you want strict checking
          instead. If the JSON is an array at the top level, parse it as a
          <code> Vec</code> of the item struct.
        </p>

        <h2>Tips</h2>
        <ul>
          <li><strong>Numbers that are sometimes decimals:</strong> if a field is <code>3</code> in your sample but can be <code>3.5</code>, parsing it as <code>i64</code> fails. Change the type to <code>f64</code>.</li>
          <li><strong>Hide missing values when writing JSON:</strong> add <code>#[serde(skip_serializing_if = &quot;Option::is_none&quot;)]</code> above an <code>Option</code> field so <code>None</code> is left out instead of written as <code>null</code>.</li>
          <li><strong>Read the error.</strong> serde_json errors give the line and column and say which type was expected, for example <code>invalid type: string, expected i64</code>.</li>
          <li><strong>Check the JSON first.</strong> Fix broken JSON with <a href="/json-repair">JSON Repair</a> or find the exact error in the <a href="/json-validator">JSON Validator</a>.</li>
        </ul>
        <p>
          Your JSON never leaves your browser, so it is safe to paste real data.
          Need another language? Try <a href="/json-to-go">JSON to Go</a>,
          <a href="/json-to-swift"> JSON to Swift</a> or <a href="/json-to-typescript">JSON to TypeScript</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-rust']} />

        <RelatedTools
          links={[
            ['/json-to-go', 'JSON to Go'],
            ['/json-to-swift', 'JSON to Swift'],
            ['/json-to-kotlin', 'JSON to Kotlin'],
            ['/json-schema-generator', 'JSON Schema Generator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToRust
