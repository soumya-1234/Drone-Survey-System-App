"use client";

export default function Settings() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Flight Altitude
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue={50}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Flight Speed
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue={5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Units
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="metric"
                >
                  <option value="metric">Metric (meters)</option>
                  <option value="imperial">Imperial (feet)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="email-notifications"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="sms-notifications"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-900">
                  SMS Notifications
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">API Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="password"
                    className="block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value="••••••••••••••••"
                    readOnly
                  />
                  <button
                    type="button"
                    className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
