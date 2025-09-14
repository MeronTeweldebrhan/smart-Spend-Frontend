import { useState } from "react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import backendClient from "../../Clients/backendClient.js";
import "react-toastify/dist/ReactToastify.css";

const REPORT_OPTIONS = [
  { key: "trialBalance", label: "Trial Balance", endpoint: "/reports/trial-balance" },
  { key: "incomeStatement", label: "Income Statement", endpoint: "/reports/income-statement" },
  { key: "balanceSheet", label: "Balance Sheet", endpoint: "/reports/balance-sheet" },
  { key: "cashFlow", label: "Cash Flow Statement", endpoint: "/reports/cash-flow" }, // ✅ NEW
];

const Reports = ({ activeAccountId }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState("");
  const [selectedReports, setSelectedReports] = useState(
    REPORT_OPTIONS.reduce((acc, r) => ({ ...acc, [r.key]: false }), {})
  );

  const [reportsData, setReportsData] = useState({
    trialBalance: [],
    incomeStatement: null,
    balanceSheet: null,
    cashFlow: null,
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const fetchReport = async (endpoint, params) => {
    const { data } = await backendClient.get(endpoint, { params });
    return data;
  };

  const generateReports = async (e) => {
    e.preventDefault();
    if (!activeAccountId) {
      toast.error("Please select an active account.");
      return;
    }
    if (!Object.values(selectedReports).some(Boolean)) {
      toast.error("Please select at least one report to generate.");
      return;
    }
    setLoading(true);

    try {
      let newData = { ...reportsData };

      for (const report of REPORT_OPTIONS) {
        if (selectedReports[report.key]) {
          setGeneratingReport(report.label);
          const params =
            report.key === "balanceSheet"
              ? { accountId: activeAccountId, endDate }
              : { accountId: activeAccountId, startDate, endDate };
          const data = await fetchReport(report.endpoint, params);
          newData = { ...newData, [report.key]: data };
        }
      }

      setReportsData(newData);
      toast.success("Selected reports generated successfully!");
    } catch (error) {
      console.error("Error generating reports:", error);
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
      setGeneratingReport("");
    }
  };

  const toggleReportSelection = (key) => {
    setSelectedReports((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // UI components to render reports — similar to your original render functions:

  const ReportCard = ({ title, children }) => (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

  const renderTrialBalance = () => {
    const trialBalance = reportsData.trialBalance || [];
    if (!trialBalance.length)
      return <p className="text-center text-gray-500">No trial balance data to display.</p>;

    return (
      <ReportCard title="Trial Balance">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border-b">Account</th>
              <th className="p-2 border-b">Type</th>
              <th className="p-2 border-b text-right">Debit</th>
              <th className="p-2 border-b text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {trialBalance.map((line, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-2 border-b">{line.accountName}</td>
                <td className="p-2 border-b">{line.accountType || line.type || "N/A"}</td>
                <td className="p-2 border-b text-right">
                  {line.balance >= 0 ? formatCurrency(line.balance) : ""}
                </td>
                <td className="p-2 border-b text-right">
                  {line.balance < 0 ? formatCurrency(-line.balance) : ""}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-200">
              <td className="p-2 border-b">Total</td>
              <td className="p-2 border-b"></td> {/* empty for type */}
              <td className="p-2 border-b text-right">
                {formatCurrency(
                  trialBalance.filter((l) => l.balance >= 0).reduce((sum, l) => sum + l.balance, 0)
                )}
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(
                  trialBalance.filter((l) => l.balance < 0).reduce((sum, l) => sum - l.balance, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </ReportCard>
    );
  };

  const Section = ({ title, children }) => (
    <div>
      <h4 className="font-semibold text-lg mt-4">{title}</h4>
      {children}
    </div>
  );

  const LineItem = ({ name, value }) => (
    <div className="flex justify-between items-center pl-4">
      <span>{name}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );

  const Total = ({ label, value, highlight }) => (
    <div
      className={`flex justify-between items-center font-bold border-t pt-2 ${
        highlight ? "text-blue-600 border-t-2 pt-4 text-xl" : "text-gray-700"
      }`}
    >
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );

  const renderIncomeStatement = () => {
    const incomeStatement = reportsData.incomeStatement;
    if (!incomeStatement || !incomeStatement.details?.length)
      return <p className="text-center text-gray-500">No income statement data to display.</p>;

    return (
      <ReportCard title="Income Statement">
        <Section title="Revenue">
          {incomeStatement.details
            .filter((d) => d.type === "Revenue")
            .map((line, idx) => (
              <LineItem key={idx} name={line.name} value={line.credit - line.debit} />
            ))}
          <Total label="Total Revenue" value={incomeStatement.revenue} />
        </Section>

        <Section title="Expenses">
          {incomeStatement.details
            .filter((d) => d.type === "Expense")
            .map((line, idx) => (
              <LineItem key={idx} name={line.name} value={line.debit - line.credit} />
            ))}
          <Total label="Total Expenses" value={incomeStatement.expenses} />
        </Section>

        <Total label="Net Income" value={incomeStatement.netIncome} highlight />
      </ReportCard>
    );
  };

  const BalanceSection = ({ title, data, total, debitFirst }) => (
    <div className="flex-1 space-y-4">
      <h4 className="font-semibold text-lg">{title}</h4>
      {data.map((line, idx) => (
        <LineItem
          key={idx}
          name={line.name}
          value={debitFirst ? line.debit - line.credit : line.credit - line.debit}
        />
      ))}
      <Total label={`Total ${title}`} value={total} />
    </div>
  );
const renderCashFlow = () => {
  const cashFlow = reportsData.cashFlow;
  if (!cashFlow) return <p className="text-center text-gray-500">No cash flow data to display.</p>;

  return (
    <ReportCard title="Cash Flow Statement">
      <Section title="Operating Activities">
        <LineItem name="Net Income" value={cashFlow.netIncome} />
        <LineItem name="Operating Activities" value={cashFlow.operatingActivities} />
      </Section>

      <Section title="Investing Activities">
        <LineItem name="Investing Cash Flow" value={cashFlow.investingActivities} />
      </Section>

      <Section title="Financing Activities">
        <LineItem name="Financing Cash Flow" value={cashFlow.financingActivities} />
      </Section>

      <Total label="Net Cash Flow" value={cashFlow.netCashFlow} highlight />

      <Section title="Cash Position">
        <LineItem name="Opening Cash" value={cashFlow.details?.openingCash || 0} />
        <LineItem name="Closing Cash" value={cashFlow.details?.closingCash || 0} />
      </Section>
    </ReportCard>
  );
};

  const renderBalanceSheet = () => {
    const balanceSheet = reportsData.balanceSheet;
    if (!balanceSheet || !balanceSheet.assets?.length)
      return <p className="text-center text-gray-500">No balance sheet data to display.</p>;

    return (
      <ReportCard title={`Balance Sheet as of ${endDate ? format(new Date(endDate), "MM/dd/yyyy") : "today"}`}>
        <div className="flex flex-col md:flex-row gap-8">
          <BalanceSection title="Assets" data={balanceSheet.assets} total={balanceSheet.totalAssets} debitFirst />
          <div className="flex-1 space-y-4">
            <BalanceSection title="Liabilities" data={balanceSheet.liabilities} total={balanceSheet.totalLiabilities} />
            <BalanceSection title="Equity" data={balanceSheet.equity} total={balanceSheet.totalEquity} />
            <Total label="Total Liabilities & Equity" value={balanceSheet.totalLiabilitiesAndEquity} highlight />
          </div>
        </div>
      </ReportCard>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <ToastContainer position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Financial Reports</h1>

        <form onSubmit={generateReports} className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-end">
          <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
          <DateInput label="End Date" value={endDate} onChange={setEndDate} />

          <div className="flex flex-col justify-start">
            <label className="mb-2 font-semibold text-gray-700">Select Reports</label>
            {REPORT_OPTIONS.map(({ key, label }) => (
              <label key={key} className="inline-flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedReports[key]}
                  onChange={() => toggleReportSelection(key)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading || !activeAccountId || !endDate || !Object.values(selectedReports).some(Boolean)}
          >
            {loading ? `Generating ${generatingReport}...` : "Generate Report"}
          </button>
        </form>

        {/* Render reports only if selected and have data */}
        {selectedReports.trialBalance && renderTrialBalance()}
        {selectedReports.incomeStatement && renderIncomeStatement()}
        {selectedReports.balanceSheet && renderBalanceSheet()}
        {selectedReports.cashFlow && renderCashFlow()} 
      </div>
    </div>
  );
};

const DateInput = ({ label, value, onChange }) => (
  <div className="flex flex-col flex-1 w-full">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

export default Reports;
