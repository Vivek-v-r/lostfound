import { useState, useEffect } from 'react'
import API from '../api/axios'

export default function VerificationModal({ itemId, onClose, onResult }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    API.get(`/api/claims/questions/${itemId}/`)
      .then(({ data }) => {
        setQuestions(data)
        const initial = {}
        data.forEach((q) => { initial[q.id] = '' })
        setAnswers(initial)
        setStep('questions')
      })
      .catch(() => {
        setError('Failed to load verification questions.')
        setStep('error')
      })
  }, [itemId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const filled = Object.values(answers).filter((v) => v.trim())
    if (filled.length < questions.length) {
      setError('Please answer all questions.')
      return
    }
    setStep('submitting')
    setError('')
    try {
      const { data } = await API.post('/api/claims/verify/', { item_id: itemId, answers })
      onResult(data)
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed.')
      setStep('questions')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={() => { if (step !== 'submitting') onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Loading questions...</p>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={onClose} className="text-sm text-orange-600 hover:text-indigo-600 hover:underline transition-colors">Close</button>
          </div>
        )}

        {step === 'questions' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Verify Ownership</h3>
                <p className="text-sm text-gray-500">Answer these questions to prove you are the owner.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl mb-4 border border-red-100 animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {q.question}
                    <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    required
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm transition-all"
                    placeholder="Your answer..."
                    autoFocus={i === 0}
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                  Verify &amp; Claim
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'submitting' && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Verifying your answers...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-6 animate-scale-in">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-lg font-semibold text-gray-900">Verification Complete</p>
            <p className="text-sm text-gray-500 mt-1">You can view the result on the item page.</p>
            <button
              onClick={onClose}
              className="mt-6 bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
