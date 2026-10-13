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
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        // Named touch-target sizes: use on every tappable control
        'touch-min': '48px',
        'touch-lg': '56px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.03), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 8px 20px -4px rgb(15 23 42 / 0.1), 0 2px 6px -2px rgb(15 23 42 / 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
