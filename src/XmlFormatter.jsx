import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'

const escapeText = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeAttr = (text) => escapeText(text).replace(/"/g, '&quot;')

// Checks the XML and returns the parsed document, or throws a friendly error.
function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  const problem = doc.getElementsByTagName('parsererror')[0]
  if (problem) {
    const detail = (problem.textContent || '').split('\n').find((line) => line.trim()) || ''
    throw new Error(`This is not valid XML. ${detail.trim()}`)
  }
  return doc
}

// Writes the XML again with the chosen indent ('' = minified, all on one line).
function formatXml(text, indent) {
  const doc = parseXml(text)
  const newline = indent ? '\n' : ''

  function write(node, depth) {
    const pad = indent.repeat(depth)
    switch (node.nodeType) {
      case 1: {
        const attrs = [...node.attributes].map((a) => ` ${a.name}="${escapeAttr(a.value)}"`).join('')
        const children = [...node.childNodes].filter(
          (child) => !(child.nodeType === 3 && !child.nodeValue.trim())
        )
        if (children.length === 0) return `${pad}<${node.tagName}${attrs}/>`
        if (children.length === 1 && (children[0].nodeType === 3 || children[0].nodeType === 4)) {
          return `${pad}<${node.tagName}${attrs}>${write(children[0], 0).trim()}</${node.tagName}>`
        }
        const inner = children.map((child) => write(child, depth + 1)).join(newline)
        return `${pad}<${node.tagName}${attrs}>${newline}${inner}${newline}${pad}</${node.tagName}>`
      }
      case 3:
        return pad + escapeText(node.nodeValue.trim())
      case 4:
        return `${pad}<![CDATA[${node.nodeValue}]]>`
      case 7:
        return `${pad}<?${node.target} ${node.data}?>`
      case 8:
        return `${pad}<!--${node.nodeValue}-->`
      case 10:
        return `${pad}<!DOCTYPE ${node.name}>`
      default:
        return ''
    }
  }

  const declaration = text.match(/^\s*(<\?xml[^>]*\?>)/)
  const parts = [...doc.childNodes].map((node) => write(node, 0)).filter(Boolean)
  if (declaration) parts.unshift(declaration[1])
  return parts.join(newline)
}

const SAMPLE =
  '<?xml version="1.0" encoding="UTF-8"?><catalog><!-- Books in stock --><book id="1" lang="en"><title>Learn JSON</title><author>Emily Clark</author><price currency="GBP">12.99</price></book><book id="2" lang="en"><title>XML Basics</title><author>James Smith</author><price currency="GBP">9.50</price><note><![CDATA[Use <tags> & "quotes" freely]]></note></book></catalog>'

function XmlFormatter() {
  const [indent, setIndent] = useState('2')
  const indentText = indent === 'tab' ? '\t' : ' '.repeat(Number(indent))

  return (
    <ConverterPage
      h1="XML Formatter & Beautifier Online"
      intro="Beautify messy XML with clean indentation, check that it is well-formed, or minify it into one line."
      inputTitle="XML Input"
      outputTitle="Formatted XML"
      inputIsJson={false}
      inputPlaceholder="Paste your XML here, or drop a .xml file..."
      inputAccept=".xml,.txt,application/xml,text/xml,text/plain"
      sample={SAMPLE}
      outputType="xml"
      download={{ fileName: 'formatted.xml', mimeType: 'application/xml' }}
      actions={[
        {
          label: 'Format XML',
          run: (text) => ({ output: formatXml(text, indentText), type: 'xml', message: 'Valid XML. Formatted successfully!' }),
        },
        {
          label: 'Minify',
          run: (text) => ({ output: formatXml(text, ''), type: 'plain', message: 'Valid XML. Minified into one line.' }),
        },
      ]}
      options={
        <label className="option">
          Indent
          <select value={indent} onChange={(event) => setIndent(event.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is an XML Formatter?</h2>
        <p>
          An XML formatter (or XML beautifier) adds line breaks and indentation
          to XML so every element sits on its own line under its parent. This
          makes long, one-line XML from APIs, feeds and config files easy to
          read and debug. The formatter also checks that the XML is
          well-formed.
        </p>

        <h2>How to Format XML</h2>
        <ol>
          <li>Paste your XML, click Upload, or drop a .xml file on the box.</li>
          <li>Choose 2 spaces, 4 spaces or Tab.</li>
          <li>Click Format XML, or Minify to put it on one line.</li>
          <li>Click Copy or Download to save the result.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Checks that the XML is well-formed and shows an error if not.</li>
          <li>Keeps attributes, comments, CDATA and the XML declaration.</li>
          <li>Colored result with line numbers.</li>
          <li>Minify option to remove all extra spaces.</li>
          <li>Runs in your browser. Your XML is never uploaded.</li>
        </ul>

        <h2>Example</h2>
        <Code label="Before">{`<order id="7"><customer>Emily Clark</customer><items><item sku="A1">Notebook</item><item sku="B2"/></items></order>`}</Code>
        <Code label="After (2 spaces)">{`<order id="7">
  <customer>Emily Clark</customer>
  <items>
    <item sku="A1">Notebook</item>
    <item sku="B2"/>
  </items>
</order>`}</Code>

        <h2>What Makes XML Well-Formed?</h2>
        <p>If the formatter shows an error, check these rules:</p>
        <ul>
          <li><strong>One root element</strong> must wrap everything, like <code>&lt;order&gt;…&lt;/order&gt;</code>.</li>
          <li><strong>Every tag must be closed</strong>: <code>&lt;item&gt;…&lt;/item&gt;</code> or self-closing <code>&lt;item/&gt;</code>.</li>
          <li><strong>Tags must be nested correctly</strong>: <code>&lt;b&gt;&lt;i&gt;…&lt;/i&gt;&lt;/b&gt;</code>, not <code>&lt;b&gt;&lt;i&gt;…&lt;/b&gt;&lt;/i&gt;</code>.</li>
          <li><strong>Names are case-sensitive</strong>: <code>&lt;Item&gt;</code> cannot be closed with <code>&lt;/item&gt;</code>.</li>
          <li><strong>Attribute values need quotes</strong>: <code>id=&quot;7&quot;</code>, not <code>id=7</code>.</li>
          <li><strong>Special characters must be escaped</strong>: write <code>&amp;amp;</code> for &amp; and <code>&amp;lt;</code> for &lt; in text, or wrap the text in <code>&lt;![CDATA[ … ]]&gt;</code>.</li>
        </ul>

        <h2>Where You See XML Today</h2>
        <p>
          XML is still everywhere: RSS feeds, sitemaps, SOAP APIs, Office files
          (.docx and .xlsx are zipped XML), Android layouts, Maven pom.xml files
          and many bank and government data exchanges. If you need the data in a
          web app, convert it with <a href="/xml-to-json">XML to JSON</a>, or go the
          other way with <a href="/json-to-xml">JSON to XML</a>. Not sure which format
          to use? Read <a href="/json-vs-xml">JSON vs XML</a>.
        </p>

        <FaqSection faqs={FAQS['xml-formatter']} />

        <RelatedTools
          links={[
            ['/xml-to-json', 'XML to JSON'],
            ['/json-to-xml', 'JSON to XML'],
            ['/', 'JSON Formatter'],
            ['/yaml-formatter', 'YAML Formatter'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default XmlFormatter
