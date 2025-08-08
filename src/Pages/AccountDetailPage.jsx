import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import EmployeeManagement from "../components/EmployeeManagement";
import { toast } from "react-toastify";
function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = id !== "new";

  const [account, setAccount] = useState({ name: "", type: "Personal" });
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState(null);

  const fetchAccount = useCallback(async () => {
    if (!user || !isEditing) {
      setLoading(false);
      return;
    }
    try {
      const res = await backendClient.get(`/accounts/${id}`);
      setAccountDetails(res.data);
      setAccount({
        name: res.data.name || "",
        type: res.data.type || "Personal",
      });
    } catch (err) {
      console.error("Failed to load account:", err);
      toast.error("Account not found.");
      navigate("/settings");
    } finally {
      setLoading(false);
    }
  }, [user, id, isEditing, navigate]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await backendClient.put(`/accounts/${id}`, account);
        toast.success("Account updated");
      } else {
        await backendClient.post("/accounts", account);
        toast.success("Account created");
      }
      navigate("/settings");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save account.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await backendClient.delete(`/accounts/${id}`);
        toast.success("Account deleted successfully");
        navigate("/settings");
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600 text-lg">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10 border border-gray-200">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        {isEditing ? "Edit Account" : "Create New Account"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Account Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={account.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            id="type"
            name="type"
            value={account.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Personal">Personal</option>
            <option value="Family">Family</option>
            <option value="Business">Business</option>
            <option value="Group">Group</option>
            <option value="hotel">Hotel</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-4 justify-between">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            {isEditing ? "Update Account" : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Cancel
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Delete Account
            </button>
          )}
        </div>
      </form>

      {isEditing && accountDetails && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage Employees</h3>
          <EmployeeManagement
            accountId={id}
            employees={accountDetails.employeeUsers}
            fetchAccountDetails={fetchAccount}
          />
        </div>
      )}
    </div>
  );
}

export default AccountDetailPage;
