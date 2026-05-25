import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        mint: {
          50: '#F0FAFA',
          100: '#DDF4F3',
          200: '#BCE8E5',
          300: '#8CD5D0',
          400: '#5EC0B9',
          500: '#3EAA9E',
          600: '#2F887E',
          700: '#276D66',
        },
        navy: {
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        surface: '#F6F8F9',
        card: '#FFFFFF',
        // Semantic status colors
        success: {
          50: '#eefbf3',
          100: '#d6f5e0',
          200: '#b0eac6',
          300: '#7cd9a5',
          400: '#46c17e',
          500: '#23a663',
          600: '#16874f',
          700: '#126c41',
        },
        warning: {
          50: '#fffbeb',
          100: '#fff3c6',
          200: '#ffe588',
          300: '#ffd24a',
          400: '#ffbe20',
          500: '#f99d07',
          600: '#dd7602',
          700: '#b75306',
        },
        danger: {
          50: '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6969',
          500: '#f83b3b',
          600: '#e51d1d',
          700: '#c11414',
        },
        info: {
          50: '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fe',
          300: '#93d3fd',
          400: '#60b9fa',
          500: '#3b9af6',
          600: '#257ceb',
          700: '#1d65d8',
        },
        // CSS variable-driven tokens (shadcn compat)
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Legacy compat aliases
        primary: {
          50: '#F0FAFA',
          100: '#DDF4F3',
          200: '#BCE8E5',
          300: '#8CD5D0',
          400: '#5EC0B9',
          500: '#3EAA9E',
          600: '#2F887E',
          700: '#276D66',
        },
      },
      boxShadow: {
        'soft-1': '0 4px 20px rgba(0, 0, 0, 0.03)',
        'soft-2': '0 8px 30px rgba(0, 0, 0, 0.05)',
        'soft-3': '0 12px 40px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.04)',
        'mint-glow': '0 4px 14px rgba(62, 170, 158, 0.3)',
        'mint-glow-lg': '0 6px 20px rgba(62, 170, 158, 0.4)',
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
};

export default config;
