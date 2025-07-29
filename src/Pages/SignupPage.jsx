import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backendClient  from "../Clients/backendClient";
import { useAuth } from "../Context/useAuth.js";
function SignupPage() {
const [formData, setFormData] = useState({
  username: "",
    email: "",
    password: "",
})
const { login } = useAuth();
const navigate = useNavigate();
const handlechange =(e)=>{
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
}
const handleSignup = async (e) => {
  e.preventDefault();
    try {
        const response = await backendClient.post("/users/register", formData);
        alert("Signup successful! Please login.");
        // Clear form data after successful signup
        setFormData({ username: "", email: "", password: "" });
        const { token, user } = response.data;
    
        console.log("Signup successful:", user);
        console.log("Token:", token);
    
         login(token);
        navigate("/login");
    } catch (error) {
        console.error("Signup error:", error);
        alert("An error occurred during signup.");
    }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleSignup} className="signup-form">
        <h2 className="text-2xl font-bold text-center text-gray-800">Signup</h2>
        <input
          name="username"
          type="text"
          onChange={handlechange}
          placeholder="Username"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input name="email"
        type="email"
        onChange={handlechange}
        placeholder="Email"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
        />
        <input name="password"
        type="password"
        onChange={handlechange}
        placeholder="Password"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"  
        >
          Signup
        </button>
         <p className="text-center">Please fill out the form to create an account.</p>
      </form>

      
     
      
    </div>
  );

}
export default SignupPage;