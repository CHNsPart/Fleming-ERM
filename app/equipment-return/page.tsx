'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import Aside from '@/components/dashboard/Aside'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { cn } from '@/lib/utils'

type Request = {
  id: string;
  equipmentType: string;
  quantity: number;
  returnedQuantity: number;
  pickupDate: string;
  status: string;
  returnDate: string;
  equipment: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}
type Equipment = {
  id: string;
  equipmentId: string;
  name: string;
  quantity: number;
  returned: number;
  remaining: number;
}

export default function EquipmentReturnPage() {
  const { isAuthenticated, user } = useKindeAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeRequests, setActiveRequests] = useState<Request[]>([])
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchActiveRequests()
    }
  }, [isAuthenticated, user])

  const fetchActiveRequests = async () => {
    try {
      const response = await fetch('/api/requests/active')
      if (!response.ok) throw new Error('Failed to fetch active requests')
      const data = await response.json()
      // Ensure returnedQuantity is a number and include equipment data
      const processedData = data.map((request: Request) => ({
        ...request,
        returnedQuantity: request.returnedQuantity || 0,
      }))
      setActiveRequests(processedData)
    } catch (error) {
      console.error('Error fetching active requests:', error)
      alert('Failed to fetch active requests. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestSelect = async (requestId: string) => {
    setSelectedRequest(requestId)
    try {
      const response = await fetch(`/api/requests/${requestId}`)
      if (!response.ok) throw new Error('Failed to fetch request details')
      const requestData = await response.json()
      
      setEquipment([{
        id: requestData.id,
        equipmentId: requestData.equipmentId,
        name: requestData.equipmentType,
        quantity: requestData.quantity,
        returned: requestData.returnedQuantity,
        remaining: requestData.quantity - requestData.returnedQuantity
      }])
    } catch (error) {
      console.error('Error fetching request details:', error)
      alert('Failed to fetch request details. Please try again.')
    }
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setEquipment(equipment.map(item =>
      item.id === id ? { ...item, returned: Math.min(newQuantity, item.remaining) } : item
    ))
  }

  const handleConfirmReturn = async () => {
    try {
      const response = await fetch('/api/requests/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          equipment: equipment.map(item => ({
            ...item,
            name: item.name.trim(),
            returned: item.returned
          }))
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm return')
      }
      alert('Equipment return confirmed!')
      setSelectedRequest(null)
      setEquipment([])
      fetchActiveRequests()
    } catch (error) {
      console.error('Error confirming return:', error)
      alert(error instanceof Error ? error.message : 'Failed to confirm return. Please try again.')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Aside />
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Equipment Return</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select a Request to Return</CardTitle>
            <CardDescription>Choose from your active equipment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleRequestSelect}>
              <SelectTrigger className="w-full h-fit">
                <SelectValue placeholder="Select a request" />
              </SelectTrigger>
              <SelectContent>
                {activeRequests.map((request) => (
                  <SelectItem key={request.id} value={request.id} className="p-0">
                  <div className="flex items-center text-left space-x-3 p-2">
                    <div className="flex-shrink-0 h-16 w-16 relative">
                      <Image
                        src={request.equipment.imageUrl || '/placeholder-image.jpg'}
                        alt={request.equipmentType}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold text-gray-900">{request.equipmentType}</h3>
                      <p className="text-xs text-gray-500">
                        Total: <span className="font-medium text-gray-700">{request.quantity}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Picked up: <span className="font-medium text-gray-700">{new Date(request.pickupDate).toLocaleDateString()}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Return: <span className="font-medium text-gray-700">{request.returnDate ? new Date(request.returnDate).toLocaleDateString() : 'Not returned yet'}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: <span className={cn(
                          "font-medium",
                          request.status === 'APPROVED' ? "text-green-600" : 
                          request.status === 'PARTIALLY_RETURNED' ? "text-orange-600" : 
                          "text-gray-700"
                        )}>{request.status}</span>
                      </p>
                    </div>
                  </div>
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedRequest && (
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-800">Return Equipment</CardTitle>
              <CardDescription className="text-sm text-gray-500">Adjust the quantities you are returning</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-6">
                {equipment.map((item) => (
                  <li key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Total: {item.quantity}, Available: {item.remaining}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max={item.remaining}
                        value={item.returned}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-20 text-center"
                      />
                      <span className="text-sm font-medium text-gray-600">/ {item.remaining}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button 
                  onClick={handleConfirmReturn} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                  disabled={!equipment.some(item => item.returned > 0)}
                >
                  Confirm Return
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}