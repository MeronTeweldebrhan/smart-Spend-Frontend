import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendClient } from "../Clients/backendClient.js";


function LoginPage() {
 const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await backendClient.post("/users/login", formData);
      const { token, user } = response.data;
      
      console.log("Login successful:", user);
      console.log("Token:", token);

        localStorage.setItem("Stoken", token);
    
        navigate("/");
      
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className=""
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
