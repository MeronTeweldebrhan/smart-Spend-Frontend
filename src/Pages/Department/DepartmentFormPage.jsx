import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function DepartmentFormPage() {
  const { activeAccountId, user } = useAuth();
  const { id } = useParams(); // Department ID for editing
  const { state } = useLocation(); // Department data for editing
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    manager: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users for manager dropdown
        const userRes = await backendClient.get("/users", {
          params: { accountId: activeAccountId },
        });
       setUsers(Array.isArray(userRes.data) ? userRes.data : userRes.data.users || []);

        // If editing, populate form with department data
        if (isEditMode && state?.dept) {
          setFormData({
            name: state.dept.name || "",
            code: state.dept.code || "",
            description: state.dept.description || "",
            manager: state.dept.manager?._id || "",
          });
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (activeAccountId) {
      fetchData();
    }
  }, [activeAccountId, isEditMode, state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        account: activeAccountId,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        manager: formData.manager || undefined,
        createdBy: isEditMode ? undefined : user._id,
        updatedBy: isEditMode ? user._id : undefined,
      };

      if (isEditMode) {
        await backendClient.patch(`/departments/${id}`, payload);
      } else {
        await backendClient.post("/departments", payload);
      }
      navigate("/departments");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} department`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? "Edit Department" : "Create Department"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter department name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter department code"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="4"
              placeholder="Enter department description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Manager</label>
            <select
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Manager</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={loading}
          >
            {isEditMode ? "Update Department" : "Create Department"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/departments")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}