'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { POSInterface } from '@/app/pos/components/pos-interface'
import { getPOSTerminalById, getCurrentShift } from '@/lib/actions/pos'
import { POSTerminalWithShifts, POSShiftWithDetails } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Monitor } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface POSInterfacePageProps {
  params: Promise<{
    id: string
  }>
}

export default function POSInterfacePage({ params }: POSInterfacePageProps) {
  const resolvedParams = use(params) as { id: string }
  const [terminal, setTerminal] = useState<POSTerminalWithShifts | null>(null)
  const [currentShift, setCurrentShift] = useState<POSShiftWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [terminalData, shiftData] = await Promise.all([
        getPOSTerminalById(resolvedParams.id),
        getCurrentShift(resolvedParams.id)
      ])
      
      setTerminal(terminalData)
      setCurrentShift(shiftData)
    } catch (error) {
      console.error('Error loading POS data:', error)
      toast.error('Failed to load POS data')
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POS interface...</p>
        </div>
      </div>
    )
  }

  if (!terminal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Monitor className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Terminal Not Found</h2>
          <p className="text-gray-600 mb-4">The requested terminal could not be found.</p>
          <Link href="/pos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to POS
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!currentShift) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Monitor className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Active Shift</h2>
          <p className="text-gray-600 mb-4">Please start a shift before using the POS interface.</p>
          <Link href={`/pos/terminal/${terminal.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Terminal
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href={`/pos/terminal/${terminal.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{terminal.name}</h1>
            <p className="text-gray-600">{terminal.businessUnit.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">
            Shift: {currentShift.user.employee?.firstName} {currentShift.user.employee?.lastName}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <POSInterface terminal={terminal} currentShift={currentShift} />
      </div>
    </div>
  )
} 