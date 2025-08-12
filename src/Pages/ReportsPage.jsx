import { usePermissions } from "../hooks/usePermissions.js";
import { useAuth } from "../Context/useAuth.js";
import Reports from "../Pages/ReportsPages/FinancialReport.jsx";

function ReportsPage() {
  const { hasPermission } = usePermissions();
  const { activeAccountId } = useAuth();

  if (!hasPermission("reports")) {
    return <p>You do not have permission to view reports.</p>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <h1 className="text-3xl font-bold mb-6">Reports Page</h1>
      <Reports activeAccountId={activeAccountId} />
    </div>
  );
}

export default ReportsPage;