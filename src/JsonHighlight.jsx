// Shows formatted JSON with colors and line numbers.
// Keys are blue, text is green, numbers orange, true/false purple, null red.

// Very large results are shown without colors so the page stays fast.
const MAX_COLOR_SIZE = 300 * 1024

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b/g

function colorLine(line) {
  const parts = []
  let last = 0
  for (const match of line.matchAll(TOKEN)) {
    if (match.index > last) parts.push(line.slice(last, match.index))
    const [text, str, colon, num, bool, nul] = match
    if (str && colon) {
      parts.push(<span key={match.index} className="jv-key">{str}</span>, colon)
    } else if (str) {
      parts.push(<span key={match.index} className="jv-string">{str}</span>)
    } else if (num) {
      parts.push(<span key={match.index} className="jv-number">{num}</span>)
    } else if (bool) {
      parts.push(<span key={match.index} className="jv-boolean">{bool}</span>)
    } else if (nul) {
      parts.push(<span key={match.index} className="jv-null">{nul}</span>)
    } else {
      parts.push(text)
    }
    last = match.index + text.length
  }
  if (last < line.length) parts.push(line.slice(last))
  return parts
}

function JsonHighlight({ text }) {
  const lines = text.split('\n')
  const useColors = text.length <= MAX_COLOR_SIZE
  let numbers = ''
  for (let n = 1; n <= lines.length; n++) numbers += n + '\n'

  return (
    <div className="jh-box">
      <pre className="jh-gutter" aria-hidden="true">{numbers}</pre>
      <pre className="jh-code">
        {useColors
          ? lines.map((line, index) => (
              <span key={index}>
                {colorLine(line)}
                {'\n'}
              </span>
            ))
          : text}
      </pre>
    </div>
  )
}

export default JsonHighlight
