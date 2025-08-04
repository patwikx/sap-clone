import { notFound } from 'next/navigation'
import { getBusinessPartnerById } from '@/lib/business-partners'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, Globe, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface BusinessPartnerDetailPageProps {
  params: {
    id: string
  }
}

export default async function BusinessPartnerDetailPage({ params }: BusinessPartnerDetailPageProps) {
  const partner = await getBusinessPartnerById(params.id)

  if (!partner) {
    notFound()
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
      case 'C': return 'default' as const
      case 'S': return 'secondary' as const
      case 'L': return 'outline' as const
      default: return 'default' as const
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/business-partners">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Partners
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{partner.cardName}</h1>
          <p className="text-gray-600 mt-2">Code: {partner.cardCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Partner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Card Code</p>
                      <p className="font-medium">{partner.cardCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Card Name</p>
                      <p className="font-medium">{partner.cardName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <Badge variant={getTypeBadgeVariant(partner.cardType)}>
                        {getTypeLabel(partner.cardType)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Group Code</p>
                      <p className="font-medium">{partner.groupCode}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {partner.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <a href={`mailto:${partner.email}`} className="text-blue-600 hover:underline">
                          {partner.email}
                        </a>
                      </div>
                    )}
                    {partner.phone1 && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <a href={`tel:${partner.phone1}`} className="text-blue-600 hover:underline">
                          {partner.phone1}
                        </a>
                      </div>
                    )}
                    {partner.phone2 && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <a href={`tel:${partner.phone2}`} className="text-blue-600 hover:underline">
                          {partner.phone2}
                        </a>
                      </div>
                    )}
                    {partner.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <a 
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {partner.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {partner.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{partner.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {partner.addresses.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partner.addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{address.addressName}</h4>
                        <Badge variant="outline">
                          {address.addressType === 'bo_BillTo' ? 'Bill To' : 'Ship To'}
                        </Badge>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          {address.street && <p>{address.street}</p>}
                          <p>
                            {[address.city, address.state, address.zipCode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-3xl font-bold ${partner.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <DollarSign className="inline h-6 w-6" />
                  {Math.abs(partner.balance).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {partner.balance >= 0 ? 'Credit Balance' : 'Debit Balance'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/business-partners/${partner.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Edit Partner
                </Button>
              </Link>
              {partner.cardType === 'C' && (
                <>
                  <Button variant="outline" className="w-full">
                    Create Sales Order
                  </Button>
                  <Button variant="outline" className="w-full">
                    Create AR Invoice
                  </Button>
                </>
              )}
              {partner.cardType === 'S' && (
                <>
                  <Button variant="outline" className="w-full">
                    Create Purchase Order
                  </Button>
                  <Button variant="outline" className="w-full">
                    Create AP Invoice
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}