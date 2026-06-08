import React from 'react';
import { Quote, Star, Shield, CreditCard, Clock, AlertTriangle, X, ChevronRight, Wrench, Target } from 'lucide-react';

export const FinalSections: React.FC = () => {
  return (
    <>
      {/* SEÇÃO 6 - DEPOIMENTO */}
      <section className="section-container bg-gradient-to-b from-bg-primary to-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Card Depoimento */}
            <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 w-32 h-32 text-white/5" />

              <div className="relative z-10">
                <h3 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">
                  "Em um mês fechei 5 sistemas novos"
                </h3>

                <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/40 to-white/20 my-6"></div>

                <p className="text-lg text-text-primary mb-4">
                  Os benefícios são claros, e a prática comprova.
                </p>
                <p className="text-text-secondary mb-6">
                  Veja a experiência de Rodrigo, Integrador de São Paulo
                </p>

                <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/40 to-white/20 my-6"></div>

                <blockquote className="text-lg text-text-primary italic leading-relaxed">
                  "Eu sofria com a concorrência acirrada e a baixa conversão.
                  O Manual Solar Buy-Side me mostrou como entender a perspectiva
                  do cliente, e isso mudou o jogo.
                  <br /><br />
                  Em um mês, fechei 5 sistemas novos.
                  <br /><br />
                  O mais gratificante, porém, foi a <span className="text-warning-orange font-bold">CONEXÃO</span>.
                  Deixei de ser apenas um vendedor e me tornei um verdadeiro{' '}
                  <span className="text-warning-orange font-bold">PARCEIRO</span> para meus clientes."
                </blockquote>

                <div className="flex items-center gap-2 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/40 to-white/20 my-8"></div>

                <p className="text-text-muted mb-4">Faça como ele:</p>
                <button className="btn-secondary w-full">
                  QUERO FECHAR MAIS PROJETOS SOLARES
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <img
              src="/assets/Mockup_Manual.png"
              alt="Mockup do Manual Solar Buy-Side"
              className="w-full h-auto"
            />
          </div>

          {/* Barra de Transição */}
          <div className="mt-20 bg-gradient-to-r from-electric-cyan to-neon-green rounded-2xl p-8 sm:p-12 text-center">
            <p className="text-xl text-bg-primary">
              A história de Rodrigo é apenas um exemplo do{' '}
              <span className="font-bold text-2xl">PODER DESTE MANUAL.</span>
            </p>
            <p className="text-lg text-bg-primary/80 mt-4">
              Ele é uma ponte entre o comprador bem informado e o vendedor preparado,
              impulsionando negociações justas e satisfatórias.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 - SPECS + URGÊNCIA */}
      <section className="section-container relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 148, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 148, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-16">
            Uma Imersão Inovadora Que Revela
            <span className="block mt-2 gradient-text">A Perspectiva do Cliente</span>
          </h2>

          {/* Grid Specs */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {/* Spec 1 */}
            <div className="glass-card p-6 text-center hover:scale-105 hover:border-electric-cyan/30 border border-transparent transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-electric-cyan/10 rounded-full flex items-center justify-center group-hover:bg-electric-cyan/20 transition-colors">
                <svg className="w-8 h-8 text-electric-cyan group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2 group-hover:text-electric-cyan transition-colors">130+</h3>
              <p className="text-text-secondary font-medium mb-2">Páginas</p>
              <div className="w-full h-px bg-white/10 my-3 group-hover:bg-electric-cyan/30 transition-colors"></div>
              <p className="text-sm text-text-muted">Conteúdo técnico e estratégico</p>
              <p className="text-xs text-text-muted mt-1">Zero enrolação</p>
            </div>

            {/* Spec 2 */}
            <div className="glass-card p-6 text-center hover:scale-105 hover:border-neon-green/30 border border-transparent transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-neon-green/10 rounded-full flex items-center justify-center group-hover:bg-neon-green/20 transition-colors">
                <svg className="w-8 h-8 text-neon-green group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2 group-hover:text-neon-green transition-colors">160</h3>
              <p className="text-text-secondary font-medium mb-2">Tópicos</p>
              <div className="w-full h-px bg-white/10 my-3 group-hover:bg-neon-green/30 transition-colors"></div>
              <p className="text-sm text-text-muted">Organizados para consulta rápida</p>
              <p className="text-xs text-text-muted mt-1">Índice interativo</p>
            </div>

            {/* Spec 3 */}
            <div className="glass-card p-6 text-center hover:scale-105 hover:border-electric-cyan/30 border border-transparent transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-electric-cyan/10 rounded-full flex items-center justify-center group-hover:bg-electric-cyan/20 transition-colors">
                <svg className="w-8 h-8 text-electric-cyan group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2 group-hover:text-electric-cyan transition-colors">4 Fases</h3>
              <p className="text-text-secondary font-medium mb-2">Metodologia</p>
              <div className="w-full h-px bg-white/10 my-3 group-hover:bg-electric-cyan/30 transition-colors"></div>
              <p className="text-xs text-text-muted">1. Conscientização</p>
              <p className="text-xs text-text-muted">2. Consideração</p>
              <p className="text-xs text-text-muted">3. Decisão</p>
              <p className="text-xs text-text-muted">4. Pós-compra</p>
            </div>

            {/* Spec 4 */}
            <div className="glass-card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 mx-auto mb-4 bg-neon-green/10 rounded-full flex items-center justify-center">
                <Wrench className="w-8 h-8 text-neon-green" />
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2">Anexos</h3>
              <p className="text-text-secondary font-medium mb-2">Técnicos</p>
              <div className="w-full h-px bg-white/10 my-3"></div>
              <p className="text-xs text-text-muted">• Checklists</p>
              <p className="text-xs text-text-muted">• Templates</p>
              <p className="text-xs text-text-muted">• Calculadoras</p>
              <p className="text-xs text-text-muted">• Scripts</p>
            </div>
          </div>

          {/* Seção de Urgência */}
          <div className="bg-gradient-to-r from-danger-red/20 to-warning-orange/20 border-2 border-danger-red rounded-2xl p-8 sm:p-12">
            <h3 className="text-3xl sm:text-4xl font-black text-text-primary text-center mb-6 leading-tight">
              NÃO PERCA TEMPO NEM <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-500">POSIÇÃO NO MERCADO.</span>
            </h3>

            <p className="text-lg text-text-secondary text-center mb-8">
              O mercado solar não perdoa quem fica para trás. Garanta o método que os grandes players usam para dominar o Buy-Side.
            </p>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-danger-red to-transparent my-8"></div>

            <div className="flex items-center justify-center mb-6">
              <Clock className="w-16 h-16 text-warning-orange animate-pulse" />
            </div>

            <p className="text-lg font-bold text-text-primary text-center mb-4">
              NÃO ESPERE até que:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-2 bg-danger-red/10 rounded-lg p-4">
                <X className="w-5 h-5 text-danger-red flex-shrink-0 mt-1" />
                <p className="text-text-secondary">Seus clientes tenham acesso ao manual</p>
              </div>
              <div className="flex items-start gap-2 bg-danger-red/10 rounded-lg p-4">
                <X className="w-5 h-5 text-danger-red flex-shrink-0 mt-1" />
                <p className="text-text-secondary">Saibam mais que você</p>
              </div>
              <div className="flex items-start gap-2 bg-danger-red/10 rounded-lg p-4">
                <X className="w-5 h-5 text-danger-red flex-shrink-0 mt-1" />
                <p className="text-text-secondary">Seus concorrentes leiam primeiro</p>
              </div>
              <div className="flex items-start gap-2 bg-danger-red/10 rounded-lg p-4">
                <X className="w-5 h-5 text-danger-red flex-shrink-0 mt-1" />
                <p className="text-text-secondary">Você seja o único despreparado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8 - OFERTA */}
      <section id="offer" className="section-container bg-gradient-to-b from-bg-primary to-black">
        <div className="max-w-2xl mx-auto">
          <div className="relative glass-card p-8 sm:p-12">
            {/* Badge de Oferta - REFINED */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 glass-card border border-electric-cyan/50 rounded-full font-bold text-electric-cyan shadow-neon-cyan">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse"></span>
                ACESSO ANTECIPADO
              </span>
            </div>

            <div className="pt-8">
              <div className="text-center mb-8">
                <p className="text-2xl text-text-secondary mb-2">12 X</p>
                <p className="text-6xl font-bold gradient-text mb-4">R$ 47,25</p>
                <p className="text-xl text-text-secondary mb-2">ou</p>
                <p className="text-5xl font-bold text-text-primary">R$ 567,00</p>
                <p className="text-xl text-neon-green font-semibold uppercase tracking-wide mt-2">
                  À VISTA
                </p>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

              <button className="btn-primary w-full text-lg py-6 mb-8">
                GARANTA SUA OFERTA EXCLUSIVA AGORA
                <ChevronRight size={24} />
              </button>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

              {/* Selo Garantia - REFINED */}
              <div className="flex flex-col items-center mb-8">
                <div className="glass-card w-40 h-40 rounded-full border-2 border-neon-green/30 flex flex-col items-center justify-center relative group hover:border-neon-green transition-all duration-300">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-green/10 to-electric-cyan/10 group-hover:opacity-100 opacity-50 transition-opacity"></div>
                  <Shield className="w-12 h-12 text-neon-green mb-2 relative z-10 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-text-primary relative z-10">7 DIAS</p>
                  <p className="text-xs text-text-secondary relative z-10">GARANTIA</p>
                  <p className="text-xs text-text-secondary relative z-10">SATISFAÇÃO</p>
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

              {/* Payment Icons */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <CreditCard className="w-8 h-8 text-text-muted" />
                <span className="text-text-muted">|</span>
                <svg className="w-8 h-8 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <span className="text-text-muted">|</span>
                <svg className="w-8 h-8 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                </svg>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

              <p className="text-center text-sm text-text-muted italic mt-8">
                💡 Menos que o custo de 1 painel fotovoltaico.
                <span className="block">Mais que o retorno de dezenas de projetos fechados.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 9 - ALERTA FINAL - DARK PREMIUM */}
      <section className="py-32 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary relative overflow-hidden">
        {/* Subtle animated pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 59, 59, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 107, 44, 0.3) 0%, transparent 50%)
          `
        }}></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-danger-red/10 border-2 border-danger-red/30 mb-6">
              <AlertTriangle className="w-10 h-10 text-danger-red animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              E Se Você Ainda Duvida Do Que Está Em Jogo,
            </h2>
            <p className="text-3xl font-bold text-text-primary">
              Veja O Que{' '}
              <span className="text-danger-red">SEUS CLIENTES</span>{' '}
              Aprenderão{' '}
              <span className="text-warning-orange italic">Em Breve</span>
            </p>
            <p className="text-lg text-text-secondary italic mt-4 max-w-3xl mx-auto">
              (Sim, este manual será disponibilizado para compradores também.
              A questão é: você vai estar preparado quando eles souberem tudo isso?)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Card 1 */}
            <div className="glass-card p-8 sm:p-10 border-2 border-danger-red/40 hover:border-danger-red transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-12 h-12 text-danger-red" />
                <h3 className="text-2xl font-bold text-text-primary">
                  O QUE O COMPRADOR VAI DOMINAR
                </h3>
              </div>

              <div className="space-y-6 text-text-secondary">
                <div>
                  <p className="flex items-start gap-2 font-medium text-text-primary mb-2">
                    <span className="text-danger-red">✓</span>
                    Conceitos essenciais para uma compra técnica e segura
                  </p>
                  <ul className="ml-6 space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Dimensionamento correto
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Equipamentos de qualidade
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Garantias reais
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="flex items-start gap-2 font-medium text-text-primary mb-2">
                    <span className="text-danger-red">✓</span>
                    Reconhecimento de marcas e distribuidores de alta confiança
                  </p>
                  <ul className="ml-6 space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Red flags em fornecedores
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Certificações importantes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Histórico de suporte
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="flex items-start gap-2 font-medium text-text-primary mb-2">
                    <span className="text-danger-red">✓</span>
                    Critérios para selecionar empresas sérias e competentes
                  </p>
                  <ul className="ml-6 space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Análise de portfólio
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Verificação de credenciais
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger-red">→</span>
                      Avaliação de proposta
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-8 sm:p-10 border-2 border-warning-orange/40 hover:border-warning-orange transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-12 h-12 text-warning-orange" />
                <h3 className="text-2xl font-bold text-text-primary">
                  PRINCIPAIS FOCO E HABILIDADES
                </h3>
              </div>

              <div className="space-y-6 text-text-secondary">
                <div>
                  <p className="flex items-start gap-2 font-medium text-text-primary mb-2">
                    <span className="text-warning-orange">✓</span>
                    Ter capacidade de analisar propostas com critérios técnicos
                  </p>
                  <ul className="ml-6 space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Comparação apple-to-apple
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Identificação de promessas falsas
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Cálculo de ROI real
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="flex items-start gap-2 font-medium text-text-primary mb-2">
                    <span className="text-warning-orange">✓</span>
                    Avaliar com precisão reputação e suporte de pós-venda
                  </p>
                  <ul className="ml-6 space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Pesquisa de reviews
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Teste de responsividade
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Análise de SLA
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="flex items-start gap-2 font-medium text-text-primary mb-2">
                    <span className="text-warning-orange">✓</span>
                    Tomar decisão com segurança e embasamento técnico
                  </p>
                  <ul className="ml-6 space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Matriz de decisão estruturada
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Argumentação para stakeholders
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-orange">→</span>
                      Negociação com dados
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Texto Final - TECH PREMIUM */}
          <div className="glass-card p-12 text-center border-2 border-danger-red/30 relative overflow-hidden group hover:border-danger-red/60 transition-all duration-300">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-danger-red/5 to-warning-orange/5 opacity-50 group-hover:opacity-70 transition-opacity"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-danger-red/10 border border-danger-red/30 mb-6">
                <span className="text-4xl">🌊</span>
              </div>

              <h3 className="text-3xl font-bold mb-4 text-text-primary">
                Vem Aí Uma Onda de Compradores
                <span className="block mt-2 gradient-text-danger">Altamente Informados</span>
              </h3>

              <p className="text-2xl font-bold my-6 text-text-primary">
                E SÓ QUEM ESTIVER PREPARADO<br />
                <span className="gradient-text">VAI CONQUISTAR ESSAS VENDAS.</span>
              </p>

              <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-text-muted to-transparent mx-auto my-8"></div>

              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Você vai ser o vendedor que <span className="text-neon-green font-semibold">ENSINA</span> o cliente,<br />
                ou o vendedor que o cliente <span className="text-warning-orange font-semibold">ENSINA</span>?
              </p>

              <button className="btn-primary text-lg px-10 py-5 hover:scale-105 transition-transform">
                GARANTIR MINHA VANTAGEM AGORA
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
