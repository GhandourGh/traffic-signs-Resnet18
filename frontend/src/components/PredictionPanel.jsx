import { useEffect, useRef } from 'react'

export default function PredictionPanel({ open, imageUrl, filename, loading, predictions, bbox, error, onClose }) {
  const panelRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const top = predictions?.[0]

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          fixed top-0 right-0 h-full bg-white/95 backdrop-blur-md z-50 flex flex-col
          shadow-2xl border-l border-violet-100
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          w-full sm:w-[420px]
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Analysis Result</h2>
            {filename && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{filename}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-100 transition-colors
              flex items-center justify-center text-gray-600 font-semibold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 space-y-6">
          {/* Image preview */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-3">
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="analyzed"
                  className="max-h-[230px] max-w-full object-contain rounded-lg"
                />
                {bbox && (
                  <div
                    className="absolute border-2 border-lime-300 shadow-[0_0_0_9999px_rgba(15,23,42,0.18)] rounded-sm pointer-events-none"
                    style={{
                      left: `${bbox.x * 100}%`,
                      top: `${bbox.y * 100}%`,
                      width: `${bbox.w * 100}%`,
                      height: `${bbox.h * 100}%`,
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-lime-300 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      DETECTED SIGN
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && <LoadingSkeleton />}

          {/* Error */}
          {!loading && error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Results */}
          {!loading && predictions && (
            <div className="animate-fade-in space-y-6">
              {!bbox && (
                <div className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                  Bounding box unavailable for this image. Try a closer crop for stronger localization.
                </div>
              )}
              {/* Verdict card */}
              <VerdictCard prediction={top} />

              {/* Top-3 bars */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 text-center">
            ResNet-18 · GTSRB · 98.85% test accuracy
          </p>
        </div>
      </div>
    </>
  )
}

function VerdictCard({ prediction }) {
  if (!prediction) return null
  const pct = (prediction.confidence * 100).toFixed(1)

  const tier =
    prediction.confidence >= 0.90 ? 'high' :
    prediction.confidence >= 0.60 ? 'mid' : 'low'

  const styles = {
    high: { wrap: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-500', icon: '✅', label: 'High confidence' },
    mid:  { wrap: 'bg-amber-50 border-amber-200',    badge: 'bg-amber-400',   icon: '⚠️', label: 'Uncertain'        },
    low:  { wrap: 'bg-red-50 border-red-200',         badge: 'bg-red-400',     icon: '❌', label: 'Low confidence'  },
  }[tier]

  return (
    <div className={`rounded-2xl border p-5 ${styles.wrap}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{styles.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-snug">{prediction.label}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block text-white text-xs font-bold px-2.5 py-0.5 rounded-full ${styles.badge}`}>
              {pct}%
            </span>
            <span className="text-xs text-gray-500">{styles.label}</span>
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
          <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0
            ${isTop ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {rank}
          </span>
          <span className={`text-sm truncate ${isTop ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
            {label}
          </span>
        </div>
        <span className={`text-sm font-semibold shrink-0 ${isTop ? 'text-gray-900' : 'text-gray-400'}`}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out
            ${isTop
              ? 'bg-gradient-to-r from-violet-500 to-indigo-500'
              : 'bg-gray-300'
            }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-24 rounded-2xl shimmer-bg" />
      <div className="space-y-4">
        {[80, 55, 30].map((w, i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <div className="h-3 rounded shimmer-bg" style={{ width: `${w}%` }} />
              <div className="h-3 w-10 rounded shimmer-bg" />
            </div>
            <div className="h-2 rounded-full shimmer-bg" />
          </div>
        ))}
      </div>
    </div>
  )
}
