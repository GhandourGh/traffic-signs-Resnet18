export default function Header({ page, onNavigate }) {
  return (
    <header className="text-white hero-header border-b border-violet-200/40">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚦</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight">
              Traffic Sign Recognition
            </h1>
            <p className="text-violet-100 text-xs font-medium mt-1 tracking-wide">
              GTSRB benchmark . 43 classes . live inference
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm bg-white/10 rounded-2xl px-4 py-3 backdrop-blur">
          <Stat label="Model" value="ResNet-18" />
          <div className="w-px h-8 bg-violet-200/25" />
          <Stat label="Accuracy" value="98.85%" highlight />
          <div className="w-px h-8 bg-violet-200/25" />
          <Stat label="Built by" value="Ghandour & Maroun" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-5">
        <div className="inline-flex rounded-xl bg-white/10 p-1.5 backdrop-blur">
          <NavButton active={page === 'identify'} onClick={() => onNavigate('identify')}>
            Identify
          </NavButton>
          <NavButton active={page === 'samples'} onClick={() => onNavigate('samples')}>
            Samples
          </NavButton>
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div className="text-center">
      <p className="text-violet-100/70 text-xs uppercase tracking-widest">{label}</p>
      <p className={`font-semibold mt-0.5 ${highlight ? 'text-amber-300' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${active ? 'bg-white text-violet-800 shadow-sm' : 'text-violet-100 hover:bg-white/10'}`}
    >
      {children}
    </button>
  )
}
