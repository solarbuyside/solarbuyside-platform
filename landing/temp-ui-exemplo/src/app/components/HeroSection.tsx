import { ArrowRight, Play, Sparkles, ChevronDown, BookOpen } from "lucide-react";
import imgMeeting from "figma:asset/828a49bddc22eb1238051b4f47bc841f0da832cb.png";

export function HeroSection() {
  return (
    <div className="relative w-full min-h-screen bg-[#020617] overflow-hidden flex items-center font-sans selection:bg-orange-500/30">
      
      {/* --- Background Ambience --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} 
        />
        
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[80vh] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[30vw] h-[60vh] bg-orange-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-10">
        
        {/* --- LEFT COLUMN: Copy & CTAs --- */}
        <div className="flex-1 flex flex-col items-start text-left max-w-xl animate-in fade-in slide-in-from-left-4 duration-700 z-20 pt-20 lg:pt-0">
          
          {/* PRODUCT IDENTITY - Tech/High-end Style */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-orange-500 to-transparent"></div>
            <span className="font-mono text-orange-500 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
              Manual Solar Buy-Side
            </span>
            <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-orange-500 to-transparent"></div>
          </div>

          {/* Headline */}
          <h1 className="font-['Sora'] text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-[1.2] tracking-tight mb-6">
            Transforme-se em um <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Vendedor Consultivo Premium</span> de Sistema Solar
          </h1>

          {/* Subtext */}
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg border-l-2 border-orange-500/30 pl-4">
            O método <strong className="text-slate-200">Buy-Side</strong> ensina você a pensar como o cliente e vender decisão, não preço.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-12 lg:mb-0">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg font-bold text-sm shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
              <span>Quero me tornar um vendedor premium</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
        </div>

        {/* --- RIGHT COLUMN: Person Image & Bonus Card --- */}
        <div className="flex-1 w-full relative flex flex-col items-center lg:items-end justify-center h-[50vh] lg:h-screen animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          
          {/* Glow behind image */}
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-t from-orange-500/20 to-blue-900/20 blur-[100px] rounded-full z-0 pointer-events-none" />

          {/* Framed Image */}
          <div className="relative z-10 max-w-[500px] w-full group">
             {/* Decorative Border/Frame */}
             <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/50 to-blue-600/50 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
             
             <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#020617]">
               <img 
                src={imgMeeting} 
                alt="Consultoria Solar Executiva" 
                className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105"
                style={{
                  aspectRatio: "1/1",
                  objectPosition: "center"
                }}
              />
              
              {/* Overlay Gradient to blend slightly with dark theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/40 via-transparent to-transparent opacity-60"></div>
             </div>

            {/* Bonus Card - Floating Over Image */}
            <div className="absolute -bottom-6 -left-6 bg-[#0f172a] border border-orange-500/30 p-5 rounded-2xl shadow-2xl w-[280px] z-30 text-left backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-orange-500 tracking-wider uppercase">Bônus Exclusivo</span>
              </div>
              <h3 className="text-white font-bold text-base mb-1 leading-tight">O Código do Vendedor Consultivo</h3>
              <p className="text-xs text-slate-400 leading-snug">
                Para quem não aceita mais perder vendas por preço.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse text-slate-500 z-20">
        <span className="text-[10px] font-medium tracking-widest uppercase">Entenda a lógica</span>
        <ChevronDown className="w-4 h-4" />
      </div>

    </div>
  );
}
