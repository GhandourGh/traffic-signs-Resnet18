import { useState, useCallback } from 'react'
import Header from './components/Header'
import SampleMenu from './components/SampleMenu'
import AnalyzerWorkspace from './components/AnalyzerWorkspace'
import { predictFromSampleUrl } from './api'

export default function App() {
  const [page, setPage] = useState('identify')
  const [analysis, setAnalysis] = useState({
    imageUrl: null,
    filename: null,
    loading: false,
    predictions: null,
    bbox: null,
    error: null,
  })

  const handleSampleSelect = useCallback(async (sample) => {
    setPage('identify')
    setAnalysis({ imageUrl: sample.url, filename: sample.name, loading: true, predictions: null, bbox: null, error: null })
    try {
      const data = await predictFromSampleUrl(sample.url, sample.name)
      setAnalysis(prev => ({ ...prev, loading: false, predictions: data.predictions, bbox: data.bbox ?? null }))
    } catch {
      setAnalysis(prev => ({ ...prev, loading: false, error: 'Prediction failed. Please try again.' }))
    }
  }, [])

  return (
    <div className="min-h-screen app-shell">
      <Header page={page} onNavigate={setPage} />

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          {page === 'identify' && (
            <>
              <AnalyzerWorkspace analysis={analysis} />
              <SampleMenu onSelect={handleSampleSelect} dense />
            </>
          )}
          {page === 'samples' && (
            <section className="rounded-3xl border border-violet-200/80 bg-white/70 backdrop-blur p-6 md:p-8">
              <SampleMenu onSelect={handleSampleSelect} />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
