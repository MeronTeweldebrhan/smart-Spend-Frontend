import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

function Navbar() {
    const { user,logout } = useAuth();
  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <NavLink to="/" className="text-xl font-bold text-blue-700">
        SmartSpend
      </NavLink>

      <div className="space-x-4">
        {!user ? (
          <>
            <NavLink to="/" className="text-blue-600">Home</NavLink>
            <NavLink to="/login" className="text-blue-600">Login</NavLink>
            <NavLink to="/signup" className="text-blue-600">Signup</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className="text-blue-600">Dashboard</NavLink>
            <NavLink to="/transaction" className="text-blue-600">Transactions</NavLink>
            <NavLink to="/reports" className="text-blue-600">Reports</NavLink>
            <NavLink to="/category" className="text-blue-600">Category</NavLink>
            <NavLink to="/profile" className="text-blue-600">Profile</NavLink>
            <NavLink to="/settings" className="text-blue-600">Settings</NavLink>
            <button onClick={logout} className="text-red-500">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

