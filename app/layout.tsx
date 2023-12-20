'use client'

import chainInfo from '@/config'
import { ChainClient, ChainProvider } from '@interchaininfo/sdk'

import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const client = new ChainClient({ chainInfo })
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChainProvider client={client}>{children}</ChainProvider>
      </body>
    </html>
  )
}
