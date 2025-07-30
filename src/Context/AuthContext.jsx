import { createContext, useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom';
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

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
    setLoading(false);
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
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout,loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


