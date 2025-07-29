import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("Stoken");
    if (storedToken) {
      try {
        const decoded = JSON.parse(atob(storedToken.split(".")[1]));
        setUser(decoded.data);
        setToken(storedToken);
      } catch (err) {
        console.error("Invalid token in localStorage", err);
        logout();
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("Stoken", token);
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUser(decoded.data);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("Stoken");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


