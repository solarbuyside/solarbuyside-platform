import React, { useState } from 'react'
import { LogOut, Home, BarChart3, Edit3, Users as UsersIcon, UserCog } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Dashboard } from './Dashboard'
import { Leads } from './Leads'
import { Users } from './Users'
import { AdminPanel } from './AdminPanel'

type Tab = 'dashboard' | 'editor' | 'leads' | 'users'

export const AdminTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Ver Site</span>
            </a>
            <div className="h-6 w-px bg-slate-300"></div>
            <h1 className="text-xl font-bold text-slate-800">Painel de Administração</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'dashboard'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <BarChart3 size={18} />
              <span>Dashboard</span>
              {activeTab === 'dashboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'editor'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Edit3 size={18} />
              <span>Edição</span>
              {activeTab === 'editor' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'leads'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <UsersIcon size={18} />
              <span>Leads</span>
              {activeTab === 'leads' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'users'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <UserCog size={18} />
              <span>Usuários</span>
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      {activeTab === 'editor' ? (
        <div className="max-w-7xl mx-auto p-6">
          <AdminPanel hideHeader={true} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'leads' && <Leads />}
          {activeTab === 'users' && <Users />}
        </div>
      )}
    </div>
  )
}
