import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToDart } from './dartGen.js'

const SAMPLE = JSON.stringify(
  {"id":312,"title":"Garlic Butter Pasta","rating":4.7,"is_vegan":false,"photo_url":null,"tags":["quick","dinner"],"author":{"name":"Olivia Brown","verified":true},"ingredients":[{"name":"Spaghetti","grams":200},{"name":"Garlic","grams":15,"optional":false}]},
  null,
  2
)

function JsonToDart() {
  const [rootName, setRootName] = useState('Recipe')
  const [style, setStyle] = useState('plain')

  return (
    <ConverterPage
      h1="JSON to Dart Model Generator for Flutter"
      intro="Paste JSON and get Dart classes with fromJson and toJson, nested models, List<T> and null safety, written by hand or for json_serializable. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="Dart"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${(rootName || 'root').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()}.dart`, mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Generate Dart',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToDart(data, rootName, style)
            const count = (output.match(/^class /gm) || []).length
            return { output, message: `Generated ${count} Dart class${count === 1 ? '' : 'es'}.` }
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
            Style
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="plain">fromJson / toJson (no packages)</option>
              <option value="json_serializable">json_serializable</option>
            </select>
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Dart Converter?</h2>
        <p>
          Flutter apps get their data as JSON, but Dart code works best with
          typed classes. A JSON to Dart converter reads an example response and
          writes those model classes for you: one class per object, the right
          types, null safety for values that can be missing, and the
          <code> fromJson</code> and <code>toJson</code> methods that turn JSON into objects and back.
        </p>

        <h2>How to Convert JSON to Dart Classes</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Choose a class name and a style: plain <code>fromJson</code>/<code>toJson</code>, or json_serializable.</li>
          <li>Click Generate Dart, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as a .dart file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "id": 312,
  "title": "Garlic Butter Pasta",
  "rating": 4.7,
  "is_vegan": false,
  "photo_url": null,
  "tags": ["quick", "dinner"],
  "author": {
    "name": "Olivia Brown",
    "verified": true
  },
  "ingredients": [
    { "name": "Spaghetti", "grams": 200 },
    { "name": "Garlic", "grams": 15, "optional": false }
  ]
}`}</Code>
        <Code label="Dart (fromJson / toJson)">{`class Recipe {
  final int id;
  final String title;
  final double rating;
  final bool isVegan;
  final dynamic photoUrl;
  final List<String> tags;
  final Author author;
  final List<Ingredient> ingredients;

  Recipe({
    required this.id,
    required this.title,
    required this.rating,
    required this.isVegan,
    this.photoUrl,
    required this.tags,
    required this.author,
    required this.ingredients,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) => Recipe(
        id: json['id'] as int,
        title: json['title'] as String,
        rating: (json['rating'] as num).toDouble(),
        isVegan: json['is_vegan'] as bool,
        photoUrl: json['photo_url'],
        tags: (json['tags'] as List<dynamic>).map((e) => e as String).toList(),
        author: Author.fromJson(json['author'] as Map<String, dynamic>),
        ingredients: (json['ingredients'] as List<dynamic>).map((e) => Ingredient.fromJson(e as Map<String, dynamic>)).toList(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'rating': rating,
        'is_vegan': isVegan,
        'photo_url': photoUrl,
        'tags': tags,
        'author': author.toJson(),
        'ingredients': ingredients.map((e) => e.toJson()).toList(),
      };
}

class Author {
  final String name;
  final bool verified;

  Author({
    required this.name,
    required this.verified,
  });

  factory Author.fromJson(Map<String, dynamic> json) => Author(
        name: json['name'] as String,
        verified: json['verified'] as bool,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'verified': verified,
      };
}

class Ingredient {
  final String name;
  final int grams;
  final bool? optional;

  Ingredient({
    required this.name,
    required this.grams,
    this.optional,
  });

  factory Ingredient.fromJson(Map<String, dynamic> json) => Ingredient(
        name: json['name'] as String,
        grams: json['grams'] as int,
        optional: json['optional'] as bool?,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'grams': grams,
        'optional': optional,
      };
}`}</Code>
        <p>
          <code>is_vegan</code> becomes the Dart-style name <code>isVegan</code> while
          <code> fromJson</code> still reads the original key. <code>optional</code> is
          <code> bool?</code> and not <code>required</code>, because only one ingredient has it.
          <code> photo_url</code> is always null in the sample, so its type is unknown and stays
          <code> dynamic</code>: change it to <code>String?</code> if it holds a URL.
        </p>

        <h2>How the Types Are Chosen</h2>
        <table>
          <thead>
            <tr><th>JSON value</th><th>Dart type</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td><code>String</code></td></tr>
            <tr><td>Whole number</td><td><code>int</code></td></tr>
            <tr><td>Number with decimals</td><td><code>double</code>, read with <code>(value as num).toDouble()</code></td></tr>
            <tr><td>true / false</td><td><code>bool</code></td></tr>
            <tr><td>Object</td><td>Its own class, like <code>Author</code></td></tr>
            <tr><td>Array</td><td><code>List&lt;T&gt;</code>, like <code>List&lt;Ingredient&gt;</code></td></tr>
            <tr><td>Missing in some items, or null</td><td>A nullable type, like <code>int?</code>, and an optional constructor parameter</td></tr>
            <tr><td>Only null, or mixed types</td><td><code>dynamic</code>. Replace it with the real type if you know it.</td></tr>
          </tbody>
        </table>
        <p>
          Why <code>(value as num).toDouble()</code>? Dart decodes a JSON number without a
          decimal point, like <code>5</code>, as an <code>int</code>. A plain <code>as double</code> would
          throw for that value, so the code accepts any number and converts it.
        </p>

        <h2>Use the Model in Flutter</h2>
        <Code label="Decode a response with the http package">{`import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Recipe> fetchRecipe() async {
  final response = await http.get(Uri.parse('https://api.example.com/recipes/312'));
  if (response.statusCode != 200) {
    throw Exception('Request failed: \${response.statusCode}');
  }
  return Recipe.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
}`}</Code>
        <p>
          To send it back, call <code>jsonEncode(recipe)</code>: <code>jsonEncode</code> calls your
          <code> toJson()</code> method automatically. If the JSON is an array at the top level,
          map each item: <code>(jsonDecode(body) as List&lt;dynamic&gt;).map((e) =&gt; Recipe.fromJson(e as Map&lt;String, dynamic&gt;)).toList()</code>.
        </p>

        <h2>Plain fromJson or json_serializable?</h2>
        <ul>
          <li><strong>Plain fromJson / toJson</strong> needs no packages and no build step. Every line is visible, which makes it easy to adjust a field by hand. Good for small apps and a handful of models.</li>
          <li><strong>json_serializable</strong> writes the conversion code for you in a <code>.g.dart</code> file. Add <code>json_annotation</code> to your dependencies and <code>json_serializable</code> plus <code>build_runner</code> to your dev dependencies, then run <code>dart run build_runner build</code>. The <code>part &apos;recipe.g.dart&apos;;</code> line must match your file name, so save the code as <code>recipe.dart</code>.</li>
        </ul>

        <h2>Tips</h2>
        <ul>
          <li><strong>Numbers that are sometimes decimals:</strong> if a field is <code>5</code> in your sample but can be <code>5.5</code> in real data, <code>as int</code> will throw. Change the type to <code>double</code> or <code>num</code>.</li>
          <li><strong>Dates:</strong> date strings stay <code>String</code>. Parse ISO 8601 values like <code>2026-11-18T09:30:00Z</code> with <code>DateTime.parse()</code>.</li>
          <li><strong>Use a complete sample.</strong> The generator only sees the fields in your example, so include an item that has every optional field.</li>
          <li><strong>Check the JSON first.</strong> <code>jsonDecode</code> throws a FormatException on broken JSON. Fix it with <a href="/json-repair">JSON Repair</a> or find the error in the <a href="/json-validator">JSON Validator</a>.</li>
        </ul>
        <p>
          Your JSON never leaves your browser, so it is safe to paste real API
          responses. Building the backend too? Try <a href="/json-to-kotlin">JSON to Kotlin</a>,
          <a href="/json-to-typescript"> JSON to TypeScript</a> or <a href="/json-to-go">JSON to Go</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-dart']} />

        <RelatedTools
          links={[
            ['/json-to-kotlin', 'JSON to Kotlin'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-to-java', 'JSON to Java'],
            ['/json-schema-generator', 'JSON Schema Generator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToDart
