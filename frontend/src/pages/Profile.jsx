import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

const badgeColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  found: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  claimed: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function Profile() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [tab, setTab] = useState('items')
  const [loading, setLoading] = useState({ items: true, claims: true })

  useEffect(() => {
    API.get('/api/items/').then(({ data }) => {
      setItems(data.items.filter((i) => i.posted_by === user.id))
    }).catch(() => {}).finally(() => setLoading((p) => ({ ...p, items: false })))
  }, [user.id])

  useEffect(() => {
    API.get('/api/claims/my/').then(({ data }) => setClaims(data))
      .catch(() => {}).finally(() => setLoading((p) => ({ ...p, claims: false })))
  }, [])

  const stats = [
    { label: 'Items Posted', value: items.length, color: 'from-indigo-500 to-purple-500' },
    { label: 'Pending Claims', value: claims.filter((c) => c.status === 'pending').length, color: 'from-amber-500 to-orange-500' },
    { label: 'Approved Claims', value: claims.filter((c) => c.status === 'approved').length, color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span className="inline-block mt-1.5 text-xs font-medium bg-gradient-to-r from-orange-50 to-indigo-50 text-gray-700 px-2.5 py-0.5 rounded-full border border-orange-200/50 capitalize">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {['items', 'claims'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'items' ? `My Items (${items.length})` : `My Claims (${claims.length})`}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <>
          {loading.items ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-shimmer" />
            ))}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-gray-400 font-medium">No items posted yet</p>
              <Link to="/post" className="text-orange-600 hover:text-indigo-600 text-sm hover:underline mt-1 inline-block transition-colors">Post your first item</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <Link key={item.id} to={`/items/${item.id}`}
                  className={`block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden hidden sm:block">
                        {item.photo_url && (
                          <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.category}{item.location ? ` — ${item.location}` : ''}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'claims' && (
        <>
          {loading.claims ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-shimmer" />
            ))}</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <p className="text-gray-400 font-medium">No claims made yet</p>
              <Link to="/" className="text-orange-600 hover:text-indigo-600 text-sm hover:underline mt-1 inline-block transition-colors">Browse items to claim</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim, i) => (
                <div key={claim.id}
                  className={`bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Link to={`/items/${claim.item_id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                        {claim.item_title || `Item #${claim.item_id}`}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Claimed {new Date(claim.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColors[claim.status] || 'bg-gray-100 text-gray-600'}`}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
