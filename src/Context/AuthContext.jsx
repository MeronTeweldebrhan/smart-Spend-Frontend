/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom';
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();
    const [activeAccountId, setActiveAccountId] = useState(null);
      const [activeAccountName, setActiveAccountName] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("Stoken");
    const storedAccountId = localStorage.getItem("activeAccountId");
     const storedName = localStorage.getItem("activeAccountName");

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

    if (storedAccountId) {
      setActiveAccountId(storedAccountId);
    }
    if (storedName) {
      setActiveAccountName(storedName);
    }

    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("Stoken", token);
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUser(decoded.data);
    setToken(token);
  };
const switchAccount = (id, name) => {
    setActiveAccountId(id);
    setActiveAccountName(name);
    localStorage.setItem("activeAccountId", id);
    localStorage.setItem("activeAccountName", name);
  };
  const logout = () => {
    localStorage.removeItem("Stoken");
    setUser(null);
    setToken(null);
    setActiveAccountId(null);
     setActiveAccountName(null);
    navigate("/");
  };


  return (
    <AuthContext.Provider value={{ user, token, login, logout,loading,switchAccount, activeAccountId,activeAccountName }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


