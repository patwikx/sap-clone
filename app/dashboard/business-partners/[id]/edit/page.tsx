import { notFound } from 'next/navigation'
import { getBusinessPartnerById } from '@/lib/business-partners'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BusinessPartnerForm } from '../../components/bp-form'

interface EditBusinessPartnerPageProps {
  params: {
    id: string
  }
}

export default async function EditBusinessPartnerPage({ params }: EditBusinessPartnerPageProps) {
  const partner = await getBusinessPartnerById(params.id)

  if (!partner) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/business-partners/${partner.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Business Partner</h1>
          <p className="text-gray-600 mt-2">{partner.cardName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Partner Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessPartnerForm initialData={partner} />
        </CardContent>
      </Card>
    </div>
  )
}