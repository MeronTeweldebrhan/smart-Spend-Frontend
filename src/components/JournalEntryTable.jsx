
function JournalEntryTable({ entries = [] }) {
  return (
    <table className="w-350 mt-6 border">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">Date</th>
          <th className="border p-2">Description</th>
          <th className="border p-2">Code</th>
          <th className="border p-2">Account</th>
          <th className="border p-2">Debit</th>
          <th className="border p-2">Credit</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 ? (
          <tr>
            <td colSpan="6" className="border p-4 text-center text-gray-500">
              No journal entries found.
            </td>
          </tr>
        ) : (
          entries.map((entry) =>
            entry.lines.map((line, lineIndex) => (
              <tr key={`${entry._id}-${lineIndex}`} className="text-sm">
                {lineIndex === 0 && (
                  <>
                    <td
                      className="border p-2 align-top"
                      rowSpan={entry.lines.length}
                    >
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td
                      className="border p-2 align-top"
                      rowSpan={entry.lines.length}
                    >
                      {entry.description}
                    </td>
                  </>
                )}
                {/* Code column */}
                <td className="border p-2">
                  {line.account?.code || 'N/A'}
                </td>
                {/* Account name column */}
                <td className="border p-2">
                  {line.account?.name || 'N/A'}
                </td>
                <td className="border p-2">
                  {line.type === 'debit' ? `$${line.amount.toFixed(2)}` : '-'}
                </td>
                <td className="border p-2">
                  {line.type === 'credit' ? `$${line.amount.toFixed(2)}` : '-'}
                </td>
              </tr>
            ))
          )
        )}
      </tbody>
    </table>
  );
}

export default JournalEntryTable;
