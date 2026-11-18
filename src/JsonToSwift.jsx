import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToSwift } from './swiftGen.js'

const SAMPLE = JSON.stringify(
  {"city":"London","temp_c":11.5,"feels_like_c":9,"is_day":true,"wind":{"speed_kph":18.4,"direction":"SW"},"hourly":[{"time":"09:00","temp_c":10},{"time":"10:00","temp_c":11.2,"rain_mm":0.4}]},
  null,
  2
)

function JsonToSwift() {
  const [rootName, setRootName] = useState('Weather')
  const [mutable, setMutable] = useState(false)

  return (
    <ConverterPage
      h1="JSON to Swift Codable Struct Generator"
      intro="Paste JSON and get Swift structs that conform to Codable, with nested types, arrays, optionals and CodingKeys for snake_case keys. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="Swift"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${rootName || 'Root'}.swift`, mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Generate Swift',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToSwift(data, rootName, mutable)
            const count = (output.match(/^struct /gm) || []).length
            return { output, message: `Generated ${count} Swift struct${count === 1 ? '' : 's'}.` }
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
            Properties
            <select value={mutable ? 'var' : 'let'} onChange={(event) => setMutable(event.target.value === 'var')}>
              <option value="let">let (read-only)</option>
              <option value="var">var (can change)</option>
            </select>
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Swift Converter?</h2>
        <p>
          iOS and macOS apps read JSON with Swift&apos;s <code>Codable</code> protocol: you describe
          the data as structs, and <code>JSONDecoder</code> fills them in. A JSON to Swift
          converter writes those structs for you from an example response, with
          the right types, optionals for values that can be missing and
          <code> CodingKeys</code> wherever a JSON key is not a valid Swift name.
        </p>

        <h2>How to Convert JSON to Swift Structs</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Choose a struct name, and <code>let</code> or <code>var</code> properties.</li>
          <li>Click Generate Swift, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as a .swift file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "city": "London",
  "temp_c": 11.5,
  "feels_like_c": 9,
  "is_day": true,
  "wind": {
    "speed_kph": 18.4,
    "direction": "SW"
  },
  "hourly": [
    { "time": "09:00", "temp_c": 10 },
    { "time": "10:00", "temp_c": 11.2, "rain_mm": 0.4 }
  ]
}`}</Code>
        <Code label="Swift">{`import Foundation

struct Weather: Codable {
    let city: String
    let tempC: Double
    let feelsLikeC: Int
    let isDay: Bool
    let wind: Wind
    let hourly: [HourlyItem]

    enum CodingKeys: String, CodingKey {
        case city
        case tempC = "temp_c"
        case feelsLikeC = "feels_like_c"
        case isDay = "is_day"
        case wind
        case hourly
    }
}

struct Wind: Codable {
    let speedKph: Double
    let direction: String

    enum CodingKeys: String, CodingKey {
        case speedKph = "speed_kph"
        case direction
    }
}

struct HourlyItem: Codable {
    let time: String
    let tempC: Double
    let rainMm: Double?

    enum CodingKeys: String, CodingKey {
        case time
        case tempC = "temp_c"
        case rainMm = "rain_mm"
    }
}`}</Code>
        <p>
          <code>temp_c</code> becomes <code>tempC</code>, and <code>CodingKeys</code> maps it back to the
          JSON key. In <code>hourly</code>, <code>temp_c</code> is <code>10</code> in one item and
          <code> 11.2</code> in the other, so it is a <code>Double</code>. <code>rain_mm</code> is
          <code> Double?</code> because only one hour has it. <code>feels_like_c</code> is an
          <code> Int</code> because the sample only shows a whole number: see the tips if it can
          have decimals.
        </p>

        <h2>How the Types Are Chosen</h2>
        <table>
          <thead>
            <tr><th>JSON value</th><th>Swift type</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td><code>String</code></td></tr>
            <tr><td>Whole number</td><td><code>Int</code> (64-bit on every current Apple device)</td></tr>
            <tr><td>Number with decimals</td><td><code>Double</code></td></tr>
            <tr><td>true / false</td><td><code>Bool</code></td></tr>
            <tr><td>Object</td><td>Its own struct, like <code>Wind</code></td></tr>
            <tr><td>Array</td><td><code>[T]</code>, like <code>[HourlyItem]</code></td></tr>
            <tr><td>Missing in some items, or null</td><td>An optional, like <code>Double?</code></td></tr>
            <tr><td>Only null, or mixed types</td><td><code>JSONValue?</code>, a small Codable enum the converter adds to the code. Replace it with the real type if you know it.</td></tr>
          </tbody>
        </table>
        <p>
          Two details are handled for you. Struct names that would clash with
          Swift or Foundation types get a suffix, so a <code>&quot;data&quot;</code> object
          becomes <code>DataModel</code> instead of hiding Foundation&apos;s <code>Data</code>. Keys that
          are Swift keywords, like <code>default</code>, are written in backticks.
        </p>

        <h2>Decode JSON in Swift</h2>
        <Code label="JSONDecoder with URLSession">{`import Foundation

func fetchWeather() async throws -> Weather {
    let url = URL(string: "https://api.example.com/weather?city=London")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(Weather.self, from: data)
}`}</Code>
        <p>
          For a JSON string you already have, use <code>Data(text.utf8)</code> as the data. If
          the JSON is an array at the top level, decode the array type, for example
          <code> [HourlyItem].self</code>. To turn a struct back into JSON, use
          <code> JSONEncoder().encode(weather)</code>.
        </p>
        <p>
          Prefer no <code>CodingKeys</code>? Set <code>decoder.keyDecodingStrategy = .convertFromSnakeCase</code>
          and delete the enums. That works for plain snake_case keys like <code>temp_c</code>, but
          not for keys with dashes or other characters, so the converter keeps the explicit keys.
        </p>

        <h2>Tips</h2>
        <ul>
          <li><strong>Numbers that are sometimes decimals:</strong> if a field is <code>9</code> in your sample but can be <code>9.5</code> in real data, decoding it as <code>Int</code> fails. Change the type to <code>Double</code>.</li>
          <li><strong>Dates:</strong> date strings stay <code>String</code>. For ISO 8601 values like <code>2026-11-18T09:30:00Z</code>, change the type to <code>Date</code> and set <code>decoder.dateDecodingStrategy = .iso8601</code>.</li>
          <li><strong>Read the error.</strong> When decoding fails, print the error: a <code>DecodingError</code> names the key and the type that did not match.</li>
          <li><strong>Check the JSON first.</strong> Broken JSON fails before any struct is filled. Fix it with <a href="/json-repair">JSON Repair</a> or find the error in the <a href="/json-validator">JSON Validator</a>.</li>
        </ul>
        <p>
          Your JSON never leaves your browser, so it is safe to paste real API
          responses. Building for Android too? Try <a href="/json-to-kotlin">JSON to Kotlin</a>
          or <a href="/json-to-dart">JSON to Dart</a> for Flutter.
        </p>

        <FaqSection faqs={FAQS['json-to-swift']} />

        <RelatedTools
          links={[
            ['/json-to-kotlin', 'JSON to Kotlin'],
            ['/json-to-dart', 'JSON to Dart'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-schema-generator', 'JSON Schema Generator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToSwift
