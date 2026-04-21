import { useState } from 'react';
import { GeneralSettingsPage } from './GeneralSettingsPage';
import { UserManagement } from './UserManagement';
import { Permissions } from './Permissions';
import { Users, Settings as SettingsIcon } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'general'>('general');

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 overflow-x-auto">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-blue-600 font-medium'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'text-blue-600 border-blue-600 font-medium'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'text-blue-600 border-blue-600 font-medium'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            General Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'permissions' && <Permissions />}
        {activeTab === 'general' && <GeneralSettingsPage />}
      </div>
    </div>
  );
}