import type { ReactNode } from 'react'
import '../globals.css'

export const metadata = {
  title: 'Sari-Sari Store',
  description: 'Neighborhood storefront and owner POS for a Philippine sari-sari store.',
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
