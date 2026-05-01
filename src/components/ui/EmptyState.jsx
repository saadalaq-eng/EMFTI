export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={26} className="text-gray-400" />
      </div>
      <p className="text-gray-800 font-medium mb-1">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm max-w-xs">{description}</p>
      )}
    </div>
  )
}
