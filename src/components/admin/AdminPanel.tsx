import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LogOut, Home, Save, Upload, Monitor, Smartphone, ExternalLink, ChevronDown, ChevronUp, Image as ImageIcon, Phone, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useContent } from '../../contexts/ContentContext'
import { AdminPreview } from './AdminPreview'
import { SECTION_EDITOR_SCHEMA } from './editorSchema'
import { LEGAL_PREVIEW_CONFIG } from './legalPreviewConfig'

type ViewMode = 'desktop' | 'mobile'

interface AdminPanelProps {
  hideHeader?: boolean
}

const DESKTOP_VIEWPORT = { width: 1920, height: 1080 }
const MOBILE_VIEWPORT = { width: 390, height: 844 }
const MIN_ZOOM = 20
const MAX_ZOOM = 120

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value))
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ hideHeader = false }) => {
  const { logout } = useAuth()
  const { content, globalAssets, globalSettings, saveSection, saveGlobalAsset, saveGlobalSetting } = useContent()
  const [selectedSection, setSelectedSection] = useState(content[0]?.id || 'hero')
  const [editedTexts, setEditedTexts] = useState<{ [key: string]: string }>({})
  const [editedImages, setEditedImages] = useState<{ [key: string]: string }>({})
  const [editedGlobalAssets, setEditedGlobalAssets] = useState<{ favicon?: string; logo?: string }>({})
  const [editedGlobalSettings, setEditedGlobalSettings] = useState<{ whatsappNumber?: string; purchaseLink?: string }>({})
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [zoomPercent, setZoomPercent] = useState(52.22)
  const [previewSurfaceWidth, setPreviewSurfaceWidth] = useState(0)
  const [showRealPreview, setShowRealPreview] = useState(false)
  const previewSurfaceRef = useRef<HTMLDivElement | null>(null)

  // Estados para controlar os accordions
  const [globalAssetsOpen, setGlobalAssetsOpen] = useState(false)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [purchaseLinkOpen, setPurchaseLinkOpen] = useState(false)
  const [sectionsOpen, setSectionsOpen] = useState(true)
  const [textsOpen, setTextsOpen] = useState(false)
  const [imagesOpen, setImagesOpen] = useState(false)

  const currentSection = content.find((s) => s.id === selectedSection)
  const sectionSchema = currentSection ? SECTION_EDITOR_SCHEMA[currentSection.id] : undefined
  const editableTextKeys = currentSection
    ? (sectionSchema?.textKeys ?? Object.keys(currentSection.texts))
    : []
  const editableImageKeys = currentSection
    ? (sectionSchema?.imageKeys ?? Object.keys(currentSection.images))
    : []
  const sectionSchemaNote = sectionSchema?.note

  const formatFieldLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase())
  }

  const handleTextChange = (key: string, value: string) => {
    setEditedTexts((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = (key: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setEditedImages((prev) => ({ ...prev, [key]: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleGlobalAssetUpload = (key: 'favicon' | 'logo', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setEditedGlobalAssets((prev) => ({ ...prev, [key]: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAll = async () => {
    const results: boolean[] = []
    const hasSectionChanges = Object.keys(editedTexts).length > 0 || Object.keys(editedImages).length > 0

    if (hasSectionChanges) {
      const sectionSaved = await saveSection(selectedSection, {
        texts: editedTexts,
        images: editedImages,
      })
      results.push(sectionSaved)
    }

    for (const [key, value] of Object.entries(editedGlobalAssets)) {
      const saved = await saveGlobalAsset(key as 'favicon' | 'logo', value)
      results.push(saved)
    }

    for (const [key, value] of Object.entries(editedGlobalSettings)) {
      const saved = await saveGlobalSetting(key as 'whatsappNumber' | 'purchaseLink', value)
      results.push(saved)
    }

    const hasFailures = results.some((saved) => !saved)
    if (hasFailures) {
      alert('Nao foi possivel salvar tudo no backend. As alteracoes locais foram mantidas para voce tentar novamente.')
      return
    }

    setEditedTexts({})
    setEditedImages({})
    setEditedGlobalAssets({})
    setEditedGlobalSettings({})
    alert('Alteracoes salvas com sucesso!')
  }

  const handleGlobalSettingChange = (key: 'whatsappNumber' | 'purchaseLink', value: string) => {
    setEditedGlobalSettings((prev) => ({ ...prev, [key]: value }))
  }

  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})

  const insertMarkup = useCallback((key: string, openTag: string, closeTag: string) => {
    const textarea = textareaRefs.current[key]
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = editedTexts[key] !== undefined ? editedTexts[key] : (currentSection?.texts[key] || '')
    const selected = currentValue.substring(start, end)
    const newValue =
      currentValue.substring(0, start) +
      openTag +
      selected +
      closeTag +
      currentValue.substring(end)
    setEditedTexts((prev) => ({ ...prev, [key]: newValue }))
    setTimeout(() => {
      textarea.focus()
      const newPos = end + openTag.length + closeTag.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }, [currentSection, editedTexts])

  const getTextValue = (key: string) => {
    if (editedTexts[key] !== undefined) return editedTexts[key]
    return currentSection?.texts[key] || ''
  }

  const getImageValue = (key: string) => {
    if (editedImages[key] !== undefined) return editedImages[key]
    return currentSection?.images[key] || ''
  }

  const getGlobalAssetValue = (key: 'favicon' | 'logo') => {
    if (editedGlobalAssets[key] !== undefined) return editedGlobalAssets[key]
    return globalAssets[key] || ''
  }

  const getGlobalSettingValue = (key: 'whatsappNumber' | 'purchaseLink') => {
    if (editedGlobalSettings[key] !== undefined) return editedGlobalSettings[key]
    return globalSettings[key] || ''
  }

  const hasUnsavedChanges =
    Object.keys(editedTexts).length > 0 ||
    Object.keys(editedImages).length > 0 ||
    Object.keys(editedGlobalAssets).length > 0 ||
    Object.keys(editedGlobalSettings).length > 0

  const viewport = useMemo(() => {
    return viewMode === 'mobile' ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT
  }, [viewMode])

  const zoomScale = zoomPercent / 100
  const scaledWidth = Math.round(viewport.width * zoomScale)
  const scaledHeight = Math.round(viewport.height * zoomScale)

  const computeFitZoom = (containerWidth: number, viewportWidth: number) => {
    if (!containerWidth) return 52.22
    const availableWidth = Math.max(containerWidth - 24, 240)
    const fit = (availableWidth / viewportWidth) * 100
    return Number(clamp(fit, MIN_ZOOM, MAX_ZOOM).toFixed(2))
  }

  useEffect(() => {
    const previewSurface = previewSurfaceRef.current
    if (!previewSurface) return

    const updateSurfaceWidth = () => {
      setPreviewSurfaceWidth(previewSurface.clientWidth)
    }

    updateSurfaceWidth()

    const resizeObserver = new ResizeObserver(updateSurfaceWidth)
    resizeObserver.observe(previewSurface)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!previewSurfaceWidth) return
    setZoomPercent(computeFitZoom(previewSurfaceWidth, viewport.width))
  }, [previewSurfaceWidth, viewport.width, viewMode])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const getSectionHash = () => {
    const sectionMap: { [key: string]: string } = {
      'hero': 'hero',
      'context': 'contexto',
      'video': 'video-section',
      'audience': 'audiencia',
      'pricing': 'oferta',
      'testimonials': 'depoimentos',
      'story-bridge': 'story-bridge',
      'seller-code': 'seller-code',
      'manual-strategic': 'manual-strategic',
      'buyer-wave': 'buyer-wave',
      'authority': 'authority',
      'lead-magnet': 'lead-magnet',
      'faq': 'faq',
      'contact': 'contact',
    }
    return sectionMap[selectedSection] || selectedSection
  }

  const getPreviewUrl = () => {
    const legalConfig = LEGAL_PREVIEW_CONFIG[selectedSection]
    if (legalConfig) return legalConfig.route
    return `/#${getSectionHash()}`
  }

  const shouldScrollByHash = () => {
    return !LEGAL_PREVIEW_CONFIG[selectedSection]
  }

  const openRealPreview = () => {
    setShowRealPreview(true)
  }

  const closeRealPreview = () => {
    setShowRealPreview(false)
  }

  // Classes dinâmicas baseadas no modo (inline vs standalone)
  const cardBg = hideHeader ? 'bg-white' : 'bg-white/5 backdrop-blur-xl'
  const cardBorder = hideHeader ? 'border-slate-200' : 'border-white/10'
  const textPrimary = hideHeader ? 'text-slate-800' : 'text-white'

  return (
    <div className={hideHeader ? "space-y-8" : "min-h-screen bg-[#020617] text-white pb-24"}>
      {!hideHeader && (
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 text-slate-400 hover:text-[#F97316] transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Ver Site</span>
              </a>
              <div className="h-6 w-px bg-white/10"></div>
              <h1 className="text-xl font-bold">Painel de Administração</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </header>
      )}

      {/* Título e Subtítulo quando inline */}
      {hideHeader && (
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Edição de Conteúdo</h2>
          <p className="text-slate-600">Edite textos, imagens e configurações do site</p>
        </div>
      )}

      <div className={`max-w-7xl mx-auto p-6 ${hideHeader ? 'admin-editor-light' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Controles */}
          <div className="lg:col-span-1 space-y-4">
            {/* Favicon e Logotipo */}
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
              <button
                onClick={() => setGlobalAssetsOpen(!globalAssetsOpen)}
                className={`w-full flex items-center justify-between px-6 py-4 ${hideHeader ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <h2 className={`text-lg font-bold ${textPrimary}`}>Favicon e Logotipo</h2>
                </div>
                {globalAssetsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {globalAssetsOpen && (
                <div className="px-6 pb-6 space-y-4">
                  {/* Favicon */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Favicon
                      <span className="text-xs text-slate-500 ml-2">(Recomendado: 64x64px)</span>
                    </label>
                    {getGlobalAssetValue('favicon') && (
                      <img
                        src={getGlobalAssetValue('favicon')}
                        alt="Favicon"
                        className="w-16 h-16 object-cover rounded-lg mb-2 bg-white p-2"
                      />
                    )}
                    <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Alterar Favicon</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleGlobalAssetUpload('favicon', file)
                        }}
                      />
                    </label>
                  </div>

                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Logotipo
                      <span className="text-xs text-slate-500 ml-2">(Recomendado: 200x60px)</span>
                    </label>
                    {getGlobalAssetValue('logo') && (
                      <img
                        src={getGlobalAssetValue('logo')}
                        alt="Logo"
                        className="w-full h-16 object-contain rounded-lg mb-2 bg-white p-2"
                      />
                    )}
                    <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Alterar Logotipo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleGlobalAssetUpload('logo', file)
                        }}
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      * Atualiza header e footer automaticamente
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
              <button
                onClick={() => setWhatsappOpen(!whatsappOpen)}
                className={`w-full flex items-center justify-between px-6 py-4 ${hideHeader ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <h2 className={`text-lg font-bold ${textPrimary}`}>WhatsApp</h2>
                </div>
                {whatsappOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {whatsappOpen && (
                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Número de WhatsApp
                      <span className="text-xs text-slate-500 ml-2">(Formato: 5511999999999)</span>
                    </label>
                    <input
                      type="text"
                      value={getGlobalSettingValue('whatsappNumber')}
                      onChange={(e) => handleGlobalSettingChange('whatsappNumber', e.target.value)}
                      placeholder="5511999999999"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      * Será usado no botão WhatsApp da seção FAQ
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Link da Venda */}
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
              <button
                onClick={() => setPurchaseLinkOpen(!purchaseLinkOpen)}
                className={`w-full flex items-center justify-between px-6 py-4 ${hideHeader ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Link da Venda</h2>
                </div>
                {purchaseLinkOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {purchaseLinkOpen && (
                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      URL do Link de Compra
                      <span className="text-xs text-slate-500 ml-2">(URL completa)</span>
                    </label>
                    <input
                      type="url"
                      value={getGlobalSettingValue('purchaseLink')}
                      onChange={(e) => handleGlobalSettingChange('purchaseLink', e.target.value)}
                      placeholder="https://exemplo.com/comprar"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      * Será usado no botão CTA da seção de Preços
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seções - Com Accordion */}
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
              <button
                onClick={() => setSectionsOpen(!sectionsOpen)}
                className={`w-full flex items-center justify-between px-6 py-4 ${hideHeader ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-colors`}
              >
                <h2 className="text-lg font-bold">Seções</h2>
                {sectionsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {sectionsOpen && (
                <div className="px-6 pb-6">
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {content.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setSelectedSection(section.id)
                          setEditedTexts({})
                          setEditedImages({})
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                          selectedSection === section.id
                            ? 'bg-[#F97316] text-white font-bold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Seção {content.indexOf(section) + 1}: {section.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Editar Textos - Com Accordion */}
            {currentSection && (
              <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
                <button
                  onClick={() => setTextsOpen(!textsOpen)}
                  className={`w-full flex items-center justify-between px-6 py-4 ${hideHeader ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-colors`}
                >
                  <h2 className="text-lg font-bold">Editar Textos</h2>
                  {textsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {textsOpen && (
                  <div className="px-6 pb-6">
                    {sectionSchemaNote && (
                      <p className="mb-4 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        {sectionSchemaNote}
                      </p>
                    )}

                    {editableTextKeys.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        Esta secao nao possui campos de texto editaveis via CMS no codigo atual.
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {editableTextKeys.map((key) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
                              {formatFieldLabel(key)}
                            </label>
                            <div className="flex gap-1 mb-1.5 flex-wrap">
                              <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); insertMarkup(key, '<span class="cms-orange">', '</span>') }}
                                className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded font-black hover:bg-orange-400 transition-colors leading-none"
                                title="Envolver seleção em laranja"
                              >
                                LARANJA
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); insertMarkup(key, '<span class="cms-gradient-blue">', '</span>') }}
                                className="text-[10px] px-2 py-1 bg-blue-500 text-white rounded font-black hover:bg-blue-400 transition-colors leading-none"
                                title="Envolver seleção em azul gradiente"
                              >
                                AZUL
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); insertMarkup(key, '<span class="cms-bold">', '</span>') }}
                                className="text-[10px] px-2 py-1 bg-slate-600 text-white rounded font-black hover:bg-slate-500 transition-colors leading-none"
                                title="Envolver seleção em negrito"
                              >
                                NEGRITO
                              </button>
                            </div>
                            <textarea
                              ref={(el) => { textareaRefs.current[key] = el }}
                              value={getTextValue(key)}
                              onChange={(e) => handleTextChange(key, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent resize-none"
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Editar Imagens - Com Accordion */}
            {currentSection && editableImageKeys.length > 0 && (
              <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
                <button
                  onClick={() => setImagesOpen(!imagesOpen)}
                  className={`w-full flex items-center justify-between px-6 py-4 ${hideHeader ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-colors`}
                >
                  <h2 className="text-lg font-bold">Editar Imagens</h2>
                  {imagesOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {imagesOpen && (
                  <div className="px-6 pb-6">
                    <div className="space-y-4">
                      {editableImageKeys.map((key) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
                            {formatFieldLabel(key)}
                          </label>
                          {getImageValue(key) && (
                            <img
                              src={getImageValue(key)}
                              alt={key}
                              className="w-full h-24 object-cover rounded-lg mb-2"
                            />
                          )}
                          <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-xl cursor-pointer transition-all">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Alterar Imagem</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(key, file)
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna Direita - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              {/* Header do Preview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">Preview ao Vivo</h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {viewport.width}px x {viewport.height}px | zoom {zoomPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openRealPreview}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all font-medium text-sm"
                    title="Ver Preview Real"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Preview Real
                  </button>
                  <div className="w-px h-6 bg-white/10"></div>
                  <button
                    onClick={() => handleViewModeChange('desktop')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'desktop'
                        ? 'bg-[#F97316] text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                    title="Desktop (1920px)"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('mobile')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'mobile'
                        ? 'bg-[#F97316] text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                    title="Mobile (390px)"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slider de Zoom */}
              <div className="mb-4">
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step="0.01"
                  value={zoomPercent}
                  onChange={(e) => setZoomPercent(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #F97316 0%, #F97316 ${zoomPercent}%, rgba(255,255,255,0.1) ${zoomPercent}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>

              {viewMode === 'mobile' && hasUnsavedChanges && (
                <p className="mb-4 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  O preview mobile usa render real via iframe. Para refletir alteracoes no mobile, salve as mudancas.
                </p>
              )}

              {/* Container do Preview com escala real */}
              <div ref={previewSurfaceRef} className="bg-slate-100 rounded-xl overflow-auto shadow-2xl" style={{ maxHeight: '800px' }}>
                <div className="mx-auto" style={{ width: `${scaledWidth}px`, minHeight: `${scaledHeight}px` }}>
                  {viewMode === 'mobile' ? (
                    <div className="overflow-hidden rounded-xl bg-white shadow-xl" style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}>
                      <div
                        style={{
                          width: `${viewport.width}px`,
                          height: `${viewport.height}px`,
                          transform: `scale(${zoomScale})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <iframe
                          key={`mobile-preview-${selectedSection}`}
                          src={getPreviewUrl()}
                          className="w-full h-full border-0"
                          title="Preview Mobile Real"
                          onLoad={(e) => {
                            const iframe = e.target as HTMLIFrameElement
                            try {
                              if (!shouldScrollByHash()) {
                                return
                              }
                              const hash = getSectionHash()
                              iframe.contentWindow?.postMessage({ type: 'scrollToSection', hash }, '*')
                            } catch (err) {
                              console.log('Cannot access iframe:', err)
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-white origin-top-left"
                      style={{
                        width: `${viewport.width}px`,
                        transform: `scale(${zoomScale})`,
                        transformOrigin: 'top left'
                      }}
                    >
                      {currentSection && (
                        <AdminPreview
                          sectionId={currentSection.id}
                          texts={{ ...currentSection.texts, ...editedTexts }}
                          images={{ ...currentSection.images, ...editedImages }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior Fixa - Salvar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <>
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span className="text-sm text-slate-300">
                  Você tem alterações não salvas
                </span>
              </>
            )}
            {!hasUnsavedChanges && (
              <span className="text-sm text-slate-400">
                Nenhuma alteração pendente
              </span>
            )}
          </div>

          <button
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 bg-[#F97316] hover:bg-[#ea6a0a] disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-lg"
          >
            <Save className="w-5 h-5" />
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Modal de Preview Real */}
      {showRealPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className="relative bg-slate-900 rounded-2xl shadow-2xl flex flex-col"
            style={{
              width: `${Math.min(Math.max(scaledWidth + 48, 420), 1240)}px`,
              maxHeight: '90vh'
            }}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-sm font-bold">
                  Preview ao Vivo - {scaledWidth}px x {scaledHeight}px (zoom {zoomPercent.toFixed(2)}%)
                </h3>
              </div>
              <button
                onClick={closeRealPreview}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all font-medium text-sm"
              >
                Fechar
              </button>
            </div>

            {/* Iframe com o site real */}
            <div className="bg-white overflow-auto mx-auto" style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}>
              <div
                style={{
                  width: `${viewport.width}px`,
                  height: `${viewport.height}px`,
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top left'
                }}
              >
                <iframe
                  key={`modal-preview-${viewMode}-${selectedSection}`}
                  src={getPreviewUrl()}
                  className="w-full h-full border-0"
                  title="Preview Real"
                  onLoad={(e) => {
                    const iframe = e.target as HTMLIFrameElement
                    try {
                      if (!shouldScrollByHash()) {
                        return
                      }
                      const hash = getSectionHash()
                      iframe.contentWindow?.postMessage({ type: 'scrollToSection', hash }, '*')
                    } catch (err) {
                      console.log('Cannot access iframe:', err)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #F97316;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #F97316;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
        }

        /* Estilos para modo inline (claro) */
        .admin-editor-light h2 {
          color: #1e293b !important;
        }
        .admin-editor-light h3 {
          color: #1e293b !important;
        }
        .admin-editor-light label {
          color: #475569 !important;
        }
        .admin-editor-light .text-slate-300,
        .admin-editor-light .text-slate-400 {
          color: #64748b !important;
        }
        .admin-editor-light input,
        .admin-editor-light textarea {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
        }
        .admin-editor-light input::placeholder,
        .admin-editor-light textarea::placeholder {
          color: #94a3b8 !important;
        }
      `}</style>
    </div>
  )
}
