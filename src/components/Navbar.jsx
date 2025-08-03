import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

function Navbar() {
  const { user, logout, activeAccountName } = useAuth();
  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">

      {/* Logo of the app  */}
      <NavLink to="/" className="text-xl font-bold text-blue-700">
        SmartSpend 
      </NavLink>
      {/* Name of current active account */}
      <NavLink to="/settings" className="flex gap-6 items-center">
        {activeAccountName && (
          <span className="ms-3 text-sm text-blue-500">
             {activeAccountName}
          </span>
        )}
      </NavLink>
      {/* home page  */}
      <div className="space-x-4">
        {!user ? (
          <>
            <NavLink to="/" className={({ isActive }) => `text-blue-600 ${isActive ? 'underline' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `text-blue-600 ${isActive ? 'underline' : ''}`}>
              Login
            </NavLink>
            <NavLink to="/signup"
             className={({ isActive }) => `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${isActive ? 'underline' : ''}`}>
              Signup
            </NavLink>
          </>
        ) : (
          <>
          {activeAccountName ?(
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `text-blue-600 ${isActive ? 'underline' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/transaction" className={({ isActive }) => `text-blue-600 ${isActive ? 'underline' : ''}`}>
              Transactions
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `text-blue-600 ${isActive ? 'underline' : ''}`}>
              Reports
            </NavLink>
            <NavLink to="/category" className={({ isActive }) => `text-blue-600 ${isActive ? 'underline' : ''}`}>
              Category
            </NavLink>
            </>
            ):null}
            <NavLink to="/settings" className={({ isActive }) => `text-blue-600 ${isActive ? 'underline' : ''}`}>
              Settings
            </NavLink>
            <button onClick={logout} className="text-red-500">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
