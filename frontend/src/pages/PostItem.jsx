import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const CATEGORIES = ['Electronics', 'Documents', 'Accessories', 'Books', 'Keys', 'Clothing', 'Other']

const defaultQuestions = {
  Electronics: { brand: '', color: '', model: '' },
  Documents: { name_on_doc: '', doc_type: '', issuing_authority: '' },
  Accessories: { color: '', brand: '', material: '' },
  Books: { title: '', author: '', isbn: '' },
  Keys: { key_count: '', keychain_color: '', key_type: '' },
  Clothing: { size: '', color: '', brand: '' },
  Other: { detailed_desc: '', condition: '', distinguishing_feature: '' },
}

export default function PostItem() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '', description: '', category: 'Electronics', location: '', date_found: '', status: 'lost',
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [useVerification, setUseVerification] = useState(false)
  const [verificationDetails, setVerificationDetails] = useState(defaultQuestions)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleVerificationChange = (key, value) => {
    setVerificationDetails((prev) => ({
      ...prev,
      [form.category]: { ...prev[form.category], [key]: value },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('category', form.category)
      fd.append('location', form.location)
      fd.append('status', form.status)
      if (form.date_found) fd.append('date_found', new Date(form.date_found).toISOString())
      if (photo) fd.append('photo', photo)
      if (useVerification) {
        const vd = verificationDetails[form.category]
        const filtered = Object.fromEntries(Object.entries(vd).filter(([, v]) => v.trim()))
        if (Object.keys(filtered).length > 0) fd.append('verification_details', JSON.stringify(filtered))
      }
      const { data } = await API.post('/api/items/', fd)
      navigate(`/items/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post item')
    } finally {
      setSubmitting(false)
    }
  }

  const questions = defaultQuestions[form.category] || {}
  const canGoNext = form.title.trim() && form.category

  return (
    <div className="max-w-2xl mx-auto mt-8 mb-16 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Post an Item</h2>
            <p className="text-sm text-gray-500">Help reunite items with their owners.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl mb-6 border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <div className="flex gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-gradient-to-r from-orange-500 to-indigo-600' : 'bg-gray-200'}`} />
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input name="title" required value={form.title} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="e.g. Blue Samsung Galaxy Phone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                  placeholder="Describe the item in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select name="category" required value={form.category} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white transition-all">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status *</label>
                  <select name="status" required value={form.status} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white transition-all">
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    placeholder="e.g. Library, 3rd floor" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" name="date_found" value={form.date_found} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('photo-input').click()}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <div className="text-gray-400">
                      <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-sm">Click to upload a photo</p>
                    </div>
                  )}
                  <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={!canGoNext}
                  className="                  bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50">
                  Next — Verification
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <div className="flex gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-gradient-to-r from-orange-500 to-indigo-600' : 'bg-gray-200'}`} />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-gradient-to-r from-orange-50 to-indigo-50 rounded-xl p-5 border border-orange-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${useVerification ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                    {useVerification && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                    <input type="checkbox" checked={useVerification} onChange={(e) => setUseVerification(e.target.checked)} className="hidden" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Add verification questions</span>
                    <p className="text-xs text-gray-500">Helps ensure the item goes to the right owner</p>
                  </div>
                </label>
              </div>

              {useVerification && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm font-medium text-gray-700">Set the expected answers:</p>
                  {Object.entries(questions).map(([key, val]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <input value={val} onChange={(e) => handleVerificationChange(key, e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1                    bg-gradient-to-r from-orange-500 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50">
                  {submitting ? 'Posting...' : 'Post Item'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
