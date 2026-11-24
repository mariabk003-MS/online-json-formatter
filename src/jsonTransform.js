// Small JSON clean-up helpers shared by the Formatter and the JSON Sorter.

const compareText = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true })

// Sorts the keys of every object. Arrays keep their order unless sortArrays is on
// (then only arrays of plain text/numbers are sorted).
export function sortJson(value, descending = false, sortArrays = false) {
  if (Array.isArray(value)) {
    const items = value.map((item) => sortJson(item, descending, sortArrays))
    const simple = items.every((item) => typeof item === 'string' || typeof item === 'number')
    if (sortArrays && simple) {
      items.sort((a, b) =>
        typeof a === 'number' && typeof b === 'number' ? a - b : compareText(String(a), String(b))
      )
      if (descending) items.reverse()
    }
    return items
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort(compareText)
    if (descending) keys.reverse()
    // fromEntries keeps a "__proto__" key as a normal key (sorted[key] = ... would drop it).
    return Object.fromEntries(keys.map((key) => [key, sortJson(value[key], descending, sortArrays)]))
  }
  return value
}

// Removes every object property whose value is null, at any depth.
// null items inside arrays stay, so list positions do not shift.
// Returns { value, removed } (removed = how many properties were dropped).
export function removeNulls(value) {
  let removed = 0
  function walk(item) {
    if (Array.isArray(item)) return item.map(walk)
    if (item && typeof item === 'object') {
      const kept = []
      for (const [key, child] of Object.entries(item)) {
        if (child === null) removed++
        else kept.push([key, walk(child)])
      }
      return Object.fromEntries(kept)
    }
    return item
  }
  return { value: walk(value), removed }
}
