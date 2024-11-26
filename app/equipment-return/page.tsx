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

type User = {
  id: string;
  name: string;
  email: string;
}

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
  const { isAuthenticated } = useKindeAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [activeRequests, setActiveRequests] = useState<Request[]>([])
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/active')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Failed to fetch users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserRequests = async (userId: string) => {
    try {
      const response = await fetch(`/api/requests/active?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user requests')
      const data = await response.json()
      setActiveRequests(data)
      setSelectedRequest(null)
      setEquipment([])
    } catch (error) {
      console.error('Error fetching user requests:', error)
      alert('Failed to fetch user requests. Please try again.')
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
      
      // Reset all states after successful return
      setSelectedRequest(null)
      setEquipment([])
      // Refresh the requests for the selected user
      if (selectedUser) {
        await fetchUserRequests(selectedUser)
      }
      
      alert('Equipment return confirmed successfully!')
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
            <CardTitle>Select User</CardTitle>
            <CardDescription>Choose a user to process equipment return</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value: string) => {
              setSelectedUser(value)
              fetchUserRequests(value)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedUser && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select a Request to Return</CardTitle>
              <CardDescription>Choose from active equipment requests</CardDescription>
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
                          <h3 className="text-sm font-semibold text-gray-900">
                            {request.equipmentType}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Total: <span className="font-medium text-gray-700">
                              {request.quantity}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Picked up: <span className="font-medium text-gray-700">
                              {new Date(request.pickupDate).toLocaleDateString()}
                            </span>
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
        )}

        {selectedRequest && (
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Return Equipment
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Adjust the quantities you are returning
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-6">
                {equipment.map((item) => (
                  <li key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Total: {item.quantity}, Available to Return: {item.remaining}
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
                      <span className="text-sm font-medium text-gray-600">
                        / {item.remaining}
                      </span>
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