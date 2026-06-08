import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import imgLogoIcon from "figma:asset/732268ab181c1df4e3d82aab30d93853c465dba5.png";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Panorama", href: "#" },
    { name: "Vídeo", href: "#" },
    { name: "Para Quem", href: "#" },
    { name: "Mentor", href: "#" },
    { name: "FAQ", href: "#" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? "bg-[#020617]/90 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none group">
          <img 
            src={imgLogoIcon} 
            alt="Solar Buy-Side Logo" 
            className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110" 
          />
          <div className="flex items-center gap-1.5 font-['Sora'] font-bold text-xl tracking-tight">
            <span className="text-white drop-shadow-sm">Solar</span>
            <span className="text-[#f97316] drop-shadow-sm">Buy-Side</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button className="px-6 py-2.5 bg-transparent border border-white/20 text-white rounded-lg text-sm font-bold transition-all duration-300 hover:bg-[#f97316] hover:border-[#f97316] hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)] active:scale-95 active:bg-[#ea580c]">
            Garantir acesso
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-1 hover:text-orange-500 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#020617] border-b border-white/10 p-6 flex flex-col gap-6 shadow-xl animate-in slide-in-from-top-2">
           <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-base text-slate-300 hover:text-orange-400 font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
           </nav>
           <div className="h-px bg-white/10 w-full" />
           <div className="flex flex-col gap-3">
             <button className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg font-bold transition-colors shadow-lg">
               Garantir acesso
             </button>
           </div>
        </div>
      )}
    </header>
  );
}
