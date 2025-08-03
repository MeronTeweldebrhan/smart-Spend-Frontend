import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  ///===Handle input ====///
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMessage("");
  };

  ///====Handle Login===///
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await backendClient.post("/users/login", formData);
      login(response.data.token);

      navigate("/settings");
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || "Invalid email or password.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  relative  bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <input
          name="email"
          type="email"
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          name="password"
          type="password"
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        {errorMessage && (
          <div className="text-red-600 text-sm text-center">{errorMessage}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
