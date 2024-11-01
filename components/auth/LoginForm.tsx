'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { Button } from '@/components/ui/button'
import { Icons } from '../ui/icons'

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Here you would typically handle the login logic
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    router.push('/api/auth/login')
  }

  return (
    <div className="max-w-md h-full mx-auto">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <Button
            type="submit"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Icons.lock className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
              </span>
            )}
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <LoginLink>
            <Button variant="outline" className="w-full">
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
          </LoginLink>
        </div>
      </div>

      <p className="mt-2 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <RegisterLink className="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </RegisterLink>
      </p>
    </div>
  )
}