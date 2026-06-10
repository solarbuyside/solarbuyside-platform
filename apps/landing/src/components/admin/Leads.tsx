import React, { useState, useEffect } from 'react'
import { Download, Mail, BookOpen, MessageCircle } from 'lucide-react'
import { API_URL } from '../../utils/api'

type EbookLead = {
  id: number
  nome: string
  sobrenome: string
  email: string
  celular: string
  downloaded_at: string
}

type NewsletterSubscriber = {
  id: number
  email: string
  subscribed_at: string
}

type LeadTab = 'ebook' | 'newsletter'

export const Leads: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeadTab>('ebook')
  const [ebookLeads, setEbookLeads] = useState<EbookLead[]>([])
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('admin-token')

      const [ebookRes, newsletterRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/leads/ebook`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/leads/newsletter`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!ebookRes.ok || !newsletterRes.ok) {
        throw new Error('Erro ao carregar leads')
      }

      const ebookData = await ebookRes.json()
      const newsletterData = await newsletterRes.json()

      setEbookLeads(ebookData.data)
      setNewsletterSubs(newsletterData.data)
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar leads')
      setLoading(false)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('Sem dados para exportar')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Carregando leads...</div>
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
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestão de Leads</h2>
        <p className="text-slate-600">Visualize e exporte seus leads</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ebook')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'ebook'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} />
            <span>Ebook Leads ({ebookLeads.length})</span>
          </div>
          {activeTab === 'ebook' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('newsletter')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'newsletter'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Mail size={18} />
            <span>Newsletter ({newsletterSubs.length})</span>
          </div>
          {activeTab === 'newsletter' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Ebook Leads Table */}
      {activeTab === 'ebook' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Leads do Ebook</h3>
            <button
              onClick={() => exportToCSV(ebookLeads, 'ebook-leads.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Nome</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Celular</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {ebookLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800">{lead.id}</td>
                    <td className="py-3 px-4 text-slate-800">
                      {lead.nome} {lead.sobrenome}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{lead.email}</td>
                    <td className="py-3 px-4 text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{lead.celular}</span>
                        {lead.celular && (
                          <a
                            href={`https://wa.me/55${lead.celular.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {new Date(lead.downloaded_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {ebookLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Newsletter Subscribers Table */}
      {activeTab === 'newsletter' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Inscritos Newsletter</h3>
            <button
              onClick={() => exportToCSV(newsletterSubs, 'newsletter-subscribers.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Data de Inscrição</th>
                </tr>
              </thead>
              <tbody>
                {newsletterSubs.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800">{sub.id}</td>
                    <td className="py-3 px-4 text-slate-800">{sub.email}</td>
                    <td className="py-3 px-4 text-slate-800">
                      {new Date(sub.subscribed_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {newsletterSubs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      Nenhum inscrito encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
