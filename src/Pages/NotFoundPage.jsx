

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-200 text-center px-4">
      <h1 className="text-7xl font-extrabold text-blue-700 drop-shadow-sm">404</h1>
      <p className="mt-4 text-3xl md:text-4xl font-semibold text-gray-800">Page Not Found</p>
      <p className="mt-2 text-lg text-gray-600 max-w-md">
        The page you're looking for either doesn't exist or is currently being developed.
        We're working on it — please check back soon!
      </p>
      <a
        href="/dashboard"
        className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200"
      >
        ⬅ Go back to Dashboard
      </a>
    </div>
  );
}

export default NotFoundPage;