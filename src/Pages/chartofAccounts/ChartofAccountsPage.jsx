// ChartAccountsPage.jsx
import { useState } from "react";
import { useAuth } from "../../Context/useAuth.js";
import ChartofAccountsForm from "../../components/ChartofAcoountForm.jsx";
import ChartofAccountTable from "../../components/ChartofAccoutsTabel.jsx";
import { Card } from "@/components/ui/card";

export default function ChartAccountsPage() {
  const { activeAccountId } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAccountCreated = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {activeAccountId ? (
        <Card>
          <ChartofAccountsForm onAccountCreated={handleAccountCreated} />
        </Card>
      ) : (
        <p className="text-red-600">No active account selected.</p>
      )}
      {activeAccountId && (
        <Card>
          <ChartofAccountTable refreshKey={refreshKey} />
        </Card>
      )}
    </div>
  );
}