// app/unauthorized/page.tsx

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Unauthorized Access</h1>
        <p className="text-xl text-gray-600">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}