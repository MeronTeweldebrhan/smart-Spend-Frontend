import TransactionPage from "./Pages/TransactionPage"
import LoginPage from "./Pages/LoginPage"
import SignupPage from "./Pages/SignupPage"
import Homepage from "./Pages/HomePage"
import Dashboard from "./Pages/Dashboard"
import ReportsPage from "./Pages/ReportsPage"
import { Routes,Route } from "react-router-dom"
import PrivateRoute from "./components/PrivateRoute"
import Navbar from "./components/Navbar"
import Footbar from "./components/Footbar"


function App() {
 

  return (
    <>
      <Navbar />
      <Routes>
         <Route path="/" element={<Homepage/>} />
         <Route path="/Signup" element={<SignupPage />} />
         <Route path="/login" element={<LoginPage />} />

         {/*  Only logged-in users can see this */}
          <Route path="/reports"
          element={<PrivateRoute>
                <ReportsPage />
              </PrivateRoute>} />
        <Route path="/dashboard"
         element={<PrivateRoute>
              <Dashboard />           
              </PrivateRoute>} />
        <Route path="/transaction" 
        element={<PrivateRoute>
              <TransactionPage />         
            </PrivateRoute>} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
      <Footbar />
    </>
  )
}

export default App
