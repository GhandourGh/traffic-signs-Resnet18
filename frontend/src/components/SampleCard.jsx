import { useState } from 'react'

export default function SampleCard({ sample, onSelect, isActive }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const displayName = sample.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

  return (
    <button
      onClick={() => onSelect(sample)}
      className={`
        group relative bg-white/90 backdrop-blur rounded-2xl overflow-hidden text-left w-full
        transition-all duration-300 ease-out
        shadow-sm hover:shadow-xl hover:-translate-y-1 border border-violet-100/70
        ${isActive ? 'ring-2 ring-violet-500 ring-offset-2 shadow-xl -translate-y-1' : ''}
      `}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer-bg" />
        )}
        <img
          src={sample.url}
          alt={displayName}
          onLoad={() => setImgLoaded(true)}
          className={`
            w-full h-full object-cover
            transition-all duration-500 group-hover:scale-110
            ${imgLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          flex items-end justify-center pb-4">
          <span className="bg-white text-gray-900 font-semibold text-sm px-4 py-1.5 rounded-full shadow-lg
            translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Identify →
          </span>
        </div>

        {/* Active badge */}
        {isActive && (
          <div className="absolute top-2 right-2 bg-violet-500 text-white text-xs font-bold
            px-2.5 py-1 rounded-full shadow">
            Selected
          </div>
        )}
      </div>

      {/* Label */}
      <div className="px-3.5 py-3">
        <p className="text-sm font-semibold text-gray-800 truncate capitalize">{displayName}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{sample.name}</p>
      </div>
    </button>
  )
}
