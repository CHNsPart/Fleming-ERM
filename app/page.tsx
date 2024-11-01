'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="h-[85vh] bg-gray-100 flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Equipment Request System
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Streamline your equipment requests and manage resources efficiently with our easy-to-use system.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/all-equipments">
              <Button size="lg" className="text-lg px-8 py-3">
                All Equipments
              </Button>
            </Link>
            <Link href="/request-form">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Request Equipment
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}