import React from 'react';
import { Building2, Rocket, Briefcase, Eye, Target, TrendingUp, ArrowRight, Crosshair } from 'lucide-react';

export const ProductShowcase: React.FC = () => {
  return (
    <>
      {/* SEÇÃO 3 - SEGMENTAÇÃO - DARK PREMIUM */}
      <section className="py-32 bg-gradient-to-b from-bg-secondary via-bg-primary to-bg-secondary relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Headline */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Quem REALMENTE Precisa
              <span className="block mt-2 gradient-text">Desse Conhecimento Para Sobreviver?</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 - PRINCIPAL */}
            <div className="md:row-span-2 glass-card p-8 sm:p-12 border-2 border-neon-green/30 hover:border-neon-green hover:shadow-neon-green transition-all duration-300 group">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-bold mb-6">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                ALTA PRIORIDADE
              </div>

              <Building2 className="w-20 h-20 text-neon-green mb-6 group-hover:scale-110 transition-transform" />

              <h3 className="text-3xl font-bold text-text-primary mb-4">
                Empresas de Integração Solar
              </h3>

              <p className="text-lg text-text-secondary mb-6 leading-relaxed text-justify">
                Se você está travado na guerra de preços, fechando projetos
                com margem cada vez menor, e vendo clientes escolherem o "mais barato":
              </p>

              <div className="space-y-3 mb-8">
                {['Aprenda a vender VALOR', 'Fuja da briga por preço', 'Feche mais projetos', 'Preserve sua margem'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group/item">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center mt-0.5">
                      <span className="text-neon-green text-sm">✓</span>
                    </div>
                    <p className="text-text-primary group-hover/item:text-neon-green transition-colors">{item}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-neon-green/20">
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold gradient-text">+30%</p>
                  <span className="text-text-muted">↑</span>
                </div>
                <p className="text-text-secondary mt-2">Aumento médio na conversão</p>
              </div>
            </div>

            {/* Card 2 - Empreendedores */}
            <div className="glass-card p-8 border border-electric-cyan/20 hover:border-electric-cyan/50 hover:shadow-neon-cyan transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/0 to-electric-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <Rocket className="w-16 h-16 text-electric-cyan mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-electric-cyan transition-colors">
                  Empreendedores Iniciantes
                </h3>
                <p className="text-text-secondary mb-4 leading-relaxed text-justify">
                  Construa um negócio sólido desde o primeiro cliente.
                </p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform"><span className="text-electric-cyan">→</span> Evite erros de iniciante</li>
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform delay-75"><span className="text-electric-cyan">→</span> Posicione-se com autoridade</li>
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform delay-150"><span className="text-electric-cyan">→</span> Aprenda o que veteranos levaram anos</li>
                </ul>
              </div>
            </div>

            {/* Card 3 - Representantes */}
            <div className="glass-card p-8 border border-electric-cyan/20 hover:border-electric-cyan/50 hover:shadow-neon-cyan transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/0 to-electric-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <Briefcase className="w-16 h-16 text-electric-cyan mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-electric-cyan transition-colors">
                  Representantes Comerciais
                </h3>
                <p className="text-text-secondary mb-4 leading-relaxed text-justify">
                  Aumente sua taxa de conversão sem queimar sua comissão.
                </p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform"><span className="text-electric-cyan">→</span> Menos desconto</li>
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform delay-75"><span className="text-electric-cyan">→</span> Mais fechamentos</li>
                  <li className="flex items-center gap-2 group-hover:translate-x-1 transition-transform delay-150"><span className="text-electric-cyan">→</span> Comissão preservada</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Texto Conclusivo */}
          <div className="mt-16 text-center glass-card p-12 border border-electric-cyan/20">
            <p className="text-lg text-text-secondary mb-2">
              Não importa em qual ponto da cadeia você está:
            </p>
            <p className="text-2xl text-text-primary mb-4">
              O <span className="gradient-text font-bold">Manual Solar Buy-Side</span> não é apenas um guia.
            </p>
            <p className="text-3xl font-bold text-text-primary mb-4">
              É uma <span className="gradient-text">IMERSÃO COMPLETA</span> na perspectiva do comprador.
            </p>
            <p className="text-xl text-warning-orange font-semibold">
              E se você vende solar sem ter essa perspectiva,
              você está em desvantagem.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 - O MANUAL */}
      <section className="section-container bg-gradient-to-b from-bg-secondary to-bg-primary">
        <div className="max-w-6xl mx-auto">
          {/* Badge + Headline */}
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-electric-cyan to-neon-green text-bg-primary font-bold mb-6">
              📘 A FERRAMENTA ESTRATÉGICA
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary max-w-4xl mx-auto leading-tight">
              Manual Solar Buy-Side:
              <span className="block mt-2 gradient-text">
                O Sistema Operacional do Vendedor de Alta Performance
              </span>
            </h2>
          </div>

          {/* Grid 2-Column */}
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2">
              <img
                src="/assets/Mockup_Manual.png"
                alt="Mockup do Manual Solar Buy-Side"
                className="w-full h-auto"
              />
            </div>

            {/* Texto + Specs */}
            <div className="md:col-span-3 glass-card p-8 sm:p-12">
              <p className="text-lg text-text-primary mb-6 text-justify">
                O Manual de Compra Solar Buy-Side é uma leitura essencial para
                profissionais do setor de vendas (Sell-Side) que{' '}
                <span className="font-bold gradient-text">DESEJAM SE DESTACAR</span>{' '}
                em um mercado ultracompetitivo.
              </p>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <Eye className="w-10 h-10 text-electric-cyan flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-bold text-text-primary mb-2">
                      VISÃO 360° DA TRANSAÇÃO
                    </h4>
                    <p className="text-text-secondary mb-3 text-justify">
                      Ao proporcionar uma imersão na jornada de compra{' '}
                      <span className="text-warning-orange font-semibold">
                        SOB A ÓTICA DO COMPRADOR
                      </span>
                      , este manual oferece uma compreensão estratégica dos:
                    </p>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Critérios de decisão</li>
                      <li>• Motivações ocultas</li>
                      <li>• Desafios enfrentados</li>
                      <li>• Objeções reais (não as que você imagina)</li>
                    </ul>
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div className="flex gap-4">
                  <Target className="w-10 h-10 text-electric-cyan flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-bold text-text-primary mb-2">
                      O RESULTADO PRÁTICO
                    </h4>
                    <p className="text-text-secondary mb-3 text-justify">
                      Ao dominar o conceito Buy-Side, você estará apto a:
                    </p>
                    <ul className="space-y-2 text-text-secondary">
                      <li className="flex items-start gap-2">
                        <span className="text-neon-green">✓</span>
                        <span>Lapidar sua abordagem comercial</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-neon-green">✓</span>
                        <span>Entregar valor real (não apenas promessas)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-neon-green">✓</span>
                        <span>Distanciar-se da briga por preço</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-neon-green">✓</span>
                        <span>Elevar sua credibilidade</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <p className="text-sm text-text-muted mb-2">💡 ANALOGIA SIMPLES:</p>
                  <p className="text-text-primary italic">
                    Se vender é como jogar xadrez, este manual te ensina a pensar como{' '}
                    <span className="font-bold">SEU OPONENTE</span>.
                  </p>
                  <p className="text-text-secondary mt-2 text-sm">
                    E quando você sabe o próximo movimento dele,
                    você sempre está 3 jogadas à frente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button className="btn-primary text-lg px-10 py-5">
              GARANTA SUA VANTAGEM COMPETITIVA NO MERCADO SOLAR
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5 - BENEFÍCIOS */}
      <section className="section-container">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              O Que Essa Imersão Representa
              <span className="block mt-2">No Seu Dia a Dia Como Vendedor?</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              Resultados concretos que você alcança ao aplicar
              o Manual Solar Buy-Side no seu processo de venda:
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card Grande */}
            <div className="md:col-span-2 glass-card p-8 sm:p-10 border-l-4 border-electric-cyan hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-6">
                <Crosshair className="w-12 h-12 text-electric-cyan" />
                <h3 className="text-2xl font-bold text-text-primary">VOCÊ VAI DOMINAR</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-electric-cyan/5 border border-electric-cyan/20 rounded-xl p-4">
                  <p className="text-text-primary flex items-start gap-2">
                    <span className="text-electric-cyan">🎯</span>
                    <span>
                      Compreender profundamente as <span className="font-bold">DORES reais</span> do cliente
                      <span className="block text-sm text-text-muted mt-1">(não as que você imagina)</span>
                    </span>
                  </p>
                </div>

                <div className="bg-electric-cyan/5 border border-electric-cyan/20 rounded-xl p-4">
                  <p className="text-text-primary flex items-start gap-2">
                    <span className="text-electric-cyan">🤝</span>
                    <span>
                      Adotar postura consultiva
                      <span className="block text-sm text-text-muted mt-1">(pare de "empurrar" produto)</span>
                    </span>
                  </p>
                </div>

                <div className="bg-electric-cyan/5 border border-electric-cyan/20 rounded-xl p-4">
                  <p className="text-text-primary flex items-start gap-2">
                    <span className="text-electric-cyan">💰</span>
                    <span>
                      Demonstrar valor técnico e econômico com clareza
                      <span className="block text-sm text-text-muted mt-1">(fale a língua do CFO)</span>
                    </span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-text-muted mt-6 italic">
                Vendedores que entendem psicologia do comprador fecham <span className="text-neon-green font-bold">30% mais</span>
              </p>
            </div>

            {/* Métrica Rápida */}
            <div className="bg-gradient-to-br from-warning-orange to-danger-red rounded-3xl p-8 text-center flex flex-col justify-center hover:scale-105 transition-transform">
              <TrendingUp className="w-16 h-16 text-white mx-auto mb-4" />
              <p className="text-6xl font-bold text-white mb-2">+47%</p>
              <p className="text-white">
                Aumento médio na conversão após aplicar metodologia
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
