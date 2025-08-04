'use client'

import { useState } from 'react'
import { BusinessPartnerWithAddresses } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Search, 
  Mail,
  Phone,
  Globe,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

import { toast } from 'sonner'
import { deleteBusinessPartner } from '@/lib/business-partners'

interface BusinessPartnersListProps {
  partners: BusinessPartnerWithAddresses[]
}

export function BusinessPartnersList({ partners }: BusinessPartnersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = 
      partner.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.cardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || partner.cardType === typeFilter

    return matchesSearch && matchesType
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteBusinessPartner(id)
      if (result.success) {
        toast.success('Business partner deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete business partner ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'C': return 'Customer'
      case 'S': return 'Supplier'
      case 'L': return 'Lead'
      default: return type
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'C': return 'default'
      case 'S': return 'secondary'
      case 'L': return 'outline'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="C">Customers</SelectItem>
            <SelectItem value="S">Suppliers</SelectItem>
            <SelectItem value="L">Leads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{partner.cardName}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{partner.cardCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getTypeBadgeVariant(partner.cardType)}>
                    {getTypeLabel(partner.cardType)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/business-partners/${partner.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/business-partners/${partner.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(partner.id, partner.cardName)}
                        disabled={isDeleting === partner.id}
                      >
                        {isDeleting === partner.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partner.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {partner.email}
                  </div>
                )}
                {partner.phone1 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {partner.phone1}
                  </div>
                )}
                {partner.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="mr-2 h-4 w-4" />
                    <a 
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 truncate"
                    >
                      {partner.website}
                    </a>
                  </div>
                )}
                {partner.addresses.length > 0 && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{partner.addresses[0].addressName}</p>
                      <p className="text-xs">
                        {[
                          partner.addresses[0].street,
                          partner.addresses[0].city,
                          partner.addresses[0].state,
                          partner.addresses[0].country
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Balance:</span>
                    <span className={`font-medium ${partner.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${partner.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No business partners found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}