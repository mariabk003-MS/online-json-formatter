import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToKotlin } from './kotlinGen.js'

const SAMPLE = JSON.stringify(
  {"id":4821,"user_name":"emily_clark","display_name":"Emily Clark","verified":true,"rating":4.8,"avatar_url":null,"settings":{"dark_mode":true,"language":"en"},"followers":[{"id":17,"user_name":"james_s"},{"id":23,"user_name":"olivia_b","mutual":true}]},
  null,
  2
)

function JsonToKotlin() {
  const [rootName, setRootName] = useState('Profile')
  const [library, setLibrary] = useState('kotlinx')

  return (
    <ConverterPage
      h1="JSON to Kotlin Data Class Generator"
      intro="Paste JSON and get Kotlin data classes with nested types, List<T>, nullable fields and kotlinx.serialization, Gson or Moshi annotations. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="Kotlin"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${rootName || 'Root'}.kt`, mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Generate Kotlin',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToKotlin(data, rootName, library)
            const count = (output.match(/^(data )?class /gm) || []).length
            return { output, message: `Generated ${count} Kotlin class${count === 1 ? '' : 'es'}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Class name
            <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
          </label>
          <label className="option">
            Library
            <select value={library} onChange={(event) => setLibrary(event.target.value)}>
              <option value="kotlinx">kotlinx.serialization</option>
              <option value="gson">Gson</option>
              <option value="moshi">Moshi</option>
              <option value="none">None (plain data classes)</option>
            </select>
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Kotlin Converter?</h2>
        <p>
          A JSON to Kotlin converter reads example JSON, like a response from
          your backend, and writes Kotlin data classes that match it: the right
          types, a class for every nested object, lists for arrays and nullable
          types for values that can be missing. It is the quickest way to get
          model classes for an Android app or a Ktor service without typing
          every property by hand.
        </p>

        <h2>How to Convert JSON to Kotlin Data Classes</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Choose a class name and the library your project uses: kotlinx.serialization, Gson or Moshi.</li>
          <li>Click Generate Kotlin, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as a .kt file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "id": 4821,
  "user_name": "emily_clark",
  "display_name": "Emily Clark",
  "verified": true,
  "rating": 4.8,
  "avatar_url": null,
  "settings": {
    "dark_mode": true,
    "language": "en"
  },
  "followers": [
    {
      "id": 17,
      "user_name": "james_s"
    },
    {
      "id": 23,
      "user_name": "olivia_b",
      "mutual": true
    }
  ]
}`}</Code>
        <Code label="Kotlin (kotlinx.serialization)">{`import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class Profile(
    val id: Long,
    @SerialName("user_name")
    val userName: String,
    @SerialName("display_name")
    val displayName: String,
    val verified: Boolean,
    val rating: Double,
    @SerialName("avatar_url")
    val avatarUrl: JsonElement? = null,
    val settings: Settings,
    val followers: List<Follower>,
)

@Serializable
data class Settings(
    @SerialName("dark_mode")
    val darkMode: Boolean,
    val language: String,
)

@Serializable
data class Follower(
    val id: Long,
    @SerialName("user_name")
    val userName: String,
    val mutual: Boolean? = null,
)`}</Code>
        <p>
          Snake_case keys like <code>user_name</code> become camelCase properties
          (<code>userName</code>) with <code>@SerialName</code> keeping the original key. The
          <code> followers</code> array becomes <code>List&lt;Follower&gt;</code>, and
          <code> mutual</code> is <code>Boolean? = null</code> because only one follower has it.
          <code> avatar_url</code> is always null in the sample, so its real type is unknown:
          change <code>JsonElement?</code> to <code>String?</code> if it holds a URL.
        </p>

        <h2>How the Types Are Chosen</h2>
        <table>
          <thead>
            <tr><th>JSON value</th><th>Kotlin type</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td><code>String</code></td></tr>
            <tr><td>Whole number</td><td><code>Long</code>, so IDs above 2,147,483,647 never overflow. Change it to <code>Int</code> if your values are small.</td></tr>
            <tr><td>Number with decimals</td><td><code>Double</code></td></tr>
            <tr><td>true / false</td><td><code>Boolean</code></td></tr>
            <tr><td>Object</td><td>Its own data class, like <code>Settings</code></td></tr>
            <tr><td>Array</td><td><code>List&lt;T&gt;</code>, like <code>List&lt;Follower&gt;</code></td></tr>
            <tr><td>Missing in some items, or null</td><td>A nullable type with a default, like <code>String? = null</code></td></tr>
            <tr><td>Only null, or mixed types</td><td><code>JsonElement?</code> with kotlinx.serialization, <code>Any?</code> otherwise. Replace it with the real type if you know it.</td></tr>
          </tbody>
        </table>
        <p>
          Kotlin keywords used as keys, like <code>class</code> or <code>in</code>, are written in
          backticks (<code>val `class`: String</code>), so the code still compiles.
        </p>

        <h2>Decode JSON in Kotlin</h2>
        <Code label="kotlinx.serialization">{`import kotlinx.serialization.json.Json

val json = Json { ignoreUnknownKeys = true }
val profile = json.decodeFromString(Profile.serializer(), text)

println(profile.settings.language)   // en`}</Code>
        <p>
          kotlinx.serialization needs the <code>kotlin(&quot;plugin.serialization&quot;)</code> Gradle
          plugin and the <code>kotlinx-serialization-json</code> library. By default it throws an
          error when the JSON has a key your class does not, so
          <code> ignoreUnknownKeys = true</code> is a good idea for API responses that may grow.
        </p>
        <Code label="Gson">{`import com.google.gson.Gson

val profile = Gson().fromJson(text, Profile::class.java)`}</Code>
        <Code label="Moshi">{`import com.squareup.moshi.Moshi

val moshi = Moshi.Builder().build()
val profile = moshi.adapter(Profile::class.java).fromJson(text)`}</Code>
        <p>
          The <code>@JsonClass(generateAdapter = true)</code> annotation tells Moshi&apos;s code
          generator (moshi-kotlin-codegen, run with KSP) to write a fast adapter for each class.
          If the JSON is an array at the top level, decode it as a <code>List</code> of the item class.
        </p>

        <h2>Which Library Should You Pick?</h2>
        <ul>
          <li><strong>kotlinx.serialization</strong> is made by JetBrains, works on Android, the JVM and Kotlin Multiplatform, and respects Kotlin&apos;s null safety and default values. A good default for new projects.</li>
          <li><strong>Moshi</strong> is popular in Android apps that use Retrofit, and its code generator also understands nullable types and defaults.</li>
          <li><strong>Gson</strong> is common in older Android projects. It creates objects without calling the constructor, so default values are ignored and a missing key can leave <code>null</code> in a property you declared as non-null. Check those fields, or prefer one of the other two for new code.</li>
        </ul>

        <h2>Tips</h2>
        <ul>
          <li><strong>Dates:</strong> date strings stay <code>String</code>. Parse ISO 8601 values like <code>2026-11-18T09:30:00Z</code> with <code>java.time.Instant.parse()</code>, or use a date serializer for your library.</li>
          <li><strong>Use a complete sample.</strong> The generator only sees the fields in your example. Include an item that has every optional field if you can.</li>
          <li><strong>Check the JSON first.</strong> Broken JSON makes every library throw. Fix it with <a href="/json-repair">JSON Repair</a> or find the exact error in the <a href="/json-validator">JSON Validator</a>.</li>
        </ul>
        <p>
          Your JSON never leaves your browser, so it is safe to paste real API
          responses. Need another language? Try <a href="/json-to-java">JSON to Java</a>,
          <a href="/json-to-typescript"> JSON to TypeScript</a> or <a href="/json-to-go">JSON to Go</a>.
          For iOS and Flutter apps, use <a href="/json-to-swift">JSON to Swift</a> or <a href="/json-to-dart">JSON to Dart</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-kotlin']} />

        <RelatedTools
          links={[
            ['/json-to-java', 'JSON to Java'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-to-csharp', 'JSON to C#'],
            ['/json-schema-generator', 'JSON Schema Generator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToKotlin
