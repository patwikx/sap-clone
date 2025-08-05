'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getMenuItems, getPOSTerminals, getAllItems } from '@/lib/actions/pos'

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [allItems, setAllItems] = useState<any[]>([])
  const [terminals, setTerminals] = useState<any[]>([])

  const testMenuItems = async () => {
    setLoading(true)
    try {
      // Get first terminal's business unit
      const terminalList = await getPOSTerminals()
      setTerminals(terminalList)
      
      if (terminalList.length > 0) {
        const businessUnitId = terminalList[0].businessUnit.id
        console.log('Testing with business unit:', businessUnitId)
        
        const items = await getMenuItems(businessUnitId)
        setMenuItems(items)
      }
    } catch (error) {
      console.error('Error testing menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAllItems = async () => {
    setLoading(true)
    try {
      const items = await getAllItems()
      setAllItems(items)
    } catch (error) {
      console.error('Error testing all items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">POS Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testMenuItems} disabled={loading}>
              {loading ? 'Loading...' : 'Test Menu Items'}
            </Button>
            <div className="mt-4">
              <h3 className="font-semibold">Menu Items ({menuItems.length})</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                {JSON.stringify(menuItems, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test All Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testAllItems} disabled={loading}>
              {loading ? 'Loading...' : 'Test All Items'}
            </Button>
            <div className="mt-4">
              <h3 className="font-semibold">All Items ({allItems.length})</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                {JSON.stringify(allItems, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terminals</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(terminals, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 