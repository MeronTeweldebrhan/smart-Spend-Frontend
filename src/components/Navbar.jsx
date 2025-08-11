import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { user, logout, activeAccountName } = useAuth();
  const { hasPermission } = usePermissions();
  const [filesDropdownOpen, setFilesDropdownOpen] = useState(false);
  const [frontDeskDropdownOpen, setFrontDeskDropdownOpen] = useState(false);
  const filesDropdownRef = useRef(null);
  const frontDeskDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filesDropdownRef.current && !filesDropdownRef.current.contains(event.target)) {
        setFilesDropdownOpen(false);
      }
      if (frontDeskDropdownRef.current && !frontDeskDropdownRef.current.contains(event.target)) {
        setFrontDeskDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ====== LINK CONFIGURATION ======
  const menus = [
    {
      label: "Files ▾",
      ref: filesDropdownRef,
      state: filesDropdownOpen,
      toggle: () => setFilesDropdownOpen((p) => !p),
      // requiredType: "hotel", default is to show for all account types
      items: [
        { label: "Settings", to: "/settings", permission: "settings" },
        { label: "Journal Entry", to: "/journal" },
        { label: "Chart of Accounts", to: "/chartofAccounts" },
      ],
    },
    {
      label: "Front Desk ▾",
      ref: frontDeskDropdownRef,
      state: frontDeskDropdownOpen,
      toggle: () => setFrontDeskDropdownOpen((p) => !p),
      requiredType: "hotel", // whole dropdown only shows for hotel accounts
      items: [
        { label: "Room Status", to: "/RoomStatusPage", permission: "settings" },
        { label: "Hotel Front Desk", to: "/HotelFrontDesk", permission: "frontDesk" },
        { label: "Reservation", to: "/reservation", permission: "reservations" },
        { label: "Rooms Management", to: "/Roomsmanagment", permission: "roomManagement" },
      ],
    },
  ];

  const singleLinks = [
    { label: "Dashboard", to: "/dashboard", permission: "dashboard" },
    { label: "Transactions", to: "/transaction", permission: "transactions" },
    { label: "Reports", to: "/reports", permission: "reports" },
    { label: "Category", to: "/category", permission: "categories" },
  ];

  return (
    <nav className="bg-white shadow-lg px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center w-full fixed top-0 z-50">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-4 sm:gap-6">
        <NavLink
          to="/"
          className="text-xl sm:text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors"
        >
          MernifyBooks
        </NavLink>

        {user && activeAccountName && (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Menus */}
            {menus.map((menu, i) => {
              // Hide whole dropdown if account type mismatch
              if (menu.requiredType && !hasPermission(null, menu.requiredType)) return null;

              // Filter out items user can't see
              const visibleItems = menu.items.filter(
                (item) => !item.permission || hasPermission(item.permission, menu.requiredType)
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={i} className="relative" ref={menu.ref}>
                  <button
                    onClick={menu.toggle}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 transition-colors"
                  >
                    {menu.label}
                  </button>
                  {menu.state && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                      {visibleItems.map((item, idx) => (
                        <NavLink
                          key={idx}
                          to={item.to}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm font-medium ${
                              isActive
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            } transition-colors`
                          }
                          onClick={() => menu.toggle(false)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Single Links */}
            {singleLinks.map(
              (link, i) =>
                hasPermission(link.permission, link.requiredType) && (
                  <NavLink
                    key={i}
                    to={link.to}
                    className={({ isActive }) =>
                      `text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base ${
                        isActive ? "underline" : ""
                      } transition-colors`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
            )}
          </div>
        )}
      </div>

      {/* Center: Active Account */}
      {user && activeAccountName && (
        <div className="text-center text-blue-500 font-semibold text-sm sm:text-base my-2 sm:my-0">
          Account: <span className="italic">{activeAccountName}</span>
        </div>
      )}

      {/* Right: Auth Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600 font-medium hidden sm:block">
              User: <span className="text-blue-600">{user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="text-red-500 hover:text-red-600 text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive ? "underline" : ""
                } transition-colors`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors ${
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
