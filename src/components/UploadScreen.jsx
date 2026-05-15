import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { uploadImageToCloudinary } from '../lib/cloudinary'
import { supabase, supabaseReady } from '../lib/supabase'

const PRODUCE = {
  vege: [
    'Ambarella', 'Ash Plantains', 'Baby Potatoes', 'Batana', 'Bell Pepper Green',
    'Bell Pepper Red', 'Big Onions', 'Bitter Gourd', 'Brinjals', 'Broccoli',
    'Cabbage', 'Cabbage Leaves', 'Capsicum', 'Carrot', 'Cauliflower', 'Celery',
    'Cherry Tomato', 'Coriander Leaves', 'Cucumber', 'Curry Leaves', 'Egg Plants',
    'Garlic', 'Ginger', 'Green Beans', 'Green Chilies', 'Green Cucumber',
    'Iceberg Lettuce', 'Japanese Leeks', 'Kekiri', 'Kiriala', 'Knol Khol',
    'Korean Long Raddish', 'Ladies Fingers', 'Leeks', 'Lemon', 'Lemon Grass',
    'Lime', 'Long Beans', 'Lotus Yam', 'Mango Curry', 'Manioc', 'Minchi Leaves',
    'Nivithi', 'Onion Leaves', 'Parsley', 'Plantain Flower', 'Potatoes', 'Pumpkin',
    'Raddish', 'Rajala', 'Red Cabbage', 'Red Onions', 'Ribbed Gourd', 'Rhubarb',
    'Salad Cucumber', 'Salad Leaves', 'Snake Gourd', 'Sweet Potato', 'Thalana Batu',
    'Thumba Karawila', 'Tib Batu', 'Tomatoes', 'Yellow Zucchini', 'Zucchini',
  ],
  fruit: [
    'Apple - Fuji', 'Apple - Green', 'Apple - Red', 'Apple - Red Royal Gala',
    'Apple - Yellow', 'Avocado', 'Banana - Ambul', 'Banana - Ambun',
    'Banana - Cavendish', 'Banana - Cic Quality', 'Banana - Kolikuttu',
    'Banana - Seeni', 'Beli', 'Delum (Local)', 'Dragon Fruit', 'Durian',
    'Grapes - Black', 'Grapes - Red', 'Guava', 'Jambola', 'Katu Anoda',
    'Kiwi Fruits', 'Mandarin - Honey Small', 'Mandarin - Local',
    'Mandarin Imported', 'Mango - Bud', 'Mango - K/C', 'Mango - Tjc',
    'Mango - Vilad', 'Mangosteen', 'Melon - Cantaloupe', 'Melon - Dark Bell',
    'Melon - Red Fantasy', 'Orange - Local', 'Orange Imported', 'Papaya',
    'Passion Fruit', 'Pears - Green', 'Pears - Local', 'Pears - Red',
    'Pears - Yellow', 'Pineapple', 'Plums', 'Pomegranate', 'Rambutan',
    'Rose Apple', 'Watermelon', 'Woodapple',
  ],
}

const CATEGORY_OVERRIDES = {
  'Tomatoes': 'Tomato', 'Cherry Tomato': 'Tomato',
  'Big Onions': 'Onion', 'Red Onions': 'Onion', 'Onion Leaves': 'Onion',
  'Green Beans': 'Beans', 'Long Beans': 'Beans',
  'Baby Potatoes': 'Potato', 'Potatoes': 'Potato',
  'Bell Pepper Green': 'Bell Pepper', 'Bell Pepper Red': 'Bell Pepper',
  'Brinjals': 'Brinjal', 'Egg Plants': 'Brinjal',
  'Thalana Batu': 'Brinjal', 'Tib Batu': 'Brinjal',
  'Red Cabbage': 'Cabbage', 'Cabbage Leaves': 'Cabbage',
  'Salad Cucumber': 'Cucumber', 'Green Cucumber': 'Cucumber', 'Kekiri': 'Cucumber',
  'Japanese Leeks': 'Leeks',
  'Iceberg Lettuce': 'Lettuce', 'Salad Leaves': 'Lettuce',
  'Mandarin Imported': 'Mandarin',
  'Orange Imported': 'Orange',
  'Kiwi Fruits': 'Kiwi',
  'Ash Plantains': 'Plantain',
  'Raddish': 'Radish', 'Korean Long Raddish': 'Radish',
  'Coriander Leaves': 'Coriander',
  'Minchi Leaves': 'Mint',
  'Mango Curry': 'Mango',
  'Curry Leaves': 'Curry Leaves',
}

function getCategory(itemName) {
  if (CATEGORY_OVERRIDES[itemName]) return CATEGORY_OVERRIDES[itemName]
  if (itemName.includes(' - ')) return itemName.split(' - ')[0]
  return itemName
}

const BRANCHES = [
  'Colombo 3', 'Colombo 7', 'Nugegoda', 'Maharagama',
  'Kandy', 'Galle', 'Negombo', 'Kurunegala',
]

