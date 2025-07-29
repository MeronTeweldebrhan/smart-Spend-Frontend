import { useAuth } from "../Context/useAuth";

const Dashboard = () => {
  const { user, } = useAuth();

  return (
    <div>
      <h1 className="text-center">Welcome, {user?.username}!</h1>
      
    </div>
  );
};
export default Dashboard;