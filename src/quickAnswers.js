// A short, direct answer shown at the top of each guide. Search engines and AI
// assistants often quote exactly this kind of summary (answer engine optimization).
export const QUICK_ANSWERS = {
  'what-is-json':
    'JSON (JavaScript Object Notation) is a lightweight text format for storing and sending data as key-value pairs and lists. It is easy for people to read and for programs to parse, and it is the standard format for web APIs.',
  'json-syntax-rules':
    'JSON data is made of objects in { } and arrays in [ ], with keys in double quotes. A value can be a string in double quotes, a number, true, false, null, an object or an array. Trailing commas, comments, single quotes and undefined are not allowed.',
  'common-json-errors':
    'The most common JSON errors are trailing commas, missing commas, single quotes, keys without quotes, comments, and Python values like True or None. Paste the JSON into a validator to see the exact line, or let a repair tool fix these mistakes automatically.',
  'unexpected-token-in-json':
    "The parser found a character that is not allowed at that spot. The usual causes are an HTML page or a plain-text error sent instead of JSON (Unexpected token '<' or a word), single quotes, a trailing comma, or passing undefined to JSON.parse.",
  'pretty-print-json':
    'Pretty printing adds line breaks and indentation without changing the data. In Python use json.dumps(data, indent=2), in JavaScript JSON.stringify(data, null, 2), on the command line jq . file.json, and in VS Code press Shift + Alt + F.',
  'json-comments':
    'No. Standard JSON does not allow // or /* */ comments, and strict parsers reject them. Use a field like "_comment", keep notes in a README, or use JSONC, JSON5 or YAML for config files that need comments.',
  'json-in-python':
    'Use the built-in json module: json.loads(text) turns a JSON string into Python objects, json.load(f) reads a file, and json.dumps(obj, indent=2) or json.dump(obj, f) writes JSON. Open files with encoding="utf-8".',
  'javascript-json-parse':
    'Use JSON.parse(text) to turn a JSON string into a JavaScript value, and JSON.stringify(value, null, 2) to turn a value into formatted JSON text. Wrap JSON.parse in try...catch, because it throws a SyntaxError for invalid JSON.',
  'json-lines':
    'JSON Lines (JSONL) is a text format with one complete JSON value per line, usually one object per record. It is used for logs, data exports and streaming, because each line can be read and written on its own.',
  'how-to-open-json-file':
    'A JSON file is plain text, so any text editor can open it: Notepad on Windows, TextEdit on Mac, or VS Code. To read it comfortably, paste it into a JSON viewer or formatter, which adds indentation and shows the data as a tree.',
  'json-vs-xml':
    'JSON is shorter, easier to read and parsed natively by JavaScript, so it is the default for web APIs. XML supports attributes, namespaces and schemas, so it is still used for documents, RSS, SOAP and many enterprise and government formats.',
  'json-vs-yaml':
    'JSON and YAML can hold the same data. JSON uses braces and quotes and is strict, which suits APIs and data exchange. YAML uses indentation and allows comments, which suits hand-edited config files such as Docker Compose, Kubernetes and CI pipelines.',
  'json-vs-csv':
    'CSV is a flat table where every value is text, best for spreadsheets and simple exports. JSON is a tree with real types and nested data, best for APIs and apps. Choose CSV for tables people open in Excel, and JSON for anything nested or sent between programs.',
  'what-is-json-schema':
    "JSON Schema is a JSON document that describes what valid JSON must look like: required fields, value types and allowed values. Validators such as Ajv or Python's jsonschema use it to check data and report exactly which rule failed.",
  'json-to-csv-python':
    'With pandas: pd.read_json("data.json").to_csv("data.csv", index=False). Without pandas, load the file with json.load and write it with csv.DictWriter. For nested JSON, flatten it first with pd.json_normalize.',
  'import-json-into-database':
    'For a one-off import, turn the JSON into INSERT statements and run them. For repeated imports, let the database read the JSON (json_populate_recordset in PostgreSQL, JSON_TABLE in MySQL 8, json_each in SQLite) or load it with a short script.',
  'curl-post-json':
    "Add the header -H \"Content-Type: application/json\" and pass the JSON with -d: curl -H \"Content-Type: application/json\" -d '{\"name\":\"Emily\"}' URL. curl 7.82+ can use --json instead. On Windows, escape the inner quotes as \\\" or send a file with --data-binary @file.json.",
  'convert-json-to-excel':
    'The fastest way is an online converter that downloads a real .xlsx file. In Excel itself, use Data → Get Data → From File → From JSON (Power Query). For many files, use Python with pandas: pd.json_normalize(data).to_excel("data.xlsx").',
}
