import { useNavigate } from "react-router-dom";

function JournalEntryTable({ entries = [] }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 p-3 text-left text-gray-600 font-semibold">
              Code
            </th>
            <th className="border border-gray-200 p-3 text-left text-gray-600 font-semibold">
              Date
            </th>
            <th className="border border-gray-200 p-3 text-left text-gray-600 font-semibold">
              Account
            </th>
            <th className="border border-gray-200 p-3 text-left text-gray-600 font-semibold">
              Description
            </th>
            <th className="border border-gray-200 p-3 text-left text-gray-600 font-semibold">
              Debit
            </th>
            <th className="border border-gray-200 p-3 text-left text-gray-600 font-semibold">
              Credit
            </th>
            <th className="border border-gray-200 p-3 text-left text-gray-600 font-semibold">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="border border-gray-200 p-4 text-center text-gray-500"
              >
                No journal entries found.
              </td>
            </tr>
          ) : (
            entries.map((entry) =>
              entry.lines.map((line, lineIndex) => (
                <tr
                  key={`${entry._id}-${lineIndex}`}
                  className="text-sm hover:bg-gray-50"
                >
                  <td className="border border-gray-200 p-3">
                    {line.account?.code || "N/A"}
                  </td>
                  {lineIndex === 0 && (
                    <td
                      className="border border-gray-200 p-3 align-top"
                      rowSpan={entry.lines.length}
                    >
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                  )}
                  <td className="border border-gray-200 p-3">
                    {line.account?.name || "N/A"}
                  </td>
                  {lineIndex === 0 && (
                    <td
                      className="border border-gray-200 p-3 align-top"
                      rowSpan={entry.lines.length}
                    >
                      {entry.description}
                    </td>
                  )}
                  <td className="border border-gray-200 p-3">
                    {line.debit > 0 ? `$${line.debit.toFixed(2)}` : "-"}
                  </td>
                  <td className="border border-gray-200 p-3">
                    {line.credit > 0 ? `$${line.credit.toFixed(2)}` : "-"}
                  </td>
                  {lineIndex === 0 && (
                    <td
                      className="border border-gray-200 p-3 align-top"
                      rowSpan={entry.lines.length}
                    >
                      <button
                        onClick={() => navigate(`/journal/${entry._id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default JournalEntryTable;