'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function TestPage() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [testResult, setTestResult] = useState<string>('')

  const runTest = () => {
    try {
      // Test 1: Verifica che wagmi funzioni
      setTestResult('Test in corso...')
      
      if (isConnected) {
        setTestResult(`Connesso con l'indirizzo: ${address}`)
        toast({
          title: 'Test riuscito!',
          description: 'La connessione al wallet funziona correttamente',
          variant: 'default',
        })
      } else {
        setTestResult('Non connesso. Connetti il wallet per completare il test.')
      }
    } catch (error) {
      console.error('Errore durante il test:', error)
      setTestResult(`Errore: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: 'Errore nel test',
        description: 'Si è verificato un errore durante l'esecuzione del test',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Test di Verifica</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Connessione Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <ConnectButton />
            <Button onClick={runTest}>Esegui Test</Button>
            {testResult && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                <pre className="whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}