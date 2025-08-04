'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Search,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteItemGroup, getItemGroups } from '@/lib/actions/item-groups'


interface ItemGroupsListProps {
  itemGroups: Awaited<ReturnType<typeof getItemGroups>>
}

export function ItemGroupsList({ itemGroups }: ItemGroupsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredGroups = itemGroups.filter(group => 
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteItemGroup(id)
      if (result.success) {
        toast.success('Item group deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete item group ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search item groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{group.groupName}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/item-groups/${group.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(group.id, group.groupName)}
                      disabled={isDeleting === group.id}
                    >
                      {isDeleting === group.id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="mr-2 h-4 w-4" />
                  {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                </div>

                {group.items.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Items:</p>
                    <div className="space-y-1">
                      {group.items.slice(0, 3).map((item) => (
                        <p key={item.id} className="text-xs text-gray-600">
                          {item.itemCode} - {item.itemName}
                        </p>
                      ))}
                      {group.items.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{group.items.length - 3} more item{group.items.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No item groups found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}