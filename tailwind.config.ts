import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand — Apple system-blue — buttons, nav, links, active states
        primary: {
          50: '#eef6ff',
          100: '#dbedff',
          200: '#b3d9ff',
          400: '#3395ff',
          500: '#0a84ff',
          600: '#007aff',
          700: '#0062cc',
          800: '#004c9e',
          900: '#003a78',
        },
        // Positive money values — sales, paid status
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Unpaid credit, destructive actions, alerts
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Low stock warnings
        warning: {
          50: '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Inter"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // A compact, editorial scale — every step is deliberately one notch smaller than a
        // "default" app would use. Most of the app already composes from these semantic
        // names (text-base/lg/xl/2xl/3xl/4xl), so tightening the scale here is the single
        // highest-leverage change toward a smaller, calmer overall type rhythm.
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.125rem' }],
        base: ['0.875rem', { lineHeight: '1.25rem' }],
        lg: ['0.9375rem', { lineHeight: '1.375rem' }],
        xl: ['1.0625rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.1875rem', { lineHeight: '1.625rem' }],
        '3xl': ['1.375rem', { lineHeight: '1.75rem' }],
        '4xl': ['1.625rem', { lineHeight: '2rem' }],
      },
      fontWeight: {
        // Softened one step each — a premium UI reads as confident at 600, not 800. Whole
        // hundreds only, so non-variable fallback fonts (Segoe UI, Roboto) still snap cleanly.
        bold: '600',
        extrabold: '700',
      },
      spacing: {
        // Named touch-target sizes: use on every tappable control
        'touch-min': '40px',
        'touch-lg': '46px',
      },
      boxShadow: {
        // Hairline-first — a premium surface reads through a 1px border, not a cast
        // shadow. These stay nearly invisible at rest and only gain presence on hover/press.
        card: '0 1px 2px 0 rgb(15 23 42 / 0.03)',
        'card-hover': '0 4px 16px -6px rgb(15 23 42 / 0.12)',
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '0.875rem',
        '3xl': '1.125rem',
        '4xl': '1.375rem',
      },
    },
  },
  plugins: [],
}

export default config
