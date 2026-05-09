import { useEffect, useState } from 'react'
import SampleCard from './SampleCard'
import { fetchSamples } from '../api'
import { SectionHeader } from './UploadZone'

export default function SampleMenu({ onSelect, dense = false }) {
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeKey, setActiveKey] = useState(null)

  useEffect(() => {
    fetchSamples()
      .then(setSamples)
      .catch(() => setError('Could not load samples'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (sample) => {
    setActiveKey(sample.name)
    onSelect(sample)
  }

  return (
    <section>
      <SectionHeader
        label="SAMPLE SIGNS"
        labelColor="text-rose-500"
        title="Browse the Menu"
        subtitle={
          samples.length > 0
            ? `${samples.length} sign${samples.length !== 1 ? 's' : ''} — click any card to identify it`
            : 'Add images to your samples/ folder to populate this gallery'
        }
      />

      <div className="mt-6">
        {loading && <SkeletonGrid />}

        {!loading && error && (
          <Notice icon="⚠️" message={error} />
        )}

        {!loading && !error && samples.length === 0 && (
          <EmptyState />
        )}

        {!loading && !error && samples.length > 0 && (
          <div className={`grid gap-4 ${dense ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}>
            {samples.map((sample) => (
              <SampleCard
                key={sample.name}
                sample={sample}
                onSelect={handleSelect}
                isActive={activeKey === sample.name}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6
      bg-white rounded-2xl border-2 border-dashed border-gray-200">
      <span className="text-5xl mb-4">🪧</span>
      <h3 className="font-bold text-gray-800 text-lg">No signs on the menu yet</h3>
      <p className="text-gray-500 text-sm mt-2 max-w-sm">
        Add traffic sign images to your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">samples/</code> folder.
        They'll appear here as beautiful menu cards, ready to identify.
      </p>
    </div>
  )
}

function Notice({ icon, message }) {
  return (
    <div className="flex items-center gap-3 py-5 px-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
      <span className="text-xl">{icon}</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="aspect-square shimmer-bg" />
          <div className="px-3.5 py-3 space-y-2">
            <div className="h-3 w-3/4 rounded shimmer-bg" />
            <div className="h-2.5 w-1/2 rounded shimmer-bg" />
          </div>
        </div>
      ))}
    </div>
  )
}
