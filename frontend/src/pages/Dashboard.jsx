import { useState, useEffect } from 'react'
import API from '../api/axios'
import ItemCard from '../components/ItemCard'

const CATEGORIES = ['Electronics', 'Documents', 'Accessories', 'Books', 'Keys', 'Clothing', 'Other']

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in">
      <div className="h-52 animate-shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-lg animate-shimmer" />
        <div className="h-4 w-full rounded-lg animate-shimmer" />
        <div className="h-4 w-1/2 rounded-lg animate-shimmer" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', location: '', type: '', search: '' })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.location) params.location = filters.location
      if (filters.type) params.type = filters.type
      if (filters.search) params.search = filters.search
      const { data } = await API.get('/api/items/', { params })
      setItems(data.items)
      setTotal(data.total)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  return (
    <div>
      {/* Split Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700" />
          <div className="w-1/2 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700" />
        </div>

        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 0v40M0 20h40'/%3E%3C/g%3E%3C/svg%3E")` }} />
        </div>

        {/* Diagonal split accent line */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-full bg-white/20 hidden md:block" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-10 left-1/4 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 text-center md:text-left">
            {/* Mine side */}
            <div className="flex-1 text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-4 border border-white/20 text-orange-100">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                Looking for something?
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
                Mine?
              </h1>
              <p className="mt-3 text-lg text-orange-100/90 max-w-sm mx-auto md:mx-0">
                Browse lost items and claim what belongs to you.
              </p>
            </div>

            {/* VS divider */}
            <div className="relative animate-tilt-shake">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center rotate-45">
                <span className="text-lg font-black text-gray-800 -rotate-45">VS</span>
              </div>
            </div>

            {/* Yours side */}
            <div className="flex-1 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-4 border border-white/20 text-indigo-100">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                Found something?
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
                Yours?
              </h1>
              <p className="mt-3 text-lg text-indigo-100/90 max-w-sm mx-auto md:mx-0">
                Post found items and help someone reunite.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-10 flex justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-black text-white">{total}</div>
              <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Items</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">{items.filter(i => i.status === 'lost').length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Lost</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">{items.filter(i => i.status === 'found').length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wider mt-1">Found</div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="relative">
          <svg className="absolute bottom-0 w-full h-8 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C69.12,100.68,138.45,96.11,207.92,85.14Z" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm bg-gray-50/50"
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm bg-gray-50/50 min-w-[140px]"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm bg-gray-50/50 min-w-[110px]"
            >
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm bg-gray-50/50 w-36"
            />
            <button
              onClick={fetchItems}
              className="bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Filter
            </button>
            <button
              onClick={() => { setFilters({ category: '', location: '', type: '', search: '' }); setTimeout(fetchItems, 0) }}
              className="border border-gray-200 text-gray-500 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{total}</span> item{total !== 1 ? 's' : ''} found
          </p>
          {!loading && items.length > 0 && (
            <div className="flex gap-1">
              {['All', 'Lost', 'Found'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    const type = t === 'All' ? '' : t.toLowerCase()
                    setFilters(prev => ({ ...prev, type }))
                    setTimeout(() => {
                      const params = { ...filters, type }
                      API.get('/api/items/', { params }).then(({ data }) => { setItems(data.items); setTotal(data.total) })
                    }, 0)
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    (t === 'All' && !filters.type) || (t.toLowerCase() === filters.type)
                      ? 'bg-gradient-to-r from-orange-100 to-indigo-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-xl font-medium text-gray-400">No items found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or be the first to post.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
