'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Utensils, Plus, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface TableFormProps {
  children: React.ReactNode
  table?: {
    id: string
    number: string
    capacity: number
    status: string
  }
}

export function TableForm({ children, table }: TableFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    number: table?.number || '',
    capacity: table?.capacity || 4,
    status: table?.status || 'Available'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      // const result = table 
      //   ? await updateRestaurantTable(table.id, formData)
      //   : await createRestaurantTable(formData)
      
      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(table ? 'Table updated successfully' : 'Table created successfully')
      setOpen(false)
      setFormData({ number: '', capacity: 4, status: 'Available' })
    } catch (error) {
      toast.error('Failed to save table')
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
            {table ? (
              <>
                <Edit className="mr-2 h-5 w-5" />
                Edit Table
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                Add Table
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Table Number</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              placeholder="e.g., Table 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Select
              value={formData.capacity.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, capacity: parseInt(value) }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select capacity" />
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 6, 8, 10, 12].map((capacity) => (
                  <SelectItem key={capacity} value={capacity.toString()}>
                    {capacity} people
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
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
              disabled={isLoading || !formData.number}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Saving...' : (table ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 