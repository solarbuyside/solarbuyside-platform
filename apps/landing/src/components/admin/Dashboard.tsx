import React, { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  Eye,
  Download,
  Mail,
  ShoppingCart,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Percent,
} from 'lucide-react'
import { API_URL } from '../../utils/api'

type Metrics = {
  total_visitors: number
  avg_time_on_site: number
  avg_sections_depth: number
  ebook_downloads: number
  newsletter_subs: number
  buy_clicks: number
  daily_stats: Array<{
    date: string
    visitors: number
    ebook_downloads: number
    newsletter_subs: number
    buy_clicks: number
  }>
  section_funnel: Array<{
    section_name: string
    unique_visitors: number
    total_views: number
    avg_time_seconds: number
  }>
}

type PeriodFilter = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom'
type SortType = 'default' | 'visitors' | 'time' | 'alphabetical'

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<PeriodFilter>('last30days')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [sortType, setSortType] = useState<SortType>('default')

  useEffect(() => {
    fetchMetrics()
  }, [period, customStart, customEnd])

  // Função para obter data no timezone de Brasília (GMT-3)
  const getBrazilDate = (daysOffset = 0) => {
    const now = new Date()
    const brazilTime = new Date(now.getTime() + daysOffset * 86400000)
    // Converter para timezone de Brasília (GMT-3)
    const brazilOffset = -3 * 60 // -3 horas em minutos
    const localOffset = brazilTime.getTimezoneOffset() // offset local em minutos
    const diff = localOffset - brazilOffset
    brazilTime.setMinutes(brazilTime.getMinutes() + diff)
    return brazilTime.toISOString().split('T')[0]
  }

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin-token')

      let url = `${API_URL}/api/admin/metrics`
      const params = new URLSearchParams()

      if (period === 'today') {
        const today = getBrazilDate()
        params.append('start_date', today)
        params.append('end_date', today)
      } else if (period === 'yesterday') {
        const yesterday = getBrazilDate(-1)
        params.append('start_date', yesterday)
        params.append('end_date', yesterday)
      } else if (period === 'last7days') {
        const start = getBrazilDate(-7)
        const end = getBrazilDate()
        params.append('start_date', start)
        params.append('end_date', end)
      } else if (period === 'custom' && customStart && customEnd) {
        params.append('start_date', customStart)
        params.append('end_date', customEnd)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas')
      }

      const data = await response.json()
      setMetrics(data.data)
      setLoading(false)
    } catch (err) {
      setError('Erro ao carregar métricas')
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const calculateConversionRate = () => {
    if (!metrics || metrics.total_visitors === 0) return 0
    const totalLeads = metrics.ebook_downloads + metrics.newsletter_subs
    return ((totalLeads / metrics.total_visitors) * 100).toFixed(1)
  }

  const exportToCSV = () => {
    if (!metrics) return

    // Métricas gerais
    const summary = [
      'RESUMO DE ANALYTICS',
      `Período: ${getPeriodLabel()}`,
      '',
      'MÉTRICAS GERAIS',
      `Visitantes Únicos,${metrics.total_visitors}`,
      `Tempo Médio no Site,${formatTime(metrics.avg_time_on_site)}`,
      `Seções Vistas (média),${metrics.avg_sections_depth}`,
      `Taxa de Conversão,${calculateConversionRate()}%`,
      `Downloads Ebook,${metrics.ebook_downloads}`,
      `Inscritos Newsletter,${metrics.newsletter_subs}`,
      `Cliques Comprar,${metrics.buy_clicks}`,
      '',
      'FUNIL DE SEÇÕES',
      'Seção,Visitantes Únicos,Visualizações,Tempo Médio'
    ]

    const sectionRows = metrics.section_funnel.map(s =>
      `${getSectionDisplayName(s.section_name)},${s.unique_visitors},${s.total_views},${formatTime(s.avg_time_seconds)}`
    )

    const dailyHeaders = ['', 'ESTATÍSTICAS DIÁRIAS', 'Data,Visitantes,Ebook,Newsletter,Compras']
    const dailyRows = metrics.daily_stats.map(stat => [
      new Date(stat.date).toLocaleDateString('pt-BR'),
      stat.visitors,
      stat.ebook_downloads,
      stat.newsletter_subs,
      stat.buy_clicks
    ].join(','))

    const csvContent = [...summary, ...sectionRows, ...dailyHeaders, ...dailyRows].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportToExcel = () => {
    if (!metrics) return

    // Criar conteúdo estruturado para Excel
    const summary = [
      'RESUMO DE ANALYTICS',
      `Período:\t${getPeriodLabel()}`,
      '',
      'MÉTRICAS GERAIS',
      `Visitantes Únicos\t${metrics.total_visitors}`,
      `Tempo Médio no Site\t${formatTime(metrics.avg_time_on_site)}`,
      `Seções Vistas (média)\t${metrics.avg_sections_depth}`,
      `Taxa de Conversão\t${calculateConversionRate()}%`,
      `Downloads Ebook\t${metrics.ebook_downloads}`,
      `Inscritos Newsletter\t${metrics.newsletter_subs}`,
      `Cliques Comprar\t${metrics.buy_clicks}`,
      '',
      'FUNIL DE SEÇÕES',
      'Seção\tVisitantes Únicos\tVisualizações\tTempo Médio'
    ]

    const sectionRows = metrics.section_funnel.map(s =>
      `${getSectionDisplayName(s.section_name)}\t${s.unique_visitors}\t${s.total_views}\t${formatTime(s.avg_time_seconds)}`
    )

    const dailyHeaders = ['', 'ESTATÍSTICAS DIÁRIAS', 'Data\tVisitantes\tEbook\tNewsletter\tCompras']
    const dailyRows = metrics.daily_stats.map(stat => [
      new Date(stat.date).toLocaleDateString('pt-BR'),
      stat.visitors,
      stat.ebook_downloads,
      stat.newsletter_subs,
      stat.buy_clicks
    ].join('\t'))

    const excelContent = [...summary, ...sectionRows, ...dailyHeaders, ...dailyRows].join('\n')

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analytics_${period}_${new Date().toISOString().split('T')[0]}.xls`
    link.click()
  }

  const exportToPDF = () => {
    window.print()
  }

  const getSectionDisplayName = (sectionName: string) => {
    const names: { [key: string]: string } = {
      'hero': 'Seção 1: Hero',
      'contexto': 'Seção 2: Contexto',
      'video-section': 'Seção 3: Vídeo',
      'audiencia': 'Seção 4: Audiência',
      'manual-strategic': 'Seção 5: Manual Estratégico',
      'depoimentos': 'Seção 6: Depoimentos',
      'story-bridge': 'Seção 7: Ponte História',
      'seller-code': 'Seção 8: Código do Vendedor',
      'oferta': 'Seção 9: Oferta',
      'buyer-wave': 'Seção 10: Onda do Comprador',
      'authority': 'Seção 11: Autoridade',
      'oferta-final': 'Seção 12: Oferta Final',
      'lead-magnet': 'Seção 13: Lead Magnet',
      'newsletter': 'Seção 14: Newsletter',
      'faq': 'Seção 15: FAQ'
    }
    return names[sectionName] || sectionName
  }

  const getSortedSections = () => {
    if (!metrics) return []

    const sections = [...metrics.section_funnel]

    switch (sortType) {
      case 'visitors':
        return sections.sort((a, b) => b.unique_visitors - a.unique_visitors)
      case 'time':
        return sections.sort((a, b) => b.avg_time_seconds - a.avg_time_seconds)
      case 'alphabetical':
        return sections.sort((a, b) =>
          getSectionDisplayName(a.section_name).localeCompare(getSectionDisplayName(b.section_name))
        )
      case 'default':
      default:
        // Mantém a ordem original (ordem da landing page)
        return sections
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Hoje'
      case 'yesterday': return 'Ontem'
      case 'last7days': return 'Últimos 7 dias'
      case 'last30days': return 'Últimos 30 dias'
      case 'custom': return 'Período personalizado'
      default: return 'Últimos 30 dias'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Carregando métricas...</div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error || 'Erro ao carregar dados'}</div>
      </div>
    )
  }

  const metricCards = [
    {
      title: 'Visitantes Únicos',
      value: metrics.total_visitors,
      icon: <Users className="text-blue-500" size={24} />,
      subtitle: getPeriodLabel(),
      helpText: 'Total de sessões únicas no período selecionado',
    },
    {
      title: 'Tempo Médio',
      value: formatTime(metrics.avg_time_on_site),
      icon: <Clock className="text-green-500" size={24} />,
      subtitle: 'No site',
      helpText: 'Tempo médio que os visitantes ficam navegando no site',
    },
    {
      title: 'Seções Vistas',
      value: metrics.avg_sections_depth.toFixed(1),
      icon: <Eye className="text-purple-500" size={24} />,
      subtitle: 'Média por visita',
      helpText: 'Número médio de seções visualizadas por sessão',
    },
    {
      title: 'Taxa de Conversão',
      value: `${calculateConversionRate()}%`,
      icon: <Percent className="text-pink-500" size={24} />,
      subtitle: 'Visitantes → Leads',
      helpText: 'Percentual de visitantes que se tornaram leads (ebook ou newsletter)',
    },
    {
      title: 'Downloads Ebook',
      value: metrics.ebook_downloads,
      icon: <Download className="text-orange-500" size={24} />,
      subtitle: getPeriodLabel(),
      helpText: 'Total de downloads do ebook no período',
    },
    {
      title: 'Inscritos Newsletter',
      value: metrics.newsletter_subs,
      icon: <Mail className="text-cyan-500" size={24} />,
      subtitle: getPeriodLabel(),
      helpText: 'Total de inscrições na newsletter no período',
    },
    {
      title: 'Cliques Comprar',
      value: metrics.buy_clicks,
      icon: <ShoppingCart className="text-green-600" size={24} />,
      subtitle: getPeriodLabel(),
      helpText: 'Total de cliques no botão de compra no período',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header com Título e Filtros */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Dashboard Analytics</h2>
          <p className="text-slate-600">{getPeriodLabel()}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro de Período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="last7days">Últimos 7 dias</option>
            <option value="last30days">Últimos 30 dias</option>
            <option value="custom">Personalizado</option>
          </select>

          {/* Datas Personalizadas */}
          {period === 'custom' && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-600">até</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {/* Botões de Exportação */}
          <div className="flex items-center gap-2 border-l border-slate-300 pl-3 no-print">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              title="Exportar CSV"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              title="Exportar Excel"
            >
              <FileSpreadsheet size={18} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              title="Exportar PDF"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">{card.icon}</div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-slate-800 mb-1">{card.value}</p>
            <p className="text-slate-500 text-xs mb-2">{card.subtitle}</p>
            <p className="text-slate-400 text-xs italic">{card.helpText}</p>
          </div>
        ))}
      </div>

      {/* Section Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Funil de Conversão por Seção</h3>
            <p className="text-slate-600 text-sm mt-1">Acompanhe quantos visitantes chegam em cada seção do site</p>
          </div>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Ordem da Landing Page</option>
            <option value="visitors">Mais Visitantes</option>
            <option value="time">Maior Tempo Médio</option>
            <option value="alphabetical">Ordem Alfabética</option>
          </select>
        </div>
        <div className="space-y-3 mt-4">
          {getSortedSections().map((section, index) => {
            // Calcular porcentagem relativa entre as seções (soma de todas = 100%)
            const totalSectionVisitors = metrics.section_funnel.reduce(
              (sum, s) => sum + s.unique_visitors,
              0
            )
            const percentage = totalSectionVisitors > 0
              ? ((section.unique_visitors / totalSectionVisitors) * 100).toFixed(1)
              : '0'
            return (
              <div key={section.section_name} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 w-8">{index + 1}.</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {getSectionDisplayName(section.section_name)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">
                      <strong>{section.unique_visitors}</strong> visitantes
                    </span>
                    <span className="text-sm text-slate-600">
                      <strong>{section.total_views}</strong> views
                    </span>
                    <span className="text-sm text-slate-600">
                      Tempo: <strong>{formatTime(section.avg_time_seconds)}</strong>
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Simple Daily Stats Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Estatísticas Diárias</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Data</th>
                <th className="text-right py-3 px-4 text-slate-600 font-medium">Visitantes</th>
                <th className="text-right py-3 px-4 text-slate-600 font-medium">Ebook</th>
                <th className="text-right py-3 px-4 text-slate-600 font-medium">Newsletter</th>
                <th className="text-right py-3 px-4 text-slate-600 font-medium">Compras</th>
              </tr>
            </thead>
            <tbody>
              {metrics.daily_stats.slice(-7).map((stat) => (
                <tr key={stat.date} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-800">
                    {new Date(stat.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="text-right py-3 px-4 text-slate-800">{stat.visitors}</td>
                  <td className="text-right py-3 px-4 text-slate-800">{stat.ebook_downloads}</td>
                  <td className="text-right py-3 px-4 text-slate-800">{stat.newsletter_subs}</td>
                  <td className="text-right py-3 px-4 text-slate-800">{stat.buy_clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print styles for PDF export */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .space-y-8, .space-y-8 * {
            visibility: visible;
          }
          .space-y-8 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button, .no-print {
            display: none !important;
          }
          .bg-white {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  )
}
