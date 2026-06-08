export interface LegalPreviewConfig {
  route: string
  label: string
}

export const LEGAL_PREVIEW_CONFIG: Record<string, LegalPreviewConfig> = {
  'privacy-policy': {
    route: '/politica-de-privacidade',
    label: 'Pol\u00EDtica de Privacidade',
  },
  'terms-of-use': {
    route: '/termos-de-uso',
    label: 'Termos de Uso',
  },
  antipiracy: {
    route: '/medidas-antipiratarias',
    label: 'Medidas Antipiratarias',
  },
}

