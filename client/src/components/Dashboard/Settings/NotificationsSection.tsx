export default function NotificationsSection() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6">Notifications</h2>

      <div className="flex flex-wrap gap-12">
        <div className="flex items-center gap-6">
          <span className="text-lg">Email Updates</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:bg-green-500"></div>
            <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-lg">SMS Updates</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:bg-green-500"></div>
            <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
