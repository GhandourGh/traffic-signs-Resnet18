export async function fetchSamples() {
  const res = await fetch('/api/samples')
  if (!res.ok) throw new Error('Failed to load samples')
  return res.json()
}

export async function predict(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/predict', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Prediction failed')
  return res.json()
}

export async function predictFromSampleUrl(url, filename) {
  const imgRes = await fetch(url)
  const blob = await imgRes.blob()
  const file = new File([blob], filename, { type: blob.type })
  return predict(file)
}
