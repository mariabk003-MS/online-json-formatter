// One list of every tool on the site. The menu, the All Tools page and the
// footer of the new pages are all built from this list, so links never go missing.
export const TOOL_GROUPS = [
  {
    title: 'Format & check',
    tools: [
      { href: '/', label: 'JSON Formatter', text: 'Beautify JSON and auto-fix common mistakes.' },
      { href: '/json-viewer', label: 'JSON Viewer', text: 'Explore JSON as a collapsible tree.' },
      { href: '/json-validator', label: 'JSON Validator', text: 'Find the exact line and column of any error.' },
    ],
  },
  {
    title: 'Convert',
    tools: [
      { href: '/json-to-csv', label: 'JSON to CSV', text: 'Turn JSON into a spreadsheet file.' },
      { href: '/csv-to-json', label: 'CSV to JSON', text: 'Turn spreadsheet rows into clean JSON.' },
      { href: '/json-to-excel', label: 'JSON to Excel', text: 'Download JSON as a real .xlsx file.' },
      { href: '/json-to-xml', label: 'JSON to XML', text: 'Convert JSON into well-formed XML.' },
      { href: '/xml-to-json', label: 'XML to JSON', text: 'Convert XML documents into JSON.' },
      { href: '/json-to-yaml', label: 'JSON to YAML', text: 'Convert JSON into readable YAML.' },
      { href: '/yaml-to-json', label: 'YAML to JSON', text: 'Convert YAML config files into JSON.' },
      { href: '/json-to-sql', label: 'JSON to SQL', text: 'Create CREATE TABLE and INSERT statements.' },
      { href: '/sql-to-json', label: 'SQL to JSON', text: 'Turn SQL INSERT statements into JSON.' },
    ],
  },
  {
    title: 'Generate code',
    tools: [
      { href: '/json-to-typescript', label: 'JSON to TypeScript', text: 'Generate TypeScript interfaces from JSON.' },
      { href: '/json-to-python', label: 'JSON to Python', text: 'Generate dataclasses or Pydantic models.' },
      { href: '/json-to-java', label: 'JSON to Java', text: 'Generate Java classes or records.' },
      { href: '/json-schema-generator', label: 'JSON Schema Generator', text: 'Create a JSON Schema from an example.' },
    ],
  },
  {
    title: 'Check & query',
    tools: [
      { href: '/json-schema-validator', label: 'JSON Schema Validator', text: 'Check JSON against a JSON Schema.' },
      { href: '/json-path', label: 'JSONPath Tester', text: 'Find values with JSONPath queries.' },
      { href: '/json-size-calculator', label: 'JSON Size Calculator', text: 'See bytes, minified and gzip size.' },
    ],
  },
  {
    title: 'Compare',
    tools: [
      { href: '/json-compare', label: 'JSON Compare', text: 'See what was added, removed or changed.' },
      { href: '/text-compare', label: 'Text Compare', text: 'Compare any two texts line by line.' },
    ],
  },
  {
    title: 'Clean up',
    tools: [
      { href: '/json-minifier', label: 'JSON Minifier', text: 'Remove spaces to make JSON smaller.' },
      { href: '/json-repair', label: 'JSON Repair', text: 'Fix broken JSON automatically.' },
      { href: '/json-sorter', label: 'JSON Sorter', text: 'Sort JSON keys from A to Z.' },
      { href: '/xml-formatter', label: 'XML Formatter', text: 'Beautify, validate or minify XML.' },
      { href: '/yaml-formatter', label: 'YAML Formatter', text: 'Validate and beautify YAML.' },
    ],
  },
  {
    title: 'Encode & decode',
    tools: [
      { href: '/json-escape', label: 'JSON Escape / Unescape', text: 'Escape JSON into a string, or back.' },
      { href: '/base64-encode-decode', label: 'Base64 Encode / Decode', text: 'Encode text to Base64, or decode it.' },
      { href: '/url-encode-decode', label: 'URL Encode / Decode', text: 'Percent-encode text for links, or decode it.' },
      { href: '/jwt-decoder', label: 'JWT Decoder', text: 'Read the header and payload of a JWT.' },
    ],
  },
]

export const GUIDES = [
  { href: '/what-is-json', label: 'What Is JSON?' },
  { href: '/json-syntax-rules', label: 'JSON Syntax Rules' },
  { href: '/common-json-errors', label: 'Common JSON Errors' },
  { href: '/json-comments', label: 'JSON Comments' },
  { href: '/json-in-python', label: 'JSON in Python' },
  { href: '/javascript-json-parse', label: 'JSON.parse in JavaScript' },
  { href: '/json-lines', label: 'JSON Lines (JSONL)' },
  { href: '/how-to-open-json-file', label: 'How to Open a JSON File' },
  { href: '/json-vs-xml', label: 'JSON vs XML' },
  { href: '/convert-json-to-excel', label: 'Convert JSON to Excel' },
]

export const DATASETS = [
  { href: '/http-status-codes-json', label: 'HTTP Status Codes', text: 'All HTTP status codes with meanings.' },
  { href: '/programming-languages-json', label: 'Programming Languages', text: 'Popular languages with years and creators.' },
  { href: '/file-extensions-json', label: 'File Extensions & MIME Types', text: 'Content types for common files.' },
  { href: '/package-json-template', label: 'package.json Template', text: 'A modern package.json, explained.' },
  { href: '/tsconfig-json-template', label: 'tsconfig.json Template', text: 'Recommended TypeScript settings.' },
]
