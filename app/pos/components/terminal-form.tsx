'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface TerminalFormProps {
  children: React.ReactNode
  terminal?: {
    id: string
    name: string
    businessUnitId: string
  }
  businessUnits?: Array<{
    id: string
    name: string
  }>
}

export function TerminalForm({ children, terminal, businessUnits = [] }: TerminalFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: terminal?.name || '',
    businessUnitId: terminal?.businessUnitId || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      // const result = terminal 
      //   ? await updatePOSTerminal(terminal.id, formData)
      //   : await createPOSTerminal(formData)
      
      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(terminal ? 'Terminal updated successfully' : 'Terminal created successfully')
      setOpen(false)
      setFormData({ name: '', businessUnitId: '' })
    } catch (error) {
      toast.error(`Failed to save terminal: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold">
            {terminal ? (
              <>
                <Edit className="mr-2 h-5 w-5" />
                Edit Terminal
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                Add Terminal
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Terminal Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Terminal 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessUnit">Business Unit</Label>
            <Select
              value={formData.businessUnitId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnitId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business unit" />
              </SelectTrigger>
              <SelectContent>
                {businessUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.businessUnitId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Saving...' : (terminal ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 