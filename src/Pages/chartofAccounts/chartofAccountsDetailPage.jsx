import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";

function ChartOfAccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeAccountId } = useAuth();
  const isEditing = id !== "new";

  const [account, setAccount] = useState({
    name: "",
    type: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    if (!user || !isEditing) return;

    const fetchAccount = async () => {
      try {
        const res = await backendClient.get(`/chartofaccounts/${id}`);
        setAccount({
          name: res.data.name || "",
          type: res.data.type || "",
          code: res.data.code || "",
          description: res.data.description || "",
        });
      } catch (err) {
        console.error("Failed to load chart of account:", err);
        toast.error("Chart of account not found.");
        navigate("/chartofaccount");
      }
    };

    fetchAccount();
  }, [user, id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await backendClient.put(`/chartofaccounts/${id}`, account);
        toast.success("Chart of account updated");
      } else {
        await backendClient.post("/chartofaccounts", {
          ...account,
          accountId: activeAccountId,
        });
        toast.success("Chart of account created");
      }
      navigate("/chartofaccounts");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save chart of account.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this chart of account?")) {
      try {
        await backendClient.delete(`/chartofaccounts/${id}`);
        toast.success("Chart of account deleted successfully");
        navigate("/chartofaccounts");
      } catch (error) {
        console.error("Error deleting chart of account:", error);
        toast.error("Failed to delete chart of account.");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-green-100 to-green-300 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit" : "Create"} Chart of Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={account.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="type"
          value={account.type}
          onChange={handleChange}
          placeholder="Type"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="code"
          value={account.code}
          onChange={handleChange}
          placeholder="Code"
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          value={account.description}
          onChange={handleChange}
          placeholder="Description"
          rows={4}
          className="w-full p-2 border rounded"
        />

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {isEditing ? "Update" : "Create"}
        </button>
      </form>

      {isEditing && (
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mt-4"
        >
          Delete
        </button>
      )}

      <button
        type="button"
        onClick={() => navigate("/chartofaccounts")}
        className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  );
}

export default ChartOfAccountDetailPage;
