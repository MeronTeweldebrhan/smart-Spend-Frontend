import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center text-center px-4 relative">
      {/* Top-right buttons */}
      <div className="absolute top-4 right-4 space-x-2">
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
      </div>

      {/* Main Content */}
      <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
        Welcome to <span className="text-blue-900">SmartSpend</span>
      </h1>
      <p className="text-lg md:text-xl text-blue-700 max-w-xl">
        Take control of your finances with ease. Track, save, and grow — all in one place.
      </p>

      {/* Optional CTA below */}
      <div className="mt-8">
        <button
          onClick={() => navigate("/signup")}
          className="bg-green-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-600 transition"
        >
          Get Started Free
        </button>
      </div>
    </div>
  );
}

export default HomePage;
