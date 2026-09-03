import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import VerificationModal from '../components/VerificationModal'

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect fill="#e5e7eb" width="800" height="600"/><text fill="#9ca3af" font-family="sans-serif" font-size="30" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'
)

const statusColors = {
  lost: 'bg-red-50 text-red-700 border-red-200',
  found: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  claimed: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [claimResult, setClaimResult] = useState(null)

  useEffect(() => {
    API.get(`/api/items/${id}/`)
      .then(({ data }) => setItem(data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="animate-shimmer h-8 w-48 rounded-lg mb-8" />
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 h-80 animate-shimmer" />
            <div className="p-6 md:w-1/2 space-y-4">
              <div className="h-6 w-24 rounded-lg animate-shimmer" />
              <div className="h-8 w-3/4 rounded-lg animate-shimmer" />
              <div className="h-20 w-full rounded-lg animate-shimmer" />
              <div className="h-4 w-1/2 rounded-lg animate-shimmer" />
              <div className="h-12 w-full rounded-xl animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto mt-24 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <p className="text-xl font-medium text-gray-400">Item not found</p>
        <Link to="/" className="text-indigo-600 hover:underline mt-2 inline-block">&larr; Back to browse</Link>
      </div>
    )
  }

  const canClaim = user && user.id !== item.posted_by && item.status !== 'claimed' && item.status !== 'resolved'

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16 px-4 animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to browse
      </Link>

      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-50 relative overflow-hidden">
            <img
              src={item.photo_url || PLACEHOLDER}
              alt={item.title}
              className="w-full h-80 md:h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border shadow-sm bg-white/90 backdrop-blur-sm ${statusColors[item.status]}`}>
                {statusIcons[item.status]} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="p-8 md:w-1/2 flex flex-col">
            <div className="mb-2">
              <span className="inline-flex items-center text-xs bg-gradient-to-r from-orange-50 to-indigo-50 text-gray-700 px-3 py-1 rounded-full font-medium border border-orange-200/50">
                {item.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

            {item.description && (
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mb-6">{item.description}</p>
            )}

            <div className="space-y-3 text-sm mb-8 bg-gray-50 rounded-xl p-4">
              {item.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {item.location}
                </div>
              )}
              {item.date_found && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(item.date_found).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Posted {new Date(item.date_posted).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              {item.poster_name && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Posted by <span className="font-medium text-gray-700">{item.poster_name}</span>
                </div>
              )}
            </div>

            <div className="mt-auto">
              {claimResult ? (
                <div className={`p-4 rounded-xl text-sm font-medium animate-scale-in ${
                  claimResult.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{claimResult.status === 'approved' ? '✅' : '❌'}</span>
                    <span>{claimResult.message}</span>
                  </div>
                </div>
              ) : canClaim ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-indigo-600 text-white py-3.5 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all animate-pulse-glow"
                >
                  Claim This Item
                </button>
              ) : user && user.id === item.posted_by ? (
                <div className="p-4 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium text-center border border-indigo-100">
                  You posted this item
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 text-gray-400 text-sm font-medium text-center border border-gray-100">
                  This item has been claimed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <VerificationModal
          itemId={item.id}
          onClose={() => setShowModal(false)}
          onResult={setClaimResult}
        />
      )}
    </div>
  )
}
