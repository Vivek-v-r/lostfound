import { Link } from 'react-router-dom'

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#e5e7eb" width="400" height="300"/><text fill="#9ca3af" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'
)

const statusColors = {
  lost: 'bg-red-50 text-red-700 border-red-200',
  found: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  claimed: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-blue-50 text-blue-700 border-blue-200',
}

const categoryIcons = {
  Electronics: '🖥️',
  Documents: '📄',
  Accessories: '⌚',
  Books: '📚',
  Keys: '🔑',
  Clothing: '👕',
  Other: '📦',
}

const categoryColors = {
  Electronics: 'from-orange-100 to-amber-100 text-amber-800 border-amber-200',
  Documents: 'from-blue-100 to-cyan-100 text-blue-800 border-blue-200',
  Accessories: 'from-purple-100 to-pink-100 text-purple-800 border-purple-200',
  Books: 'from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200',
  Keys: 'from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200',
  Clothing: 'from-rose-100 to-red-100 text-rose-800 border-rose-200',
  Other: 'from-gray-100 to-stone-100 text-gray-800 border-gray-200',
}

export default function ItemCard({ item, index = 0 }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className={`group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
    >
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        <img
          src={item.photo_url || PLACEHOLDER}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm bg-white/90 backdrop-blur-sm ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm bg-gradient-to-r ${categoryColors[item.category] || 'from-gray-100 to-gray-100 text-gray-700 border-gray-200'}`}>
            {categoryIcons[item.category] || '📦'} {item.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>
        </div>
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          {item.location ? (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {item.location}
            </span>
          ) : <span />}
          <span className="text-gray-400">{new Date(item.date_posted).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
