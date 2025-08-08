import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { user, logout, activeAccountName } = useAuth();
  const { hasPermission } = usePermissions();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-6">
        <NavLink to="/" className="text-xl font-bold text-blue-700">
          SmartSpend
        </NavLink>

        {user && activeAccountName && (
          <div className="flex items-center gap-4">
            {/* Files Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Files ▾
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                  {hasPermission("settings") && (
                    <NavLink
                      to="/settings"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${
                          isActive ? "bg-blue-100 text-blue-700" : "text-gray-700"
                        } hover:bg-gray-100`
                      }
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </NavLink>
                  )}
                </div>
              )}
            </div>

            {hasPermission("dashboard") && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-blue-600 ${isActive ? "underline" : ""}`
                }
              >
                Dashboard
              </NavLink>
            )}
            {hasPermission("transactions") && (
              <NavLink
                to="/transaction"
                className={({ isActive }) =>
                  `text-blue-600 ${isActive ? "underline" : ""}`
                }
              >
                Transactions
              </NavLink>
            )}
            {hasPermission("reports") && (
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `text-blue-600 ${isActive ? "underline" : ""}`
                }
              >
                Reports
              </NavLink>
            )}
            {hasPermission("categories") && (
              <NavLink
                to="/category"
                className={({ isActive }) =>
                  `text-blue-600 ${isActive ? "underline" : ""}`
                }
              >
                Category
              </NavLink>
            )}
          </div>
        )}
      </div>

      {/* Right: Account name + Logout or Login/Signup */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {activeAccountName && (
              <span className="text-sm text-blue-500">{activeAccountName}  user:{user?.username}</span>
               
            )}
            <button onClick={logout} className="text-red-500 hover:underline text-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-blue-600 text-sm ${isActive ? "underline" : ""}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition text-sm ${
                  isActive ? "underline" : ""
                }`
              }
            >
              Signup
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
