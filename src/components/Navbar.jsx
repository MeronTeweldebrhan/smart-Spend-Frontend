import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { user, logout, activeAccountName } = useAuth();
  const { hasPermission } = usePermissions();
  const [filesDropdownOpen, setFilesDropdownOpen] = useState(false);
  const [frontDeskDropdownOpen, setFrontDeskDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [accountingDropdownOpen, setAccountingDropdownOpen] = useState(false);
  const [inventoryDropdownOpen, setInventoryDropdownOpen] = useState(false);
  const filesDropdownRef = useRef(null);
  const frontDeskDropdownRef = useRef(null);
  const reportsDropdownRef = useRef(null);
  const accountingDropdownRef = useRef(null);
  const inventoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filesDropdownRef.current &&
        !filesDropdownRef.current.contains(event.target)
      ) {
        setFilesDropdownOpen(false);
      }
      if (
        frontDeskDropdownRef.current &&
        !frontDeskDropdownRef.current.contains(event.target)
      ) {
        setFrontDeskDropdownOpen(false);
      }
      if (
        reportsDropdownRef.current &&
        !reportsDropdownRef.current.contains(event.target)
      ) {
        setReportsDropdownOpen(false);
      }
      if (
        accountingDropdownRef.current &&
        !accountingDropdownRef.current.contains(event.target)
      ) {
        setAccountingDropdownOpen(false);
      }
      if (
        inventoryDropdownRef.current &&
        !inventoryDropdownRef.current.contains(event.target)
      ) {
        setInventoryDropdownOpen(false);
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
      items: [
        { label: "Settings", to: "/settings", permission: "settings" },
        { label: "User", to: "/user/new", permission: "settings" }


      ],
      
    },
    {
      label: "Front Desk ▾",
      ref: frontDeskDropdownRef,
      state: frontDeskDropdownOpen,
      toggle: () => setFrontDeskDropdownOpen((p) => !p),
      requiredType: "hotel",
      items: [
        { label: "Room Status", to: "/RoomStatusPage", permission: "settings" },
        {
          label: "Hotel Front Desk",
          to: "/HotelFrontDesk",
          permission: "frontDesk",
        },
        {
          label: "Reservation",
          to: "/reservation",
          permission: "reservations",
        },
        {
          label: "Rooms Management",
          to: "/Roomsmanagment",
          permission: "roomManagement",
        },
      ],
    },
    {
      label: "Reports ▾",
      ref: reportsDropdownRef,
      state: reportsDropdownOpen,
      toggle: () => setReportsDropdownOpen((p) => !p),
      items: [{ label: "Reports", to: "/reports", permission: "reports" }],
    },
    {
      label: "Accounting ▾",
      ref: accountingDropdownRef,
      state: accountingDropdownOpen,
      toggle: () => setAccountingDropdownOpen((p) => !p),
      items: [
        { label: "Reports", to: "/reports", permission: "reports" },
        { label: "Journal Entry", to: "/journal" },
        { label: "Chart of Accounts", to: "/chartofAccounts" },
      ],
    },
    {
      label: "Inventory ▾",
      ref: inventoryDropdownRef,
      state: inventoryDropdownOpen,
      toggle: () => setInventoryDropdownOpen((p) => !p),
      items: [
        { label: "Category", to: "/CategoriesPage", permission: "categories" },
        { label: "Items", to: "/item" },
        { label: "Purchase Orders", to: "/purchase-orders" },
        { label: "Stock", to: "/stock-ledgers" },
        { label: "StoreIssue", to: "/store-issues/storeman" },
        { label: "Suppliers", to: "/suppliers", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
      ],
    },
  ];

  const singleLinks = [
    { label: "Dashboard", to: "/dashboard", permission: "dashboard" },
  ];

  return (
    <nav className="bg-white shadow-lg px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center w-full fixed top-0 z-50">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-4 sm:gap-6">
        <NavLink
          to="/"
        >
          <img
            src="/bee2.png"
            alt="logo"
            className="h-10 w-auto mr-4"
          />
        </NavLink>

        {user && activeAccountName && (
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Menus */}
            {menus.map((menu, i) => {
              if (menu.requiredType && !hasPermission(null, menu.requiredType))
                return null;

              const visibleItems = menu.items.filter(
                (item) =>
                  !item.permission ||
                  hasPermission(item.permission, menu.requiredType)
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={i} className="relative group" ref={menu.ref}>
                  <button
                    onClick={menu.toggle}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-expanded={menu.state}
                    aria-haspopup="true"
                  >
                    {menu.label}
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        menu.state ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {menu.state && (
                    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 animate-fade-in-down">
                      {visibleItems.map((item, idx) => (
                        <NavLink
                          key={idx}
                          to={item.to}
                          className={({ isActive }) =>
                            `block px-4 py-3 text-sm font-medium ${
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            } transition-colors duration-150 border-b border-gray-100 last:border-b-0`
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
                      `text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive ? "bg-blue-50" : ""
                      }`
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
        <div className="text-center text-blue-600 font-semibold text-sm sm:text-base my-2 sm:my-0 px-4">
          Account:{" "}
          <span className="italic font-medium">{activeAccountName}</span>
        </div>
      )}

      {/* Right: Auth Info */}
      <div className="flex items-center gap-3 sm:gap-5">
        {user ? (
          <>
            <span className="text-sm text-gray-600 font-medium hidden sm:block">
              User:{" "}
              <span className="text-blue-600 font-semibold">
                {user?.username}
              </span>
            </span>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-semibold text-sm px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive ? "bg-blue-50" : ""
                }`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? "bg-blue-700" : ""
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
