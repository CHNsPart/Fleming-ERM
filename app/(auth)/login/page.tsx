import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex h-[85vh] items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}