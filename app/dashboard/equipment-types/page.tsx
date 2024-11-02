'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Aside from '@/components/dashboard/Aside'
import Image from 'next/image'
import { Icons } from '@/components/ui/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { ImageUpload } from '@/components/dashboard/ImageUpload'

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  totalQuantity: z.number().min(0, { message: "Total quantity must be 0 or greater." }),
  availableQuantity: z.number().min(0, { message: "Available quantity must be 0 or greater." }),
  imageUrl: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

type EquipmentType = {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
}

export default function AdminEquipmentTypesPage() {
  const { isLoading, isAuthenticated, user } = useKindeAuth()
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchEquipmentTypes()
    }
  }, [isLoading, isAuthenticated])

  const fetchEquipmentTypes = async () => {
    try {
      const response = await fetch('/api/equipment-types')
      if (!response.ok) throw new Error('Failed to fetch equipment types')
      const data = await response.json()
      setEquipmentTypes(data)
    } catch (error) {
      console.error('Error fetching equipment types:', error)
      toast({
        title: "Error",
        description: "Failed to fetch equipment types. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const url = editingId ? '/api/equipment-types' : '/api/equipment-types'
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...data, id: editingId } : data),
      })
      if (!response.ok) throw new Error('Failed to save equipment type')
      fetchEquipmentTypes()
      
      // Clear the form and image
      reset({
        name: '',
        totalQuantity: 0,
        availableQuantity: 0,
        imageUrl: '',
      })
      setEditingId(null)
      
      toast({
        title: "Success",
        description: `Equipment type ${editingId ? 'updated' : 'added'} successfully.`,
      })
    } catch (error) {
      console.error('Error saving equipment type:', error)
      toast({
        title: "Error",
        description: "Failed to save equipment type. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    reset({
      name: '',
      totalQuantity: 0,
      availableQuantity: 0,
      imageUrl: '',
    })
  }

  const handleEdit = (equipment: EquipmentType) => {
    setEditingId(equipment.id)
    setValue('name', equipment.name)
    setValue('totalQuantity', equipment.totalQuantity)
    setValue('availableQuantity', equipment.availableQuantity)
    setValue('imageUrl', equipment.imageUrl || '')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment type?')) return
    try {
      const response = await fetch(`/api/equipment-types?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete equipment type')
      fetchEquipmentTypes()
      toast({
        title: "Success",
        description: "Equipment type deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting equipment type:', error)
      toast({
        title: "Error",
        description: "Failed to delete equipment type. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated || user?.email !== 'projectapplied02@gmail.com') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">You do not have permission to manage equipment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Aside />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Equipment Types</h1>
        
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">{editingId ? 'Edit' : 'Add'} Equipment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Image Upload Section */}
                <div className="col-span-1">
                  <ImageUpload
                    currentImageUrl={watch('imageUrl')}
                    onImageChange={(url) => setValue('imageUrl', url)}
                  />
                </div>

                {/* Other Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input 
                      {...register('name')} 
                      placeholder="Equipment Name" 
                      className="w-full" 
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Input 
                      {...register('totalQuantity', { valueAsNumber: true })} 
                      type="number" 
                      placeholder="Total Quantity" 
                      className="w-full" 
                    />
                    {errors.totalQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.totalQuantity.message}</p>
                    )}
                  </div>
                  <div>
                    <Input 
                      {...register('availableQuantity', { valueAsNumber: true })} 
                      type="number" 
                      placeholder="Available Quantity" 
                      className="w-full" 
                    />
                    {errors.availableQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.availableQuantity.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Equipment' : 'Add Equipment')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Equipment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Image</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Total Quantity</th>
                    <th className="px-4 py-2 text-left">Available Quantity</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {equipmentTypes.map((equipment) => (
                      <motion.tr
                        key={equipment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-2">
                          {equipment.imageUrl && (
                            <div className="relative w-12 h-12">
                              <Image 
                                src={equipment.imageUrl} 
                                alt={equipment.name} 
                                layout="fill" 
                                objectFit="cover"
                                className="rounded-md"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">{equipment.name}</td>
                        <td className="px-4 py-2">{equipment.totalQuantity}</td>
                        <td className="px-4 py-2">{equipment.availableQuantity}</td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(equipment)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors duration-150"
                            >
                              <Icons.edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(equipment.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 transition-colors duration-150"
                            >
                              <Icons.trash className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}