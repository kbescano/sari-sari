import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // The entire app is built from exactly three colors: a warm near-black ink
        // (#0f0a0a), a warm greige/off-white (#f5efed), and a vivid teal-blue accent
        // (#087ca7). `slate` and `primary` are tonal ramps interpolated from these three
        // anchors (all three appear verbatim at their respective steps); every component
        // already composes from these semantic names, so overriding them here cascades the
        // new palette through the whole app without touching each file.
        slate: {
          50: '#f5efed',
          100: '#e3dddb',
          200: '#d0cac9',
          300: '#b7b1b0',
          400: '#948f8e',
          500: '#706a69',
          600: '#4f4a4a',
          700: '#363131',
          800: '#241f1e',
          900: '#0f0a0a',
          950: '#0a0707',
        },
        // Teal-blue — the one accent color, used verbatim at 600 (contrast-checked at
        // 4.7:1 against white text, so no extra darkening was needed for solid buttons).
        // 50-500 are lighter tints for badges and selected-but-quiet surfaces; 700-900
        // darken by reducing lightness in the same hue, not by blending toward the ink, so
        // hover/press states stay recognizably blue instead of muddying toward brown.
        primary: {
          50: '#ebf5f8',
          100: '#d3e7ef',
          200: '#b0d5e3',
          300: '#84bed3',
          400: '#57a6c3',
          500: '#3091b5',
          600: '#087ca7',
          700: '#066283',
          800: '#054861',
          900: '#033344',
        },
        // Success reuses the same teal-blue ramp — in this palette, "positive" and "brand
        // accent" are the same color, not a separate green.
        success: {
          50: '#ebf5f8',
          500: '#3091b5',
          600: '#087ca7',
          700: '#066283',
        },
        // Danger/warning stay functionally distinct (destructive confirms, out-of-stock,
        // low-stock) but are mixed as muted, desaturated tones — brick and gold — so they
        // sit quietly alongside the cool blue-gray family instead of a clashing stock
        // red/amber.
        danger: {
          50: '#fbebe9',
          500: '#b1544a',
          600: '#9c4038',
          700: '#7e332c',
          800: '#672a24',
        },
        warning: {
          50: '#faf3df',
          400: '#cfa855',
          500: '#b8913c',
          600: '#977527',
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
