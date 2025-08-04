'use client'

import { useState, useEffect } from 'react'
import { getMenuItems, getPOSTerminals } from '@/lib/actions/pos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [terminals, setTerminals] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testMenuItems = async () => {
    setLoading(true)
    try {
      // Get all terminals first
      const terminalsData = await getPOSTerminals()
      setTerminals(terminalsData)
      
      if (terminalsData.length > 0) {
        const businessUnitId = terminalsData[0].businessUnit.id
        console.log('Testing with business unit ID:', businessUnitId)
        
        const items = await getMenuItems(businessUnitId)
        setMenuItems(items)
        console.log('Menu items result:', items)
      }
    } catch (error) {
      console.error('Error testing menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">POS Debug Page</h1>
      
      <Button onClick={testMenuItems} disabled={loading}>
        {loading ? 'Testing...' : 'Test Menu Items Loading'}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Terminals</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(terminals, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items ({menuItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(menuItems, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 