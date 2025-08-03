import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth"

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

 if (!user) {
    return <Navigate to="/" />;
  }
 

  return children;
};

export default PrivateRoute;
