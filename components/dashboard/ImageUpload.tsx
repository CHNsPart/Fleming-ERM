// components/dashboard/ImageUpload.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Icons } from '@/components/ui/icons'
import Image from 'next/image'

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
}

export function ImageUpload({ currentImageUrl, onImageChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false
    if (url.startsWith('https://bkstr.scene7.com/') || url.startsWith('/uploads/')) return true
    return false
  }

  const handleUrlChange = (url: string) => {
    setError(null)
    if (url === '') {
      setPreviewUrl('')
      onImageChange('')
      return
    }
    
    if (validateImageUrl(url)) {
      setPreviewUrl(url)
      onImageChange(url)
    } else {
      setError('Please use a URL from bkstr.scene7.com')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = event.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setPreviewUrl(data.fileUrl)
      onImageChange(data.fileUrl)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl('')
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError(null)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="url">Image URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="space-y-4">
              <Label htmlFor="image-upload">Upload Image (Max: 2MB)</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                disabled={isUploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-fit"
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  Uploading image...
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url">
            <div className="space-y-4">
              <Label htmlFor="image-url">Image URL (bkstr.scene7.com)</Label>
              <Input
                id="image-url"
                type="url"
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://bkstr.scene7.com/..."
                defaultValue={previewUrl?.startsWith('https://') ? previewUrl : ''}
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-2 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Preview Section */}
        {previewUrl && (
          <div className="mt-6">
            <div className="relative">
              <div className="relative aspect-square w-48 overflow-hidden rounded-lg border">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  sizes="192px"
                  className="object-cover transition-all duration-300"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={handleRemoveImage}
              >
                <Icons.trash className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}