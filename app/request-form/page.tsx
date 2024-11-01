'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Aside from '@/components/dashboard/Aside'

function LoadingState() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Aside />
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading form...</p>
        </div>
      </div>
    </div>
  )
}

const RequestFormContent = dynamic(
  () => import('@/components/forms/RequestFormContent'),
  {
    loading: () => <LoadingState />,
    ssr: false
  }
)

export default function RequestForm() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RequestFormContent />
    </Suspense>
  )
}