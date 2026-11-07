import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'

// "42" → 42, "true" → true; other text stays text (also "007").
function convertValue(text, convertTypes) {
  if (!convertTypes) return text
  if (text === 'true') return true
  if (text === 'false') return false
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(text)) return Number(text)
  return text
}

// Turns one XML element into a JSON value.
//  - attributes  → "@name"
//  - text        → the value itself, or "#text" when there are also attributes/children
//  - repeated child tags → an array
function elementToJson(element, convertTypes) {
  const result = {}
  const arrays = new Set()

  for (const attr of element.attributes) {
    result['@' + attr.name] = convertValue(attr.value, convertTypes)
  }

  const text = [...element.childNodes]
    .filter((node) => node.nodeType === 3 || node.nodeType === 4) // text and CDATA
    .map((node) => node.nodeValue)
    .join('')
    .trim()

  const children = [...element.children]
  if (children.length === 0 && element.attributes.length === 0) {
    return convertValue(text, convertTypes)
  }

  for (const child of children) {
    const name = child.tagName
    const value = elementToJson(child, convertTypes)
    if (!(name in result)) {
      result[name] = value
    } else if (arrays.has(name)) {
      result[name].push(value)
    } else {
      result[name] = [result[name], value]
      arrays.add(name)
    }
  }

  if (text) result['#text'] = convertValue(text, convertTypes)
  return result
}

function xmlToJson(xmlText, convertTypes) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
  const problem = doc.getElementsByTagName('parsererror')[0]
  if (problem) {
    const detail = (problem.textContent || '').split('\n').find((line) => line.trim()) || ''
    throw new Error(`This is not valid XML. ${detail.trim()}`)
  }
  const root = doc.documentElement
  return { [root.tagName]: elementToJson(root, convertTypes) }
}

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<store name="Book Corner">
  <city>London</city>
  <open>true</open>
  <book id="1">
    <title>Learn JSON</title>
    <price>12.99</price>
  </book>
  <book id="2">
    <title>XML Basics</title>
    <price>9.50</price>
  </book>
</store>`

function XmlToJson() {
  const [convertTypes, setConvertTypes] = useState(true)

  return (
    <ConverterPage
      h1="XML to JSON Converter"
      intro="Convert XML into clean, formatted JSON. Attributes, repeated tags and nested elements are all kept."
      inputTitle="XML Input"
      outputTitle="JSON Result"
      inputIsJson={false}
      inputPlaceholder="Paste your XML here, or drop a .xml file..."
      inputAccept=".xml,.txt,application/xml,text/xml,text/plain"
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'converted.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Convert to JSON',
          run: (text) => {
            const data = xmlToJson(text, convertTypes)
            return {
              output: JSON.stringify(data, null, 2),
              message: 'Converted to JSON successfully!',
            }
          },
        },
      ]}
      options={
        <label className="option">
          <input
            type="checkbox"
            checked={convertTypes}
            onChange={(event) => setConvertTypes(event.target.checked)}
          />
          Convert numbers and true/false
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is an XML to JSON Converter?</h2>
        <p>
          An XML to JSON converter reads an XML document and writes the same
          data as JSON. JSON is the format most web apps and APIs use today,
          so converting XML makes old feeds, config files and API responses
          easy to use in JavaScript, Python and other modern tools.
        </p>

        <h2>How to Convert XML to JSON</h2>
        <ol>
          <li>Paste your XML into the XML Input box, click Upload, or drop a .xml file on the box.</li>
          <li>Click Convert to JSON, or press Ctrl + Enter.</li>
          <li>Check the colored JSON result, then click Copy or Download.</li>
        </ol>

        <h2>How the Conversion Works</h2>
        <ul>
          <li>Every XML element becomes a JSON key with the same name.</li>
          <li>Attributes become keys that start with @, like &quot;@id&quot;.</li>
          <li>Repeated elements, like several &lt;book&gt; tags, become a JSON array.</li>
          <li>Numbers and true/false become real JSON numbers and booleans (you can turn this off).</li>
          <li>Text next to child elements is kept under &quot;#text&quot;.</li>
        </ul>

        <FaqSection faqs={FAQS['xml-to-json']} />

        <RelatedTools
          links={[
            ['/json-to-xml', 'JSON to XML'],
            ['/json-to-yaml', 'JSON to YAML'],
            ['/', 'JSON Formatter'],
            ['/json-vs-xml', 'JSON vs XML guide'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default XmlToJson
