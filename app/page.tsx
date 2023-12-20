'use client'

import TrollboxContent from '@/components/Content'
import { useChain } from '@interchaininfo/sdk'
import { useEffect } from 'react'

export default function Home() {
  const { client } = useChain()

  useEffect(() => {
    client.connect()
    client.connectSigning('keplr', 'ujuno')
  }, [])

  return (
    <main className="w-screen h-screen">
      <TrollboxContent />
    </main>
  )
}
