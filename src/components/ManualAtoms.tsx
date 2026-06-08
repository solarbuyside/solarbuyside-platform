import React from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

type SectionHeadingProps = {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  theme?: 'dark' | 'light'
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
}

type ButtonOutlineProps = ButtonProps & {
  theme?: 'dark' | 'light'
}

type BentoItemProps = {
  children: React.ReactNode
  className?: string
  colSpan?: string
}

type MarketTickerProps = {
  value: string
  label: string
  trend: 'up' | 'down'
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = 'center',
  theme = 'dark',
}) => (
  <div className={`mb-12 md:mb-20 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    <h2
      className={`text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-[1.1] ${
        theme === 'dark' ? 'text-white' : 'text-[#0F172A]'
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className={`text-lg md:text-xl max-w-3xl leading-relaxed mx-auto font-light ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        {subtitle}
      </p>
    )}
  </div>
)

export const ButtonPrimary: React.FC<ButtonProps> = ({ children, className = '', type = 'button', ...props }) => (
  <button
    type={type}
    className={`
    bg-[#F97316] text-white 
    font-bold text-base md:text-lg py-4 px-8 md:py-5 md:px-10 rounded-sm relative overflow-hidden group
    hover:bg-[#EA580C] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 ease-out
    uppercase tracking-wide
    ${className}
  `}
    {...props}
  >
    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
  </button>
)

export const ButtonOutline: React.FC<ButtonOutlineProps> = ({
  children,
  className = '',
  theme = 'dark',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`
    bg-transparent border
    ${
      theme === 'dark'
        ? 'text-white border-[#F97316] hover:bg-[#F97316]/10'
        : 'text-[#0F172A] border-[#0F172A] hover:bg-[#0F172A]/5'
    }
    font-bold text-base md:text-lg py-5 px-10 rounded-sm
    transition-all duration-300 ease-out
    uppercase tracking-wide flex items-center justify-center gap-2
    ${className}
  `}
    {...props}
  >
    {children}
  </button>
)

export const ButtonSuccess: React.FC<ButtonProps> = ({ children, className = '', type = 'button', ...props }) => (
  <button
    type={type}
    className={`
    bg-[#25D366] text-white
    font-bold text-base md:text-lg py-4 px-8 rounded-sm
    hover:bg-[#20bd5a] hover:scale-[1.01] transition-all duration-300 ease-out
    shadow-[0_4px_15px_rgba(37,211,102,0.3)] uppercase tracking-wide flex items-center justify-center gap-2
    ${className}
  `}
    {...props}
  >
    {children}
  </button>
)

export const BentoItem: React.FC<BentoItemProps> = ({
  children,
  className = '',
  colSpan = 'col-span-1',
}) => (
  <div
    className={`${colSpan} bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:border-[#F97316]/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${className}`}
  >
    {children}
  </div>
)

export const MarketTicker: React.FC<MarketTickerProps> = ({ value, label, trend }) => (
  <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-slate-800 rounded-lg">
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wider font-mono">{label}</p>
      <p className={`text-xl font-bold ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
        {value}
      </p>
    </div>
    <div
      className={`p-2 rounded ${
        trend === 'up' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
      }`}
    >
      {trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
    </div>
  </div>
)
