import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { parseJsonLenient } from './toolUtils.js'
import { inferModel, splitNullable, toSnakeCase } from './typeModel.js'

function pyType(type) {
  switch (type.kind) {
    case 'string':
      return 'str'
    case 'integer':
      return 'int'
    case 'number':
      return 'float'
    case 'boolean':
      return 'bool'
    case 'null':
      return 'None'
    case 'object':
      return type.name
    case 'array':
      return `list[${pyType(type.items)}]`
    case 'union':
      return type.types.map(pyType).join(' | ')
    default:
      return 'Any'
  }
}

function jsonToPython(data, style, rootName) {
  const model = inferModel(data, rootName || 'Root')
  const lines = ['from __future__ import annotations', '']
  if (style === 'dataclass') lines.push('from dataclasses import dataclass')
  if (style === 'pydantic') lines.push('from pydantic import BaseModel, Field')
  if (style === 'typeddict') lines.push('from typing import NotRequired, TypedDict')
  const usesAny = JSON.stringify([...model.classes.values()]).includes('"unknown"')
  if (usesAny) lines.push('from typing import Any')
  lines.push('', '')

  // Children first, so every class is defined before it is used.
  const classes = [...model.classes].reverse()
  const blocks = classes.map(([name, fields]) => {
    const body = []
    const ordered = style === 'dataclass' ? [...fields.filter((f) => !f.optional), ...fields.filter((f) => f.optional)] : fields
    for (const field of ordered) {
      const { base, nullable } = splitNullable(field.type)
      let type = pyType(base)
      if (nullable || (field.optional && style !== 'typeddict')) type = `${type} | None`
      if (style === 'typeddict') {
        const key = /^[A-Za-z_]\w*$/.test(field.key) ? field.key : null
        const t = field.optional ? `NotRequired[${type}]` : type
        body.push(key ? `    ${key}: ${t}` : `    # "${field.key}" is not a valid Python name; use dict-style access`)
        continue
      }
      const attr = toSnakeCase(field.key)
      const renamed = attr !== field.key
      if (style === 'pydantic') {
        const args = []
        if (field.optional || nullable) args.push('None')
        if (renamed) args.push(`alias="${field.key}"`)
        const value = renamed ? ` = Field(${args.join(', ')})` : field.optional || nullable ? ' = None' : ''
        body.push(`    ${attr}: ${type}${value}`)
      } else {
        const value = field.optional ? ' = None' : ''
        body.push(`    ${attr}: ${type}${value}${renamed ? `  # JSON key: "${field.key}"` : ''}`)
      }
    }
    if (body.length === 0) body.push('    pass')
    if (style === 'dataclass') return `@dataclass\nclass ${name}:\n${body.join('\n')}`
    if (style === 'pydantic') return `class ${name}(BaseModel):\n${body.join('\n')}`
    return `class ${name}(TypedDict):\n${body.join('\n')}`
  })

  if (model.root.kind !== 'object') blocks.push(`${rootName || 'Root'} = ${pyType(model.root)}`)
  return lines.join('\n') + blocks.join('\n\n\n') + '\n'
}

const SAMPLE = JSON.stringify(
  {
    id: 1024,
    firstName: 'Emily',
    lastName: 'Clark',
    email: 'emily.clark@example.com',
    isActive: true,
    balance: 2500.75,
    manager: null,
    address: { city: 'London', postcode: 'SW1A 1AA' },
    orders: [
      { orderId: 'A-100', total: 49.99, items: ['Keyboard'] },
      { orderId: 'A-101', total: 19.5, items: ['Mouse'], coupon: 'SAVE10' },
    ],
  },
  null,
  2
)

function JsonToPython() {
  const [style, setStyle] = useState('dataclass')
  const [rootName, setRootName] = useState('Customer')

  return (
    <ConverterPage
      h1="JSON to Python Class Generator – Dataclass & Pydantic"
      intro="Paste JSON and get Python classes with type hints: dataclasses, Pydantic models or TypedDict, with nested classes and optional fields."
      inputTitle="JSON Input"
      outputTitle="Python"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'models.py', mimeType: 'text/x-python' }}
      actions={[
        {
          label: 'Generate Python',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToPython(data, style, rootName)
            const count = (output.match(/^class /gm) || []).length
            return { output, message: `Generated ${count} Python class${count === 1 ? '' : 'es'}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Style
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="dataclass">dataclass</option>
              <option value="pydantic">Pydantic (v2)</option>
              <option value="typeddict">TypedDict</option>
            </select>
          </label>
          <label className="option">
            Class name
            <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Python Converter?</h2>
        <p>
          A JSON to Python converter reads example JSON and writes Python
          classes with type hints that match it. Instead of working with
          untyped dictionaries, you get classes your editor understands, with
          autocomplete and type checking.
        </p>

        <h2>How to Generate Python Classes from JSON</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Pick a style: dataclass, Pydantic model or TypedDict.</li>
          <li>Click Generate Python, or press Ctrl + Enter.</li>
          <li>Copy the code or download models.py.</li>
        </ol>

        <h2>Which Style Should I Use?</h2>
        <ul>
          <li><strong>dataclass</strong>: built into Python, no extra packages. Good for simple data.</li>
          <li><strong>Pydantic</strong>: validates data when you load it. Popular with FastAPI. Keys like firstName are mapped with an alias.</li>
          <li><strong>TypedDict</strong>: keeps your data as normal dictionaries, but adds type hints.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-python']} />

        <RelatedTools
          links={[
            ['/json-in-python', 'Python JSON guide'],
            ['/json-to-java', 'JSON to Java'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-schema-generator', 'JSON Schema Generator'],
            ['/json-to-csv-python', 'JSON to CSV in Python'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToPython
