import React from 'react';
import { AlertTriangle, CheckCircle, ChevronRight, ChevronDown } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const scrollToVideo = () => {
    const videoSection = document.getElementById('video');
    videoSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Effect - Grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-secondary"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge de Alerta */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card border border-warning-orange/50 mb-10 hover:border-warning-orange transition-all duration-300 group">
          <div className="w-2 h-2 rounded-full bg-warning-orange animate-pulse"></div>
          <AlertTriangle className="w-5 h-5 text-warning-orange group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            ⚠️ AVISO COMPETITIVO
          </span>
        </div>

        {/* Headline Principal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
          <span className="block text-text-primary mb-2">
            Compradores de Sistema Solar
          </span>
          <span className="block gradient-text">
            Estão Ficando Mais Espertos
          </span>
          <span className="block text-text-primary">
            Que Você. <span className="gradient-text-danger">AGORA.</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-12">
          A cada dia que passa, seu cliente aprende mais. Compara melhor.
          Questiona mais. E você? Está preparado para o novo comprador?
        </p>

        {/* Card de Alerta Glassmorphism */}
        <div className="glass-card max-w-3xl mx-auto p-8 sm:p-12 border-l-4 border-warning-orange mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-12 h-12 text-warning-orange" />
            </div>
            <div className="text-left">
              <p className="text-lg text-text-primary mb-4">
                Pode parecer exagero, mas a realidade é clara:
              </p>
              <p className="text-lg text-text-primary font-medium mb-6">
                Cada vez mais compradores de sistema fotovoltaico
                estarão informados e...
              </p>
            </div>
          </div>

          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform">
              <CheckCircle className="w-6 h-6 text-electric-cyan flex-shrink-0 mt-1 group-hover/item:scale-110 transition-transform" />
              <p className="text-base text-text-secondary group-hover/item:text-text-primary transition-colors">
                Saberão comparar propostas com mais precisão
                do que muitos vendedores
              </p>
            </div>
            <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform">
              <CheckCircle className="w-6 h-6 text-electric-cyan flex-shrink-0 mt-1 group-hover/item:scale-110 transition-transform" />
              <p className="text-base text-text-secondary group-hover/item:text-text-primary transition-colors">
                Analisarão fornecedores e soluções tecnológicas
                com muito mais cuidado
              </p>
            </div>
            <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform">
              <CheckCircle className="w-6 h-6 text-electric-cyan flex-shrink-0 mt-1 group-hover/item:scale-110 transition-transform" />
              <p className="text-base text-text-secondary group-hover/item:text-text-primary transition-colors">
                Avaliarão criticamente a confiabilidade da sua
                empresa antes de decidir
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

          {/* Alerta Destacado */}
          <div className="bg-warning-orange/5 border border-warning-orange/30 rounded-xl p-6 mb-6 hover:border-warning-orange/50 transition-all duration-300">
            <p className="text-base text-text-muted mb-2">⚠️ E o alerta é claro:</p>
            <p className="text-lg font-bold text-text-primary">
              "Quem não entender essa nova jornada de compra
              <span className="text-warning-orange"> VAI PERDER VENDAS."</span>
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

          {/* Boa Notícia */}
          <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-6">
            <p className="text-base text-text-muted mb-2">✅ A boa notícia?</p>
            <p className="text-lg font-semibold text-text-primary">
              Ainda há tempo para reverter essa situação.
            </p>
          </div>
        </div>

        {/* CTA Principal */}
        <button
          onClick={scrollToVideo}
          className="btn-primary text-lg px-8 py-5 mb-8 min-h-[44px]"
        >
          QUERO ESTAR NA FRENTE DA CONCORRÊNCIA AGORA
          <ChevronRight size={20} className="ml-2" />
        </button>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-2 bounce-vertical">
          <p className="text-sm text-text-muted">
            Role para descobrir o que está em jogo
          </p>
          <ChevronDown size={20} className="text-text-muted" />
        </div>
      </div>
    </section>
  );
};
