import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // This palette comes from a labeled e-commerce reference (Brand, Add to cart,
        // Sale, Section tint, Background, Text) — all six turn out to be the same blue
        // hue (~197-207°) at different lightness, so it reads as one coherent system:
        // white → section tint → ... → text at the neutral end, and Sale → Brand → Add to
        // cart forms the accent ramp from light/vivid to dark/serious. All six appear
        // verbatim at their respective steps.
        slate: {
          50: '#ffffff', // Background
          100: '#e4f4fc', // Section tint
          200: '#dfe3e7',
          300: '#c3ccd3',
          400: '#a0aeb9',
          500: '#7e909f',
          600: '#5b7286',
          700: '#3d596f',
          800: '#24445d',
          900: '#062a47', // Text
          950: '#041c30',
        },
        // Sale (light/vivid) → Brand (main, used at 600 for solid buttons — contrast-
        // checked at 5.7:1 against white text) → Add to cart (dark, hover/press territory
        // at 700). 800-900 continue darkening Add to cart's hue for the deepest states.
        primary: {
          50: '#edf9fd',
          100: '#d7f1fb',
          200: '#b1e3f7',
          300: '#6dccf0',
          400: '#1fb0e8', // Sale
          500: '#178ec8',
          600: '#0e6ba8', // Brand
          700: '#0a3f6b', // Add to cart
          800: '#072f4f',
          900: '#052138',
        },
        // Success reuses the same blue ramp — "Sale" is already the brightest, most
        // positive-reading step, so it doubles as the Sales Report's "positive" color
        // rather than introducing a separate green.
        success: {
          50: '#edf9fd',
          500: '#178ec8',
          600: '#0e6ba8',
          700: '#0a3f6b',
        },
        // Danger/warning stay functionally distinct (destructive confirms, out-of-stock,
        // low-stock) — pushed to clearly-red and clearly-yellow hues respectively so they
        // don't blend into the bronze accent at a glance, while staying muted enough to sit
        // quietly in a warm palette instead of a clashing stock red/amber.
        danger: {
          50: '#fbeae7',
          500: '#b2503f',
          600: '#9c3a2e',
          700: '#7d2e25',
          800: '#66251e',
        },
        warning: {
          50: '#fbf3df',
          400: '#d9ab3f',
          500: '#c3932a',
          600: '#a1781d',
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
