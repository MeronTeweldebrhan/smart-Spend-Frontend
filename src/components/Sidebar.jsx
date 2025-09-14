import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { useState, useRef, useEffect } from "react";

function Sidebar() {
  const { user, activeAccountName } = useAuth();
  const { hasPermission } = usePermissions();
  const [inventoryDropdownOpen, setInventoryDropdownOpen] = useState(false);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width in pixels

  const sidebarRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const inventoryDropdownRef = useRef(null);
   const departmentDropdownRef = useRef(null);
  const isResizing = useRef(false);

  // Handle click outside to collapse sidebar and close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Collapse sidebar if click is outside of sidebar and not on the mobile toggle button
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.lg\\:hidden.fixed.top-4.left-4') // Exclude mobile toggle button
      ) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false); // Close mobile menu when clicking outside
      }

      // Close inventory dropdown if click is outside of it
      if (
        inventoryDropdownRef.current &&
        !inventoryDropdownRef.current.contains(event.target)
      ) {
        setInventoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Empty dependency array means this runs once on mount

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e) => {1
      if (!isResizing.current) return;
      const newWidth = Math.max(100, Math.min(400, e.clientX)); // Min 200px, Max 400px
      setSidebarWidth(newWidth);
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const resizeHandle = resizeHandleRef.current;
    if (resizeHandle) {
      const startResizing = (e) => {
        e.preventDefault(); // Prevent text selection
        isResizing.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      };
      resizeHandle.addEventListener("mousedown", startResizing);

      return () => {
        resizeHandle.removeEventListener("mousedown", startResizing);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, []); // Empty dependency array means this runs once on mount

  // Update sidebar width CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '64px' : `${sidebarWidth}px`);
  }, [sidebarWidth, isCollapsed]);

  const menus = [
    {
      label: "Inventory",
      icon: "M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z",
      ref: inventoryDropdownRef,
      state: inventoryDropdownOpen,
      toggle: () => setInventoryDropdownOpen((p) => !p),
      items: [
        { label: "Categories", to: "/CategoriesPage", permission: "categories", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
        { label: "Items", to: "/item", icon: "M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" },
        { label: "Suppliers", to: "/suppliers", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
        { label: "Purchase Orders", to: "/purchase-orders", icon: "M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z" },
      ],
    },
     {
      label: "Departments",
      icon: "M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z",
      ref: departmentDropdownRef,
      state: departmentDropdownOpen,
      toggle: () => setDepartmentDropdownOpen((p) => !p),
      items: [
        { label: "Departments", to: "/departments", permission: "department", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
      ],
    },
  ];
  const singleLinks = [
    { label: "Dashboard", to: "/dashboard", permission: "dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { label: "Settings", to: "/settings", permission: "settings", icon: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.62-.06.94 0 .32.02.64.06.94l-2.03 1.58c-.2.14-.24.4-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" },
  ];

  return (
    <>
      {/* External Collapse Button */}
      <button
        className="fixed left-1 z-50 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hidden lg:block"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Click to expand" : "Click to collapse"}
      >
        <svg
          className={`w-6 h-6 transform transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          setIsMobileMenuOpen(!isMobileMenuOpen);
          setIsCollapsed(false); // Ensure sidebar is not collapsed when toggled on mobile
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 transform transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'w-16' : ''}`}
        style={{ width: isCollapsed ? '20px' : `${sidebarWidth}px` }}
      >
        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            ref={resizeHandleRef}
            className="absolute top-0 right-0 w-2 h-full bg-gray-300 hover:bg-blue-500 cursor-col-resize z-50"
          />
        )}

        <div className="p-4 border-b border-gray-200">
          {!isCollapsed && (
            <>
              <NavLink
                to="/"
                className="text-xl font-extrabold text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                MernifyBooks
              </NavLink>
              {user && activeAccountName && (
                <div className="mt-2 text-sm text-gray-600 font-medium truncate">
                  Account: <span className="text-blue-600 font-semibold">{activeAccountName}</span>
                </div>
              )}
            </>
          )}
          {isCollapsed && (
            <div className="text-center">
              <NavLink to="/" className="text-xl font-extrabold text-blue-600" title="MernifyBooks">
                MB
              </NavLink>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {user && (
            <>
              {singleLinks.map(
                (link, i) => (
                  hasPermission(link.permission) && (
                    <NavLink
                      key={i}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                          isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        } ${isCollapsed ? 'justify-center' : ''}`
                      }
                      title={isCollapsed ? link.label : ''}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                      </svg>
                      {!isCollapsed && link.label}
                    </NavLink>
                  )
                )
              )}
              {menus.map((menu, i) => {
                if (menu.requiredType && !hasPermission(null, menu.requiredType)) return null;

                const visibleItems = menu.items.filter(
                  (item) => !item.permission || hasPermission(item.permission, menu.requiredType)
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={i} className="relative" ref={menu.ref}>
                    <button
                      onClick={menu.toggle}
                      className={`flex items-center w-full px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isCollapsed ? 'justify-center' : ''
                      }`}
                      aria-expanded={menu.state}
                      aria-haspopup="true"
                      title={isCollapsed ? menu.label : ''}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menu.icon} />
                      </svg>
                      {!isCollapsed && (
                        <>
                          {menu.label}
                          <svg
                            className={`w-4 h-4 ml-auto transform transition-transform duration-200 ${menu.state ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                    {!isCollapsed && menu.state && (
                      <div className="pl-4 mt-1 space-y-1 animate-fade-in-down">
                        {visibleItems.map((item, idx) => (
                          <NavLink
                            key={idx}
                            to={item.to}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                              } transition-colors duration-150`
                            }
                            onClick={() => menu.toggle(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                            </svg>
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;