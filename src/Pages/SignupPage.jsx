import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../Clients/backendClient";
import { useAuth } from "../Context/useAuth.js";
import { toast } from "react-toastify";
function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  ///==Handle Input==//
  const handlechange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMessage("")
  };
  ///==handle register user===///
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await backendClient.post("/users/register", formData);
      toast.success("Signup successful! Please login.");
      const { token } = response.data;
      login(token);
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      const msg = error.response?.data?.message || "Signup failed. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  relative  bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <form onSubmit={handleSignup} 
      className="bg-white p-6 rounded-lg shadow-md w-80 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Signup</h2>
        <input
          name="username"
          type="text"
          onChange={handlechange}
          placeholder="Username"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          name="email"
          type="email"
          onChange={handlechange}
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          name="password"
          type="password"
          onChange={handlechange}
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        {errorMessage && (
          <div className="text-red-600 text-sm text-center">{errorMessage}</div>
        )}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Signup
        </button>
        <p className="text-center text-sm text-gray-400">
          Please fill out the form to create an account.
        </p>
      </form>
    </div>
  );
}
export default SignupPage;
