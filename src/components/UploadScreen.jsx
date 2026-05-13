import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { uploadImageToCloudinary } from '../lib/cloudinary'
import { supabase, supabaseReady } from '../lib/supabase'

const PRODUCE_BY_CATEGORY = {
  vege: [
    'Beetroot', 'Bitter Gourd', 'Brinjal', 'Cabbage', 'Carrot', 'Daikon',
    'Drumstick', 'Garlic', 'Ginger', 'Gotukola', 'Green Chilli', 'Karapincha',
    'Leeks', 'Mukunuwenna', 'Okra', 'Onion', 'Potato', 'Pumpkin', 'Raw Banana',
    'Snake Gourd', 'Tomato',
  ],
  fruit: [
    'Avocado', 'Banana', 'Coconut', 'Jackfruit', 'Lime', 'Mango', 'Papaya',
    'Passion Fruit', 'Pineapple', 'Rambutan', 'Watermelon', 'Wood Apple',
  ],
}

const VARIETIES = {
  'Banana':     ['Kolikuttu', 'Ambun', 'Anamalu', 'Cavendish', 'Seeni', 'Pethpeli', 'Other'],
  'Mango':      ['Karthakolomban', 'Willard', 'TJC', 'Imported', 'Other'],
  'Tomato':     ['Local', 'Cherry', 'Imported'],
  'Apple':      ['Fuji', 'Granny Smith', 'Pink Lady', 'Gala', 'Other'],
  'Potato':     ['Local', 'Imported'],
  'Onion':      ['Local Red', 'Local Small', 'Imported Big'],
  'Cabbage':    ['Green', 'Purple', 'Cauliflower'],
  'Pumpkin':    ['Local', 'Butternut'],
  'Watermelon': ['Seeded', 'Seedless'],
  'Coconut':    ['Green (King)', 'Dry'],
  'Jackfruit':  ['Whole', 'Cut Piece'],
  'Brinjal':    ['Purple Long', 'Round', 'Green'],
}

const BRANCHES = [
  'Colombo 3', 'Colombo 7', 'Nugegoda', 'Maharagama',
  'Kandy', 'Galle', 'Negombo', 'Kurunegala',
]

function ProduceCombobox({ value, onChange, options }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = query.length === 0
    ? options
    : options.filter(p => p.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (item) => {
    setQuery(item)
    onChange(item)
    setOpen(false)
  }

  // keep query in sync if value cleared externally
  useEffect(() => { if (!value) setQuery('') }, [value])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="text"
        className="field-input"
        placeholder="Search or type produce name…"
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        required
      />
      {open && (
        <ul className="combo-list">
          {filtered.length > 0
            ? filtered.map(p => (
              <li key={p} className="combo-item" onMouseDown={() => select(p)}>{p}</li>
            ))
            : query && (
              <li className="combo-item combo-custom" onMouseDown={() => select(query)}>
                Use &ldquo;{query}&rdquo;
              </li>
            )
          }
        </ul>
      )}
    </div>
  )
}

