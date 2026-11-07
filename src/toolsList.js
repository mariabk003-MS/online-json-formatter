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
      { href: '/json-to-csv', label: 'JSON to CSV', text: 'Turn JSON into a spreadsheet file for Excel.' },
      { href: '/csv-to-json', label: 'CSV to JSON', text: 'Turn spreadsheet rows into clean JSON.' },
      { href: '/json-to-xml', label: 'JSON to XML', text: 'Convert JSON into well-formed XML.' },
      { href: '/xml-to-json', label: 'XML to JSON', text: 'Convert XML documents into JSON.' },
      { href: '/json-to-yaml', label: 'JSON to YAML', text: 'Convert JSON into readable YAML.' },
      { href: '/yaml-to-json', label: 'YAML to JSON', text: 'Convert YAML config files into JSON.' },
    ],
  },
  {
    title: 'Compare',
    tools: [
      { href: '/json-compare', label: 'JSON Compare', text: 'See what was added, removed or changed.' },
    ],
  },
  {
    title: 'Clean up',
    tools: [
      { href: '/json-minifier', label: 'JSON Minifier', text: 'Remove spaces to make JSON smaller.' },
      { href: '/json-repair', label: 'JSON Repair', text: 'Fix broken JSON automatically.' },
      { href: '/json-escape', label: 'JSON Escape / Unescape', text: 'Escape JSON into a string, or back.' },
    ],
  },
]

export const GUIDES = [
  { href: '/what-is-json', label: 'What Is JSON?' },
  { href: '/how-to-open-json-file', label: 'How to Open a JSON File' },
  { href: '/json-vs-xml', label: 'JSON vs XML' },
  { href: '/convert-json-to-excel', label: 'Convert JSON to Excel' },
  { href: '/common-json-errors', label: 'Common JSON Errors' },
]
