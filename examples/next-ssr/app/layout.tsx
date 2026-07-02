import type { Metadata } from 'next'
import './globals.css'
import { StyleRegistry } from './style-registry'

export const metadata: Metadata = {
  title: 'web-style-engine Next.js SSR example',
  description: 'Request-scoped style extraction with Next.js App Router.',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyleRegistry>{props.children}</StyleRegistry>
      </body>
    </html>
  )
}
