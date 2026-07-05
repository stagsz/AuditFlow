/** @type {import('tailwindcss').Config} */
// "Precision instrument" dark theme.
// Ramps here mirror auditflow-design-system/tokens/colors.css — the design
// system is the source of truth; prefer var(--*) tokens in new code.
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Ink grounds (teal-biased near-blacks)
        ink: {
          0: '#070D0F',
          1: '#0C1619',
          2: '#122024',
          3: '#182A2F',
        },
        // Brand teal — mint kept as alias name for existing classes
        mint: {
          50: '#ECFDF9',
          100: '#CBF7EE',
          200: '#9BEDE0',
          300: '#7EE8DC',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        brass: {
          300: '#E5C285',
          500: '#C8A45C',
          700: '#97783D',
        },
        // Light text neutrals; navy-* kept as legacy alias so existing
        // text-navy-800 etc. render as light text on the dark ground
        navy: {
          600: '#8FA3A0',
          700: '#C2D1CD',
          800: '#EAF1EF',
          900: '#F2F7F6',
        },
        surface: '#070D0F',
        card: '#122024',
        // Semantic status — dark-adapted: 50/100 translucent tints,
        // 500 solid, 600/700 light foregrounds
        success: {
          50: 'rgba(95, 164, 99, 0.14)',
          100: 'rgba(95, 164, 99, 0.28)',
          300: '#A8D5AA',
          400: '#7DBA80',
          500: '#5FA463',
          600: '#A8D5AA',
          700: '#C4E3C5',
        },
        warning: {
          50: 'rgba(197, 137, 27, 0.14)',
          100: 'rgba(197, 137, 27, 0.28)',
          300: '#E5C285',
          400: '#D4A54E',
          500: '#C5891B',
          600: '#E5C285',
          700: '#F0D6A6',
        },
        danger: {
          50: 'rgba(196, 87, 78, 0.14)',
          100: 'rgba(196, 87, 78, 0.28)',
          300: '#EBA9A1',
          400: '#D97B72',
          500: '#C4574E',
          600: '#EBA9A1',
          700: '#F3C6C1',
        },
        info: {
          50: 'rgba(91, 140, 168, 0.14)',
          100: 'rgba(91, 140, 168, 0.28)',
          300: '#A9C4D4',
          400: '#7FA6BC',
          500: '#5B8CA8',
          600: '#A9C4D4',
          700: '#C8DAE4',
        },
        compliance: {
          high: '#5FA463',
          medium: '#C5891B',
          low: '#C4574E',
        },
        // CSS variable-driven tokens
        background: 'var(--surface-page)',
        foreground: 'var(--text-body)',
        // Legacy compat aliases
        primary: {
          50: '#ECFDF9',
          100: '#CBF7EE',
          200: '#9BEDE0',
          300: '#7EE8DC',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
      },
      boxShadow: {
        'soft-1': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.35)',
        'soft-2': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 4px rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.35)',
        'soft-3': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 8px rgba(0,0,0,0.4), 0 24px 56px rgba(0,0,0,0.5)',
        'inner-soft': 'inset 0 1px 3px rgba(0,0,0,0.4)',
        'mint-glow': '0 8px 24px rgba(20, 184, 166, 0.18)',
        'mint-glow-lg': '0 12px 40px rgba(20, 184, 166, 0.28)',
      },
      borderRadius: {
        'pill': '9999px',
        'card': '1rem',
        'crown': '1.5rem',
        'crown-lg': '2rem',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'enter': 'enter 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        enter: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