function VarietyPicker({ varieties, value, onChange }) {
  return (
    <div className="variety-picker">
      {varieties.map(v => (
        <button
          key={v}
          type="button"
          className={`variety-btn ${value === v ? 'variety-btn--active' : ''}`}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

function ImageZone({ image, onImage }) {
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onImage({ file, url })
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`image-zone ${image ? 'image-zone--filled' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      {image ? (
        <img src={image.url} alt="preview" className="image-preview" />
      ) : (
        <div className="image-placeholder">
          <svg className="image-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span className="image-label">Tap to take photo or choose image</span>
          <span className="image-sub">Required</span>
        </div>
      )}
    </div>
  )
}

function SegmentControl({ options, value, onChange }) {
  return (
    <div className="segment">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`segment-btn ${value === opt.value ? 'segment-btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function UploadScreen() {
  const [image, setImage] = useState(null)
  const [category, setCategory] = useState('vege')
  const [produceName, setProduceName] = useState('')
  const [variety, setVariety] = useState('')
  const [presentation, setPresentation] = useState('loose')
  const [angle, setAngle] = useState('top')
  const [branch, setBranch] = useState('')
  const [uploadedBy, setUploadedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [todayCount, setTodayCount] = useState(0)

  const produceOptions = PRODUCE_BY_CATEGORY[category]
  const varieties = VARIETIES[produceName] || null

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setProduceName('')
    setVariety('')
  }

  const handleProduceChange = (name) => {
    setProduceName(name)
    setVariety('')
  }

  const fetchTodayCount = async (name) => {
    if (!name || !supabaseReady) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('uploads')
      .select('*', { count: 'exact', head: true })
      .eq('uploaded_by', name)
      .gte('created_at', today.toISOString())
    setTodayCount(count || 0)
  }

  useEffect(() => {
    const saved = localStorage.getItem('sp_name')
    const savedBranch = localStorage.getItem('sp_branch')
    if (saved) { setUploadedBy(saved); fetchTodayCount(saved) }
    if (savedBranch) setBranch(savedBranch)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) { toast.error('Please select an image'); return }
    if (!produceName.trim()) { toast.error('Please enter a produce name'); return }
    if (varieties && !variety) { toast.error('Please select a variety'); return }

    if (!supabaseReady) {
      toast.error('Add your credentials in .env to enable submissions')
      return
    }

    // variety is stored in the angle field; fall back to angle if no variety
    const angleValue = varieties ? variety : angle

    setLoading(true)
    try {
      const imageUrl = await uploadImageToCloudinary(image.file)
      const { error } = await supabase.from('uploads').insert({
        item_name: produceName.trim(),
        presentation,
        angle: angleValue,
        branch,
        notes: notes.trim() || null,
        image_url: imageUrl,
        uploaded_by: uploadedBy.trim() || null,
      })
      if (error) throw error

      toast.success('Image submitted! Keep going.')

      localStorage.setItem('sp_name', uploadedBy)
      localStorage.setItem('sp_branch', branch)

      setImage(null)
      setCategory('vege')
      setProduceName('')
      setVariety('')
      setPresentation('loose')
      setAngle('top')
      setNotes('')
      setTodayCount(c => c + 1)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <header className="header">
        <div className="header-inner">
          <img src="/keells-logo.png" alt="Keells" className="header-logo" />
          <div>
            <h1 className="header-title">Add Produce Image</h1>
            <p className="header-sub">SmartProduce Data Collector</p>
          </div>
        </div>
      </header>

      <div className="screen-body">
        {!supabaseReady && (
          <div className="setup-banner">
            Add your <code>.env</code> credentials to enable submissions
          </div>
        )}
        <form onSubmit={handleSubmit} className="form">
          <ImageZone image={image} onImage={setImage} />

          <div className="field">
            <label className="field-label">Category</label>
            <SegmentControl
              options={[{ value: 'vege', label: 'Vegetable' }, { value: 'fruit', label: 'Fruit' }]}
              value={category}
              onChange={handleCategoryChange}
            />
          </div>

          <div className="field">
            <label className="field-label">Produce Name <span className="required">*</span></label>
            <ProduceCombobox value={produceName} onChange={handleProduceChange} options={produceOptions} />

            {varieties && (
              <div className="field" style={{ marginTop: 8 }}>
                <label className="field-label">
                  Variety <span className="required">*</span>
                </label>
                <VarietyPicker
                  varieties={varieties}
                  value={variety}
                  onChange={setVariety}
                />
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label">Presentation</label>
            <SegmentControl
              options={[{ value: 'loose', label: 'Loose' }, { value: 'bagged', label: 'Bagged' }]}
              value={presentation}
              onChange={setPresentation}
            />
          </div>

          {!varieties && (
            <div className="field">
              <label className="field-label">Angle</label>
              <SegmentControl
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'side', label: 'Side' },
                  { value: '45deg', label: '45°' },
                ]}
                value={angle}
                onChange={setAngle}
              />
            </div>
          )}

          <div className="field">
            <label className="field-label">Branch</label>
            <select
              className="field-input"
              value={branch}
              onChange={e => setBranch(e.target.value)}
            >
              <option value="">Select branch…</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Your Name</label>
            <input
              type="text"
              className="field-input"
              placeholder="Your name"
              value={uploadedBy}
              onChange={e => { setUploadedBy(e.target.value); fetchTodayCount(e.target.value) }}
            />
          </div>

          <div className="field">
            <label className="field-label">Notes <span className="field-optional">(optional)</span></label>
            <textarea
              className="field-input field-textarea"
              placeholder="e.g. slightly wilted, end of day, heavy bag"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Submit Image'}
          </button>
        </form>

        {uploadedBy && (
          <p className="today-count">
            Your uploads today: <strong>{todayCount}</strong>
          </p>
        )}
      </div>
    </div>
  )
}
