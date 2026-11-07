import { useRef, useState } from 'react'

// Must match the CSS values in ToolPage.css (.ce-*), so lines stay aligned.
const LINE_HEIGHT = 22
const PADDING_TOP = 14

// A text box for code, with line numbers on the left.
// - errorLine: this line number is shown in red, with a red band behind it
// - onCursor({ line, column }): called when the cursor moves
// - onFileDrop(file): called when a file is dragged and dropped on the box
// - Tab key adds two spaces instead of leaving the box
function CodeEditor({ value, onChange, onKeyDown, errorLine, onCursor, onFileDrop, placeholder }) {
  const textareaRef = useRef(null)
  const gutterRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [dragging, setDragging] = useState(false)

  const lineCount = value ? value.split('\n').length : 1
  let numbers = ''
  for (let n = 1; n <= lineCount; n++) numbers += n + '\n'

  function handleScroll(event) {
    setScrollTop(event.target.scrollTop)
    if (gutterRef.current) gutterRef.current.scrollTop = event.target.scrollTop
  }

  function reportCursor(event) {
    if (!onCursor) return
    const box = event.target
    const before = box.value.slice(0, box.selectionStart)
    onCursor({
      line: before.split('\n').length,
      column: before.length - before.lastIndexOf('\n'),
    })
  }

  function handleKeyDown(event) {
    if (event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault()
      const box = event.target
      const start = box.selectionStart
      const end = box.selectionEnd
      const newValue = value.slice(0, start) + '  ' + value.slice(end)
      onChange(newValue)
      // Put the cursor after the two spaces once React has updated the box.
      requestAnimationFrame(() => {
        box.selectionStart = box.selectionEnd = start + 2
      })
      return
    }
    onKeyDown?.(event)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file && onFileDrop) onFileDrop(file)
  }

  return (
    <div
      className={`code-editor${dragging ? ' ce-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <pre className="ce-gutter" ref={gutterRef} aria-hidden="true">
        {numbers}
        {errorLine && (
          <span
            className="ce-gutter-error"
            style={{ top: PADDING_TOP + (errorLine - 1) * LINE_HEIGHT }}
          >
            {errorLine}
          </span>
        )}
      </pre>

      <div className="ce-body">
        {errorLine && (
          <div
            className="ce-error-band"
            style={{ top: PADDING_TOP + (errorLine - 1) * LINE_HEIGHT - scrollTop }}
            aria-hidden="true"
          />
        )}
        <textarea
          ref={textareaRef}
          className="ce-textarea"
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          wrap="off"
          aria-label="Input JSON"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={reportCursor}
          onClick={reportCursor}
          onSelect={reportCursor}
          onScroll={handleScroll}
        />
        {dragging && <div className="ce-drop-hint">Drop your .json file here</div>}
      </div>
    </div>
  )
}

export default CodeEditor
