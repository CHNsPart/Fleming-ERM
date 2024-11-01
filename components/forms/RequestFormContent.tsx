'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import Aside from '@/components/dashboard/Aside'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  department: z.string().min(1, { message: "Please select a department." }),
  equipmentType: z.string().min(1, { message: "Please select an equipment type." }),
  quantity: z.number().min(1, { message: "Quantity must be at least 1." }),
  purpose: z.string().min(10, { message: "Purpose must be at least 10 characters." }),
  pickupDate: z.date({ required_error: "Please select a pick-up date." }),
  returnDate: z.date({ required_error: "Please select a return date." }),
  campus: z.string().min(1, { message: "Please select a campus." }),
})

type FormData = z.infer<typeof formSchema>

type EquipmentType = {
  id: string;
  name: string;
  imageUrl?: string;
  availableQuantity: number;
}

export default function RequestFormContent() {
  const { user } = useKindeAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const searchParams = useSearchParams()
  const equipmentId = searchParams.get('equipmentId')

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.given_name || '',
      email: user?.email || '',
    },
  })

  const fetchEquipmentTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/equipment-types')
      if (!response.ok) throw new Error('Failed to fetch equipment types')
      const data = await response.json()
      setEquipmentTypes(data)
    } catch (error) {
      console.error('Error fetching equipment types:', error)
      alert('Failed to fetch equipment types. Please try again.')
    }
  }, [])

  const fetchEquipmentDetails = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/equipment-types/${id}`)
      if (!response.ok) throw new Error('Failed to fetch equipment details')
      const data = await response.json()
      setValue('equipmentType', data.name.toLowerCase())
    } catch (error) {
      console.error('Error fetching equipment details:', error)
      alert('Failed to fetch equipment details. Please try again.')
    }
  }, [setValue])

  useEffect(() => {
    fetchEquipmentTypes()
    
    if (equipmentId) {
      fetchEquipmentDetails(equipmentId)
    }
  }, [equipmentId, fetchEquipmentTypes, fetchEquipmentDetails])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request')
      }
      alert('Request submitted successfully! Request ID: ' + result.id)
    } catch (error) {
      console.error('Error submitting request:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Aside />
      <div className="max-w-2xl h-full mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Equipment Request Form</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <Input id="name" {...register('name')} className="mt-1" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <Input id="email" type="email" {...register('email')} className="mt-1" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <Select onValueChange={(value: string) => setValue('department', value)}>
              <SelectTrigger className="w-full h-fit mt-1">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
          </div>

          <div>
            <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700">Equipment Type</label>
            <Select onValueChange={(value: string) => setValue('equipmentType', value)} value={watch('equipmentType')}>
              <SelectTrigger className="w-full h-fit mt-1">
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((type) => (
                  <SelectItem 
                    key={type.id} 
                    value={type.name.toLowerCase()} 
                    className="p-0 border border-transparent focus:border focus:border-blue-500 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3 p-2 data-[state=checked]:border-2 data-[state=checked]:border-blue-500 rounded-md">
                      <div className="flex-shrink-0 size-16 relative">
                        <Image
                          src={type.imageUrl || '/placeholder-image.jpg'}
                          alt={type.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-sm font-medium text-gray-900">{type.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Available: {type.availableQuantity}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.equipmentType && <p className="mt-1 text-sm text-red-600">{errors.equipmentType.message}</p>}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} className="mt-1" />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
            <Textarea id="purpose" {...register('purpose')} className="mt-1" />
            {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>}
          </div>

          <div>
            <label htmlFor="campus" className="block text-sm font-medium text-gray-700">Campus</label>
            <Select onValueChange={(value: string) => setValue('campus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Sutherland Campus</SelectItem>
                <SelectItem value="north">Frost Campus</SelectItem>
              </SelectContent>
            </Select>
            {errors.campus && <p className="mt-1 text-sm text-red-600">{errors.campus.message}</p>}
          </div>

          <div>
            <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Pick-up Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch('pickupDate') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('pickupDate') ? format(watch('pickupDate'), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('pickupDate')}
                  onSelect={(date: Date | undefined) => date && setValue('pickupDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.pickupDate && <p className="mt-1 text-sm text-red-600">{errors.pickupDate.message}</p>}
          </div>

          <div>
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">Return Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch('returnDate') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('returnDate') ? format(watch('returnDate'), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('returnDate')}
                  onSelect={(date: Date | undefined) => date && setValue('returnDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.returnDate && <p className="mt-1 text-sm text-red-600">{errors.returnDate.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </div>
    </div>
  )
}