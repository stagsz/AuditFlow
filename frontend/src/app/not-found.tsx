export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
        <p className="text-gray-600 mb-6">Page not found</p>
        <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Go to Login</a>
      </div>
    </div>
  );
}
