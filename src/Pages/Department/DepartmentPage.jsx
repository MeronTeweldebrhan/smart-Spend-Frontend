import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";

export default function DepartmentPage() {
  const { activeAccountId } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await backendClient.get("/departments", {
          params: { accountId: activeAccountId },
        });
        setDepartments(res.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch departments");
      } finally {
        setLoading(false);
      }
    };

    if (activeAccountId) {
      fetchDepartments();
    }
  }, [activeAccountId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">Departments</h2>
         <button
          onClick={() => navigate("/department/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Department
        </button>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.map((dept) => (
              <tr key={dept._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{dept.code || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{dept.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{dept.description || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => navigate(`/store-requisition/new/${dept._id}`, { state: { deptName: dept.name } })}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm mr-2"
                  >
                    Create Requisition
                  </button>
                  <button
                    onClick={() => navigate(`/store-issues/${dept._id}`, { state: { deptName: dept.name } })}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    View Issues
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}