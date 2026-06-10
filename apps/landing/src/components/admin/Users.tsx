import React, { useState, useEffect } from 'react'
import { UserPlus, Edit2, Trash2, X, Save } from 'lucide-react'
import { API_URL } from '../../utils/api'

type User = {
  id: number
  email: string
  name: string
  created_at: string
}

type UserForm = {
  email: string
  password: string
  name: string
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserForm>({
    email: '',
    password: '',
    name: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários')
      }

      const data = await response.json()
      setUsers(data.data)
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar usuários')
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setFormData({ email: '', password: '', name: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setFormData({ email: user.email, password: '', name: user.name })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({ email: '', password: '', name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('admin-token')
      const url = editingUser
        ? `${API_URL}/api/users/${editingUser.id}`
        : `${API_URL}/api/users`

      const body = editingUser
        ? // When editing, only send fields that changed
          {
            ...(formData.email !== editingUser.email && { email: formData.email }),
            ...(formData.name !== editingUser.name && { name: formData.name }),
            ...(formData.password && { password: formData.password })
          }
        : formData

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Erro ao salvar usuário')
        return
      }

      alert(data.message || 'Usuário salvo com sucesso!')
      handleCloseModal()
      fetchUsers()
    } catch (err) {
      alert('Erro ao salvar usuário')
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return
    }

    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Erro ao deletar usuário')
        return
      }

      alert(data.message || 'Usuário deletado com sucesso!')
      fetchUsers()
    } catch (err) {
      alert('Erro ao deletar usuário')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Carregando usuários...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Gerenciamento de Usuários</h2>
          <p className="text-slate-600">Gerencie usuários com acesso ao painel admin</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Nome</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Criado em</th>
                <th className="text-right py-3 px-4 text-slate-600 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-800">{user.id}</td>
                  <td className="py-3 px-4 text-slate-800">{user.name}</td>
                  <td className="py-3 px-4 text-slate-800">{user.email}</td>
                  <td className="py-3 px-4 text-slate-800">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Senha {editingUser && '(deixe em branco para não alterar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingUser}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
