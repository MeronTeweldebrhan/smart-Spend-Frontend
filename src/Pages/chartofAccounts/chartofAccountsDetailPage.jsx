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
    subtype: "",
    balance: 0,
    date: "",
    refJOno: "", // New field
  });
  const [subTypes, setSubTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !activeAccountId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subtypes
        const subTypesRes = await backendClient.get(`/chartofaccounts/subtypes`, {
          params: { accountId: activeAccountId },
        });
        setSubTypes(subTypesRes.data);

        if (isEditing) {
          // Fetch specific account
          const res = await backendClient.get(`/chartofaccounts/${id}`);
          console.log("Fetched account data:", res.data); // Debug: Log the entire response
          console.log("Fetched balance:", res.data.balance); // Debug: Log the balance specifically
          console.log("Fetched date:", res.data.date); // Debug: Log the date specifically
          console.log("Fetched refJOno:", res.data.refJOno); // Debug: Log the refJOno specifically

          setAccount({
            name: res.data.name || "",
            type: res.data.type || "",
            code: res.data.code || "",
            description: res.data.description || "",
            subtype: res.data.subtype?._id || "",
            balance: Number(res.data.balance) || 0,
            date: res.data.date ? res.data.date.split("T")[0] : "",
            refJOno: res.data.refJOno || "",
          });
        }
      } catch (err) {
        console.error("Failed to load data:", err.response?.data || err.message);
        setError("Failed to load account or subtypes.");
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, id, isEditing, activeAccountId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert balance to a number, keep other fields as strings
    setAccount((prev) => ({
      ...prev,
      [name]: name === "balance" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting account:", account); // Debug: Log the account state
    console.log("Submitting balance:", account.balance); // Debug: Log the balance specifically
    console.log("Submitting date:", account.date); // Debug: Log the date specifically
    console.log("Submitting refJOno:", account.refJOno); // Debug: Log the refJOno specifically

    if (!account.name || !account.type || !account.code || !account.refJOno || !activeAccountId) {
      setError("Name, type, code, REFJOno, and an active account are required.");
      return;
    }

    const balanceValue = Number(account.balance);
    if (isNaN(balanceValue) || balanceValue < 0) {
      setError("Balance must be a valid non-negative number.");
      return;
    }

    if (!account.date) {
      setError("Date is required.");
      return;
    }

    try {
      setError(null);
      const payload = {
        name: account.name,
        type: account.type,
        code: account.code,
        description: account.description,
        subtype: account.subtype || undefined,
        accountId: activeAccountId,
        balance: balanceValue,
        date: account.date || undefined,
        refJOno: account.refJOno || undefined,
      };

      if (isEditing) {
        await backendClient.put(`/chartofaccounts/${id}`, payload);
        toast.success("Chart of account updated");
      } else {
        await backendClient.post("/chartofaccounts", payload);
        toast.success("Chart of account created");
      }
      navigate("/chartofaccounts");
    } catch (error) {
      console.error("Save failed:", error.response?.data || error.message);
      const errMsg =
        error.response?.data?.message || "Failed to save chart of account.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this chart of account?"))
      return;

    try {
      setError(null);
      await backendClient.delete(`/chartofaccounts/${id}`);
      toast.success("Chart of account deleted successfully");
      navigate("/chartofaccounts");
    } catch (error) {
      console.error(
        "Error deleting chart of account:",
        error.response?.data || error.message
      );
      const errMsg =
        error.response?.data?.message || "Failed to delete chart of account.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  console.log("Rendering account state:", account); // Debug: Log state when rendering
  console.log("Rendering balance:", account.balance); // Debug: Log balance when rendering
  console.log("Rendering date:", account.date); // Debug: Log date when rendering
  console.log("Rendering refJOno:", account.refJOno); // Debug: Log refJOno when rendering

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mb-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEditing ? "Edit" : "Create"} Chart of Account
      </h2>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm tracking-wider">
                <th className="border-b px-4 py-3 text-left">Date</th>
                <th className="border-b px-4 py-3 text-left">Code</th>
                <th className="border-b px-4 py-3 text-left">REFJOno</th>
                <th className="border-b px-4 py-3 text-left">Name</th>
                <th className="border-b px-4 py-3 text-left">Type</th>
                <th className="border-b px-4 py-3 text-left">Subtype</th>
                <th className="border-b px-4 py-3 text-left">Description</th>
                {isEditing && (
                  <th className="border-b px-4 py-3 text-left">Balance</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="border-b px-4 py-3">
                  <input
                    type="date"
                    name="date"
                    value={account.date}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                </td>
                <td className="border-b px-4 py-3">
                  <input
                    type="text"
                    name="code"
                    value={account.code}
                    onChange={handleChange}
                    placeholder="Enter account code (e.g., 1001)"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                </td>
                <td className="border-b px-4 py-3">
                  <input
                    type="text"
                    name="refJOno"
                    value={account.refJOno}
                    onChange={handleChange}
                    placeholder="Enter REFJOno"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                </td>
                <td className="border-b px-4 py-3">
                  <input
                    type="text"
                    name="name"
                    value={account.name}
                    onChange={handleChange}
                    placeholder="Enter account name"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                </td>
                <td className="border-b px-4 py-3">
                  <select
                    name="type"
                    value={account.type}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    <option value="">Select Type</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                </td>
                <td className="border-b px-4 py-3">
                  <select
                    name="subtype"
                    value={account.subtype}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    disabled={!account.type}
                  >
                    <option value="">Select Subtype</option>
                    {subTypes
                      .filter((st) => st.type === account.type)
                      .map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="border-b px-4 py-3">
                  <textarea
                    name="description"
                    value={account.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows={4}
                    className="w-full h-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                </td>
                {isEditing && (
                  <td className="border-b px-4 py-3">
                    <input
                      type="number"
                      name="balance"
                      value={account.balance}
                      onChange={handleChange}
                      placeholder="Enter balance"
                      required
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    />
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="submit"
            className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 transition-colors"
          >
            {isEditing ? "Update" : "Create"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 font-medium px-4 py-2 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/chartofaccounts")}
            className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChartOfAccountDetailPage;