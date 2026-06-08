import React, { useState } from 'react'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const success = await login(email, password)
    if (success) {
      window.location.reload()
    } else {
      setError('Nao foi possivel autenticar. Verifique email/senha ou conexao com o backend.')
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] bg-[#F97316]/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Painel Admin</h1>
            <p className="text-slate-400">Acesse o gerenciador de conteúdo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#F97316] hover:bg-[#ea6a0a] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F97316]/20"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <a
              href="/"
              className="text-sm text-slate-400 hover:text-[#F97316] transition-colors"
            >
              ← Voltar para o site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
