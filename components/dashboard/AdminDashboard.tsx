'use client'

import React from 'react';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Aside from './Aside';
import Image from 'next/image';

type Request = {
  id: string;
  user: { name: string };
  equipmentType: string;
  pickupDate: string;
  status: string;
  quantity: number;
  purpose: string;
};

type Equipment = {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<Request[]>([]);
  const [inventory, setInventory] = useState<Equipment[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pendingRes = await fetch('/api/requests?status=PENDING');
      if (!pendingRes.ok) throw new Error('Failed to fetch pending requests');
      const pendingData = await pendingRes.json();
      setPendingRequests(pendingData);

      const approvedRes = await fetch('/api/requests?status=APPROVED');
      if (!approvedRes.ok) throw new Error('Failed to fetch approved requests');
      const approvedData = await approvedRes.json();
      setApprovedRequests(approvedData);

      const inventoryRes = await fetch('/api/inventory');
      if (!inventoryRes.ok) throw new Error('Failed to fetch inventory');
      const inventoryData = await inventoryRes.json();
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again.');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/requests/${id}/approve`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to approve request');
      }
      await fetchData(); // Refresh the data after successful approval
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while approving the request');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const response = await fetch(`/api/requests/${id}/decline`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to decline request');
      }
      await fetchData(); // Refresh the data after successful decline
    } catch (error) {
      console.error('Error declining request:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while declining the request');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Aside />
      <main className="flex-1 p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="approved">Approved Requests</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Review and manage pending equipment requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={inventory.find(item => item.name.toLowerCase() === request.equipmentType.toLowerCase())?.imageUrl || '/placeholder-image.jpg'}
                          alt={request.equipmentType}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">{request.equipmentType}</CardTitle>
                        <CardDescription>{request.user.name} - 📦 {new Date(request.pickupDate).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-semibold">Quantity:</span> {request.quantity}</p>
                          <p className="text-sm"><span className="font-semibold">Purpose:</span> {request.purpose}</p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button size="sm" onClick={() => handleApprove(request.id)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDecline(request.id)}>Decline</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Requests</CardTitle>
                <CardDescription>View all approved equipment requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {approvedRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={inventory.find(item => item.name.toLowerCase() === request.equipmentType.toLowerCase())?.imageUrl || '/placeholder-image.jpg'}
                          alt={request.equipmentType}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="success" className="text-xs font-semibold">
                            Approved
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">{request.equipmentType}</CardTitle>
                        <CardDescription>{request.user.name} - {new Date(request.pickupDate).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-semibold">Quantity:</span> {request.quantity}</p>
                          <p className="text-sm"><span className="font-semibold">Purpose:</span> {request.purpose}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Manage your equipment inventory.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {inventory.map((item) => (
                    <Card key={item.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                      <div className="relative aspect-square h-fit max-w-full">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 hover:scale-105 object-center"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge 
                            variant={item.availableQuantity > 0 ? "success" : "danger"}
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}