'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SimpleTestPage() {
  const [clicked, setClicked] = useState(false)

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Test Semplice</h1>
      <p className="mb-4">Questa è una pagina di test semplice senza componenti web3.</p>
      
      <Button onClick={() => setClicked(true)}>
        Clicca qui
      </Button>
      
      {clicked && (
        <p className="mt-4 p-4 bg-green-100 rounded">
          Il pulsante funziona! React è configurato correttamente.
        </p>
      )}
    </div>
  )
}