function PhotoInstructions() {
  return (
    <div className="photo-instructions">
      <p className="photo-instructions-text">
        Photograph the item exactly as it sits on the scale. If it is in a bag,
        photograph it in the bag. Always shoot from directly above — camera pointing
        straight down. Fill the frame with the produce.
      </p>
      <div className="photo-diagram">
        <svg viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Camera body */}
          <rect x="70" y="4" width="40" height="28" rx="5" stroke="#1d6f42" strokeWidth="2" fill="#eaf7ec"/>
          <circle cx="90" cy="18" r="8" stroke="#1d6f42" strokeWidth="2" fill="#fff"/>
          <circle cx="90" cy="18" r="4" fill="#1d6f42" opacity="0.4"/>
          <rect x="78" y="4" width="10" height="5" rx="2" fill="#1d6f42" opacity="0.4"/>
          {/* Arrow pointing down */}
          <line x1="90" y1="32" x2="90" y2="68" stroke="#1d6f42" strokeWidth="2" strokeDasharray="4 3"/>
          <polygon points="90,78 84,66 96,66" fill="#1d6f42"/>
          {/* Scale platform */}
          <rect x="30" y="82" width="120" height="10" rx="4" fill="#1d6f42" opacity="0.15" stroke="#1d6f42" strokeWidth="1.5"/>
          {/* Produce on platform */}
          <ellipse cx="90" cy="82" rx="28" ry="12" fill="#1d6f42" opacity="0.25"/>
          <ellipse cx="90" cy="80" rx="22" ry="9" fill="#3db549" opacity="0.5"/>
        </svg>
        <span className="photo-diagram-label">Shoot from above</span>
      </div>
    </div>
  )
}

function ImageZone({ image, onImage }) {
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    onImage({ file, url: URL.createObjectURL(file) })
  }

  return (
    <div
      className={`image-zone ${image ? 'image-zone--filled' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
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

function PresentationToggle({ value, onChange }) {
  return (
    <div className="pres-tiles">
      <button
        type="button"
        className={`pres-tile ${value === 'loose' ? 'pres-tile--active' : ''}`}
        onClick={() => onChange('loose')}
      >
        <svg className="pres-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <ellipse cx="20" cy="28" rx="13" ry="6" />
          <path d="M10 28 Q8 20 12 15 Q16 10 20 12 Q24 10 28 15 Q32 20 30 28" />
        </svg>
        <span className="pres-tile-label">Loose</span>
        <span className="pres-tile-sub">Item on scale, no bag</span>
      </button>
      <button
        type="button"
        className={`pres-tile ${value === 'bagged' ? 'pres-tile--active' : ''}`}
        onClick={() => onChange('bagged')}
      >
        <svg className="pres-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M14 10 Q13 8 15 7 L25 7 Q27 8 26 10 L28 32 Q28 34 26 34 L14 34 Q12 34 12 32 Z"/>
          <path d="M16 10 Q18 13 20 13 Q22 13 24 10"/>
          <ellipse cx="20" cy="24" rx="5" ry="4" strokeDasharray="2 2"/>
        </svg>
        <span className="pres-tile-label">Bagged</span>
        <span className="pres-tile-sub">Item in transparent bag</span>
      </button>
    </div>
  )
}

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

  useEffect(() => { if (!value) setQuery('') }, [value])

  const select = (item) => {
    setQuery(item)
    onChange(item)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="text"
        className="field-input"
        placeholder="Search produce…"
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="combo-list">
          {filtered.map(p => (
            <li key={p} className="combo-item" onMouseDown={() => select(p)}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function UploadScreen() {
  const [image, setImage] = useState(null)
  const [category, setCategory] = useState('vege')
  const [produceName, setProduceName] = useState('')
  const [presentation, setPresentation] = useState(null)
  const [branch, setBranch] = useState('')
  const [uploadedBy, setUploadedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [todayCount, setTodayCount] = useState(0)

  const produceOptions = PRODUCE[category]

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setProduceName('')
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
    if (!image) { toast.error('Please take a photo'); return }
    if (!produceName.trim()) { toast.error('Please select a produce item'); return }
    if (!presentation) { toast.error('Please select Loose or Bagged'); return }

    if (!supabaseReady) {
      toast.error('Add your credentials in .env to enable submissions')
      return
    }

    setLoading(true)
    try {
      let imageUrl
      try {
        imageUrl = await uploadImageToCloudinary(image.file)
      } catch {
        throw new Error('Image upload failed. Check Cloudinary credentials in Vercel settings.')
      }

      const { error } = await supabase.from('uploads').insert({
        item_name: produceName.trim(),
        category: getCategory(produceName.trim()),
        presentation,
        angle: 'top',
        branch,
        notes: notes.trim() || null,
        image_url: imageUrl,
        uploaded_by: uploadedBy.trim() || null,
      })
      if (error) throw new Error('Database save failed: ' + error.message)

      toast.success('Image submitted! Keep going.')
      localStorage.setItem('sp_name', uploadedBy)
      localStorage.setItem('sp_branch', branch)

      setImage(null)
      setProduceName('')
      setPresentation(null)
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
          <img src="/keells-logo.png" alt="SmartProduce" className="header-logo" />
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
          <PhotoInstructions />

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
            <label className="field-label">Item <span className="required">*</span></label>
            <ProduceCombobox
              value={produceName}
              onChange={setProduceName}
              options={produceOptions}
            />
            {produceName && (
              <span className="category-tag">
                Category: {getCategory(produceName)}
              </span>
            )}
          </div>

          <div className="field">
            <label className="field-label">Presentation <span className="required">*</span></label>
            <PresentationToggle value={presentation} onChange={setPresentation} />
          </div>

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
