'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import Aside from '@/components/dashboard/Aside'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type Equipment = {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
}

export default function AllEquipmentsPage() {
  const { isAuthenticated, user } = useKindeAuth()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEquipments()
    }
  }, [isAuthenticated, user])

  const fetchEquipments = async () => {
    try {
      const response = await fetch('/api/equipment-types')
      if (!response.ok) throw new Error('Failed to fetch equipments')
      const data = await response.json()
      setEquipments(data)
    } catch (error) {
      console.error('Error fetching equipments:', error)
      alert('Failed to fetch equipments. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestEquipment = (equipmentId: string) => {
    router.push(`/request-form?equipmentId=${equipmentId}`)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Aside />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Equipments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {equipments.map((item) => (
            <Card key={item.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="relative aspect-square h-fit max-w-full">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant={item.availableQuantity > 0 ? "success" : "destructive"}
                    className="text-xs font-semibold"
                  >
                    {item.availableQuantity > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold truncate">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-black">{item.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available</span>
                    <span className="font-bold text-green-500">{item.availableQuantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">In Use</span>
                    <span className="font-bold text-blue-500">{item.totalQuantity - item.availableQuantity}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(item.availableQuantity / item.totalQuantity) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => handleRequestEquipment(item.id)}
                  disabled={item.availableQuantity === 0}
                >
                  Request Equipment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}