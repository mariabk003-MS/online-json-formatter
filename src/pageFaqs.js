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
  'json-sorter': [
    ["What does a JSON sorter do?", "It puts the keys of every JSON object in alphabetical order, from A to Z or Z to A, at every level. The values stay the same."],
    ["Why sort JSON keys?", "Sorted keys make JSON easier to read, easier to compare in Git or a diff tool, and make it simple to spot missing or duplicate fields."],
    ["Are arrays sorted too?", "Array order is kept by default, because order matters in arrays. You can turn on the option to also sort simple arrays of text or numbers."],
    ["Is my JSON uploaded?", "No. Sorting happens in your browser and your data never leaves your device."],
  ],
  'json-to-typescript': [
    ["What does JSON to TypeScript do?", "It reads sample JSON and writes TypeScript interfaces that describe it, with the right types for strings, numbers, booleans, arrays and nested objects."],
    ["How are nested objects handled?", "Each nested object gets its own named interface, based on its key name. For example a key called address becomes an Address interface."],
    ["What about fields that are missing in some items?", "When an array has objects with different keys, keys that do not appear in every item are marked optional with a question mark."],
    ["Is my JSON sent to a server?", "No. The interfaces are generated in your browser. Your JSON is never uploaded."],
  ],
  'xml-formatter': [
    ["What does an XML formatter do?", "It adds line breaks and indentation to XML so the structure is easy to read. It can also minify XML into one line."],
    ["Will it check if my XML is valid?", "Yes. If the XML is not well-formed, for example a tag is not closed, the tool shows an error instead of a result."],
    ["Are comments and CDATA kept?", "Yes. Comments, CDATA sections, attributes and the XML declaration are all kept."],
    ["Is my XML uploaded?", "No. Formatting runs in your browser. Your XML stays on your device."],
  ],
  'yaml-formatter': [
    ["What does the YAML formatter do?", "It checks your YAML for errors and rewrites it with clean, consistent indentation."],
    ["How do I validate YAML?", "Paste your YAML and click Validate. If there is a problem, the tool shows the line and column and marks that line in red."],
    ["Will formatting remove my comments?", "Yes. Formatting rebuilds the YAML from its data, so comments are not kept. Use Validate if you only want to check the YAML and keep it unchanged."],
    ["Is my YAML uploaded?", "No. Everything runs in your browser."],
  ],
  'base64-encode-decode': [
    ["What is Base64?", "Base64 is a way to write any data using only letters, numbers, + and /. It is used to put data in URLs, emails, JSON fields, data URLs and HTTP headers."],
    ["Does it support emoji and other languages?", "Yes. Text is converted to UTF-8 first, so emoji and every language encode and decode correctly."],
    ["What is URL-safe Base64?", "URL-safe Base64 uses - and _ instead of + and / and drops the = padding, so the result can be used in links and file names. Turn on the option to use it."],
    ["Is my data uploaded?", "No. Encoding and decoding happen in your browser."],
  ],
  'url-encode-decode': [
    ["What is URL encoding?", "URL encoding (percent-encoding) replaces characters that are not allowed in links, like spaces, &, ? and emoji, with codes such as %20, so the link works everywhere."],
    ["When should I encode a full URL?", "Use the full URL option to keep characters like : / ? and & that give a link its structure. Leave it off to encode a single value, such as a search query."],
    ["Can it decode + as a space?", "Yes. When decoding, + signs are treated as spaces, as in form data and query strings."],
    ["Is my data uploaded?", "No. Everything runs in your browser."],
  ],
  'text-compare': [
    ["What does the text compare tool do?", "It compares two texts line by line and shows which lines were added, removed or stayed the same, with line numbers."],
    ["Can I ignore spaces or upper and lower case?", "Yes. Turn on Ignore spaces or Ignore case to skip differences you do not care about."],
    ["Is there a size limit?", "It works best with texts up to a few thousand lines each. Very large texts may take a moment to compare."],
    ["Is my text uploaded?", "No. The comparison runs in your browser and your text never leaves your device."],
  ],
}
