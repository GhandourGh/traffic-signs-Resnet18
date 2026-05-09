export default function AnalyzerWorkspace({ analysis }) {
  const { imageUrl, filename, loading, predictions, bbox, error } = analysis
  const top = predictions?.[0]

  if (!imageUrl && !loading) {
    return (
      <section className="rounded-3xl border border-violet-200/80 bg-white/70 backdrop-blur p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-700">Ready for live classification</p>
        <p className="text-slate-500 mt-2">
          Select a sample to open the full analysis stage.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-violet-200/80 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="px-8 py-5 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-sky-50">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-violet-600">Presentation Mode</p>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Live Traffic Sign Analysis</h2>
        {filename && <p className="text-sm text-slate-500 mt-1">{filename}</p>}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0">
        <div className="p-8 bg-slate-950 min-h-[520px] flex items-center justify-center">
          {imageUrl ? (
            <div className="relative inline-block w-full max-w-[760px]">
              <img
                src={imageUrl}
                alt="analyzed"
                className="w-full max-h-[500px] object-contain rounded-xl"
              />
              {bbox && (
                <div
                  className="absolute border-[3px] border-lime-300 rounded-md pointer-events-none"
                  style={{
                    left: `${bbox.x * 100}%`,
                    top: `${bbox.y * 100}%`,
                    width: `${bbox.w * 100}%`,
                    height: `${bbox.h * 100}%`,
                  }}
                >
                  <span className="absolute -top-8 left-0 bg-lime-300 text-slate-900 text-xs font-extrabold px-2 py-1 rounded">
                    DETECTED SIGN
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-300">Waiting for image...</p>
          )}
        </div>

        <div className="p-8 bg-white">
          {loading && <LoadingState />}
          {!loading && error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 font-medium">
              {error}
            </div>
          )}
          {!loading && predictions && (
            <div className="space-y-6">
              {!bbox && (
                <p className="text-xs bg-slate-100 border border-slate-200 text-slate-600 rounded-lg px-3 py-2">
                  Bounding box unavailable for this image.
                </p>
              )}
              <VerdictCard prediction={top} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Top 3 Predictions
                </p>
                <div className="space-y-4">
                  {predictions.map((p, i) => (
                    <ConfidenceRow key={p.label} rank={i + 1} label={p.label} confidence={p.confidence} isTop={i === 0} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function VerdictCard({ prediction }) {
  if (!prediction) return null
  const pct = (prediction.confidence * 100).toFixed(1)
  const tier = prediction.confidence >= 0.9 ? 'high' : prediction.confidence >= 0.6 ? 'mid' : 'low'
  const styles = {
    high: { wrap: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-500', icon: '✅', label: 'High confidence' },
    mid: { wrap: 'bg-amber-50 border-amber-200', badge: 'bg-amber-400', icon: '⚠️', label: 'Uncertain' },
    low: { wrap: 'bg-red-50 border-red-200', badge: 'bg-red-400', icon: '❌', label: 'Low confidence' },
  }[tier]

  return (
    <div className={`rounded-2xl border p-5 ${styles.wrap}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{styles.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-lg leading-snug">{prediction.label}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block text-white text-sm font-bold px-2.5 py-0.5 rounded-full ${styles.badge}`}>
              {pct}%
            </span>
            <span className="text-sm text-slate-500">{styles.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfidenceRow({ rank, label, confidence, isTop }) {
  const pct = confidence * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isTop ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {rank}
          </span>
          <span className={`text-base truncate ${isTop ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
            {label}
          </span>
        </div>
        <span className={`text-base font-semibold shrink-0 ${isTop ? 'text-slate-900' : 'text-slate-400'}`}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${isTop ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-slate-300'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 rounded-2xl shimmer-bg" />
      <div className="h-10 rounded-xl shimmer-bg" />
      <div className="h-10 rounded-xl shimmer-bg" />
      <div className="h-10 rounded-xl shimmer-bg" />
    </div>
  )
}
