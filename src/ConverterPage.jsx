// A complete "input box → button → result box" tool page.
// The new tools (XML to JSON, JSON to YAML, Minifier, Repair, ...) only pass
// their text, sample and convert function; the layout is the same everywhere.
import { useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import CodeEditor from './CodeEditor.jsx'
import JsonHighlight from './JsonHighlight.jsx'
import { ToolPanel, Tool, StatusBadge, EmptyBox, PlainOutput, XmlOutput, Messages } from './ToolLayout.jsx'
import { useLiveJsonCheck, describeText, formatSize, downloadText, downloadBlob, readTextFile } from './toolUtils.js'

// Colors YAML a little: keys blue, comments grey, "- " list marks grey.
function YamlOutput({ text }) {
  if (text.length > 300 * 1024) return <PlainOutput text={text} />
  const lines = text.split('\n')
  let numbers = ''
  for (let n = 1; n <= lines.length; n++) numbers += n + '\n'
  return (
    <div className="jh-box">
      <pre className="jh-gutter" aria-hidden="true">{numbers}</pre>
      <pre className="jh-code">
        {lines.map((line, index) => {
          const match = line.match(/^(\s*(?:- )*)([^\s#'"][^:#]*|"[^"]*"|'[^']*'):(\s|$)(.*)$/)
          let content = line
          if (/^\s*#/.test(line)) {
            content = <span className="jv-colon">{line}</span>
          } else if (match) {
            const [, lead, key, space, value] = match
            content = (
              <>
                <span className="jv-colon">{lead}</span>
                <span className="jv-key">{key}</span>
                <span className="jv-colon">:</span>
                {space}
                <span className="jv-string">{value}</span>
              </>
            )
          } else if (/^\s*- /.test(line)) {
            const lead = line.match(/^\s*(- )+/)[0]
            content = (
              <>
                <span className="jv-colon">{lead}</span>
                <span className="jv-string">{line.slice(lead.length)}</span>
              </>
            )
          }
          return (
            <span key={index}>
              {content}
              {'\n'}
            </span>
          )
        })}
      </pre>
    </div>
  )
}

const OUTPUTS = {
  json: JsonHighlight,
  yaml: YamlOutput,
  xml: XmlOutput,
  plain: PlainOutput,
}

// Props:
//   h1, intro                 heading and the line under it
//   inputTitle, outputTitle   box titles
//   inputIsJson               show ✓/✗ badge and red error line while typing
//   inputPlaceholder, inputAccept (file types for Upload)
//   sample                    text loaded by the Sample button
//   actions                   [{ label, run(text) → { output, message } }]
//                             the first one is the big blue button; run() may throw an Error;
//                             it may also return type: 'json' | 'plain' ... to pick the result view
//   outputType                'json' | 'yaml' | 'xml' | 'plain'
//   download                  { fileName, mimeType }
//   options                   optional extra controls shown under the action buttons
//   children                  the SEO text section shown under the tool
function ConverterPage({
  h1,
  intro,
  inputTitle,
  outputTitle,
  inputIsJson = true,
  inputPlaceholder,
  inputAccept = '.json,.txt,application/json,text/plain',
  sample,
  actions,
  outputType = 'json',
  download,
  options,
  children,
}) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [resultType, setResultType] = useState(outputType)
  const [error, setError] = useState('')
  const [errorLocation, setErrorLocation] = useState(null)
  const [success, setSuccess] = useState('')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const fileInputRef = useRef(null)
  const liveCheck = useLiveJsonCheck(inputIsJson ? input : '')
  const Output = OUTPUTS[resultType] || PlainOutput

  function handleInputChange(text) {
    setInput(text)
    setOutput('')
    setError('')
    setErrorLocation(null)
    setSuccess('')
  }

  // run() may also return a Promise (e.g. when a library is loaded only when needed).
  async function run(action, text = input) {
    if (!text.trim()) {
      setOutput('')
      setSuccess('')
      setError(`Please paste your ${inputTitle.replace(/ input$/i, '')} first.`)
      return
    }
    try {
      const result = await action.run(text)
      if (result.download) {
        // Some tools (like JSON to Excel) create a file instead of text.
        downloadBlob(result.download.blob, result.download.fileName)
      }
      setOutput(result.output)
      setResultType(result.type || outputType)
      setError('')
      setErrorLocation(null)
      setSuccess(result.message || 'Done!')
    } catch (err) {
      setOutput('')
      setSuccess('')
      setError(err.message)
      setErrorLocation(err.location || null)
    }
  }

  async function readFile(file) {
    try {
      const text = await readTextFile(file)
      handleInputChange(text)
      setSuccess(`"${file.name}" loaded. Click ${actions[0].label}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(output)
      setSuccess('Result copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
    }
  }

  function downloadResult() {
    downloadText(output, download.fileName, download.mimeType)
    setSuccess('File downloaded successfully!')
  }

  function useResultAsInput() {
    handleInputChange(output)
    setSuccess('Result moved to the input box.')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      run(actions[0])
    }
  }

  const [primary, ...others] = actions

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>{h1}</h1>
      <p>{intro}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept={inputAccept}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) readFile(file)
        }}
        style={{ display: 'none' }}
      />

      <div className="editor-layout">
        <ToolPanel
          title={inputTitle}
          badge={inputIsJson ? <StatusBadge check={liveCheck} /> : null}
          tools={
            <>
              <Tool onClick={() => handleInputChange(sample)}>Sample</Tool>
              <Tool onClick={() => fileInputRef.current?.click()}>Upload</Tool>
              <Tool onClick={() => handleInputChange('')}>Clear</Tool>
            </>
          }
          statusLeft={`Ln ${cursor.line}, Col ${cursor.column}`}
          statusRight={describeText(input)}
          footer={
            <>
              <div className="action-bar">
                <button
                  type="button"
                  className="action-primary"
                  onClick={() => run(primary)}
                  title="Shortcut: Ctrl + Enter"
                >
                  {primary.label}
                </button>
                {others.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="action-secondary"
                    onClick={() => run(action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              {options && <div className="options-row">{options}</div>}
            </>
          }
        >
          <CodeEditor
            value={input}
            placeholder={`${inputPlaceholder}\n\nTip: press Ctrl + Enter to ${primary.label.toLowerCase()}.`}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            errorLine={(inputIsJson && liveCheck?.location?.line) || errorLocation?.line || null}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title={outputTitle}
          tools={
            <>
              <Tool onClick={copyResult} disabled={!output}>Copy</Tool>
              <Tool onClick={downloadResult} disabled={!output}>Download</Tool>
              <Tool onClick={useResultAsInput} disabled={!output} title="Move the result into the input box">
                Edit
              </Tool>
            </>
          }
          statusLeft={output ? `${output.split('\n').length} lines` : 'No result yet'}
          statusRight={output ? formatSize(output) : ''}
        >
          {output ? <Output text={output} /> : <EmptyBox>Your result will appear here.</EmptyBox>}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} location={errorLocation} />

      {children}

      <SiteFooter />
    </div>
  )
}

export default ConverterPage
