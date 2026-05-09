import { useState, useRef, useCallback } from 'react'

export default function UploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.match(/image\/.*/)) return
    setPreview(URL.createObjectURL(file))
    onUpload(file)
  }, [onUpload])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onInputChange = (e) => handleFile(e.target.files[0])

  const clear = (e) => {
    e.stopPropagation()
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section>
      <SectionHeader
        label="OPTIONAL"
        labelColor="text-violet-500"
        title="Bring Your Own Sign"
        subtitle="Drop any traffic sign image to identify it instantly"
      />

      <div
        onClick={() => !preview && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative mt-5 rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-sm
          ${preview
            ? 'border-transparent cursor-default'
            : dragging
              ? 'border-violet-400 bg-violet-50 scale-[1.01] cursor-copy'
              : 'border-dashed border-violet-200 bg-white/70 backdrop-blur hover:border-violet-300 hover:bg-violet-50/40 cursor-pointer'
          }
        `}
        style={{ minHeight: 160 }}
      >
        {preview ? (
          <div className="flex items-center gap-6 p-5">
            <div className="relative shrink-0">
              <img
                src={preview}
                alt="uploaded"
                className="w-28 h-28 object-contain rounded-xl bg-gray-100 border border-gray-200"
              />
              <button
                onClick={clear}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center hover:bg-gray-950 transition-colors"
              >
                ✕
              </button>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Image uploaded</p>
              <p className="text-gray-400 text-sm mt-1">Analyzing in the panel →</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center select-none">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-2xl">
              🖼️
            </div>
            <p className="font-semibold text-gray-700">
              {dragging ? 'Release to upload' : 'Drop an image or click to browse'}
            </p>
            <p className="text-gray-400 text-sm mt-1">JPG, PNG, BMP, PPM supported</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/bmp,.ppm"
        className="hidden"
        onChange={onInputChange}
      />
    </section>
  )
}

export function SectionHeader({ label, labelColor, title, subtitle }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <span className={`text-xs font-bold uppercase tracking-widest ${labelColor ?? 'text-gray-400'}`}>
          {label}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
