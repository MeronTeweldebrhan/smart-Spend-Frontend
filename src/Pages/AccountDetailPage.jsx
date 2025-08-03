import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../Clients/backendClient";
import { useAuth } from "../Context/useAuth";

function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = id !== "new";

  const [account, setAccount] = useState({ name: "", type: "personal" });
  const [loading, setLoading] = useState(true);

  ///===fetch accounts infromation when editing==///
  useEffect(() => {
    if (!user || !isEditing) {
      setLoading(false);
      return;
    }
const fetchAccount = async () => {
      try {
        const res = await backendClient.get(`/accounts/${id}`);
        console.log("acccount",res.data)
        setAccount({
          name: res.data.name || "",
          type: res.data.type || "personal",
        });
      } catch (err) {
        console.error("Failed to load account:", err);
        alert("Account not found.");
        navigate("/settings");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [user, id, isEditing, navigate]);

  //===handle input change===///
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  ///handle  update and and creation new account==///
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await backendClient.put(`/accounts/${id}`, account);
        alert("Account updated");
      } else {
        await backendClient.post("/accounts", account);
        alert("Account created");
      }
      navigate("/settings");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save account.");
    }
  };

  ///=== handle delete==///
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await backendClient.delete(`/accounts/${id}`);
        alert("Account deleted successfully");
        navigate("/settings");
      } catch (error) {
        console.error("Error deleting account:", error);
        
      }
    }
  };
///==laoding state==///
  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-blue-100 to-blue-300 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit" : "Create"} Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={account.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Type</label>
          <select
            name="type"
            value={account.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="personal">Personal</option>
            <option value="family">Family</option>
            <option value="group">Group</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isEditing ? "Update" : "Create"} Account
        </button>
      </form>
      {isEditing && (
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4"
        >
          Delete Account
        </button>
      )}
      <button
        type="button"
        onClick={() => navigate("/settings")}
        className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  );
}

export default AccountDetailPage;
