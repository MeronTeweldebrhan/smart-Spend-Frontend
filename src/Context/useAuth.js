import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const useAuth = () => useContext(AuthContext);
