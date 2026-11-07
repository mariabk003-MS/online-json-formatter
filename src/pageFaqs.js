// FAQ text for the newer tool pages. The same text is shown on the page and
// written into each page's HTML as FAQ structured data for Google, so the two
// always match (Google requires that).
export const FAQS = {
  'xml-to-json': [
    ['Is this XML to JSON converter free?', 'Yes. It is free, needs no sign-up, and has no limits on how often you use it.'],
    ['How are XML attributes converted?', 'Attributes become keys that start with @, for example <book id="7"> becomes {"book": {"@id": 7}}. Text next to child elements is stored under #text.'],
    ['What happens to repeated tags?', 'When the same tag appears more than once inside a parent, the values are collected into a JSON array, so no data is lost.'],
    ['Is my XML uploaded to a server?', 'No. The conversion runs completely inside your browser using its built-in XML reader.'],
  ],
  'json-to-yaml': [
    ['Is this JSON to YAML converter free?', 'Yes. It is free to use, with no sign-up and no limits.'],
    ['Why convert JSON to YAML?', 'YAML is easier for people to read and edit, so it is used for config files in tools like Docker Compose, Kubernetes, GitHub Actions and many CI systems.'],
    ['Does the converter keep my data types?', 'Yes. Numbers, true/false, null, lists and nested objects are all kept. Text that could be mistaken for a number or a boolean is put in quotes.'],
    ['Is my JSON sent to a server?', 'No. Your JSON is converted inside your browser and never uploaded.'],
  ],
  'yaml-to-json': [
    ['Is this YAML to JSON converter free?', 'Yes. It is free, with no sign-up and no limits.'],
    ['Can it read files with several YAML documents?', 'Yes. If your YAML has more than one document separated by ---, the result is a JSON array with one item per document.'],
    ['What if my YAML has an error?', 'The tool shows the line and column of the problem and highlights that line in red, so you can fix it quickly.'],
    ['Is my YAML uploaded anywhere?', 'No. Everything runs in your browser. Your YAML never leaves your device.'],
  ],
  'json-escape': [
    ['What does it mean to escape JSON?', 'Escaping turns JSON into a single text string: quotes become \\", line breaks become \\n and backslashes are doubled. You need this when you put JSON inside another JSON value, a code string or an environment variable.'],
    ['How do I unescape a JSON string?', 'Paste the escaped text (with or without the outer quotes) and click Unescape. If the result is JSON, it is formatted for you.'],
    ['Is this tool free?', 'Yes. It is free to use and needs no sign-up.'],
    ['Is my data private?', 'Yes. The escaping and unescaping happen in your browser. Nothing is uploaded.'],
  ],
  'json-minifier': [
    ['What does a JSON minifier do?', 'It removes all spaces, tabs and line breaks that are not needed, so the JSON becomes one compact line. The data stays exactly the same.'],
    ['Why should I minify JSON?', 'Smaller JSON loads faster, uses less bandwidth in APIs and takes less space in storage and config files.'],
    ['Can it minify JSON that has errors?', 'Yes, for common mistakes. Trailing commas, missing commas, single quotes and comments are fixed automatically before minifying.'],
    ['Is my JSON uploaded?', 'No. The minifier runs in your browser and your data never leaves your device.'],
  ],
  'json-repair': [
    ['What can the JSON repair tool fix?', 'It fixes missing or extra commas, missing colons, single or curly quotes, keys without quotes, // and /* */ comments, line breaks inside strings, Python True/False/None, missing quotes and missing closing brackets.'],
    ['Will it change my data?', 'No. Text inside your strings is never changed, except that real line breaks and tabs are turned into \\n and \\t, which JSON requires.'],
    ['What if the JSON cannot be repaired?', 'The tool shows the line and column where the problem is and highlights it, so you can fix the rest by hand.'],
    ['Is my JSON sent to a server?', 'No. The repair runs in your browser. Your JSON stays on your device.'],
  ],
}
