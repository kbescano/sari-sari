import nextConfig from 'eslint-config-next'

const config = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'src/payload-types.ts', 'src/migrations/**'],
  },
]

export default config
