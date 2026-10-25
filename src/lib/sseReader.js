// Reads an SSE stream from a fetch Response and calls onChunk/onDone/onError.
// Safe error handling: non-JSON responses don't crash; individual malformed lines are skipped.
export async function readSSEStream(res, { onChunk, onDone }) {
  if (!res.ok) {
    let errMsg = 'Analyse konnte nicht erstellt werden'
    try {
      const e = await res.json()
      errMsg = e.error || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let streamingContent = ''
  let doneCalled = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep incomplete last line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      let msg
      try { msg = JSON.parse(line.slice(6)) } catch { continue }
      if (msg.error) {
        const raw = msg.error
        const isHtml = typeof raw === 'string' && raw.trimStart().startsWith('<')
        throw new Error(isHtml ? 'Verbindungsfehler — bitte erneut versuchen.' : raw)
      }
      if (msg.text) {
        streamingContent += msg.text
        onChunk(streamingContent)
      }
      if (msg.done) {
        onDone(msg.content)
        doneCalled = true
      }
    }
  }

  // Process any remaining buffer (handles done-event arriving without trailing newline)
  if (!doneCalled && buffer.startsWith('data: ')) {
    try {
      const msg = JSON.parse(buffer.slice(6))
      if (msg.done) { onDone(msg.content); doneCalled = true }
    } catch {}
  }

  // Fallback: if done event never arrived but we have streaming content, use it
  if (!doneCalled && streamingContent) {
    onDone(streamingContent)
  }
}
