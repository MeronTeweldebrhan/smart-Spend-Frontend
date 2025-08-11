

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const ReservationListTable = ({ reservations, handleCheckIn, handleCheckOut, handleDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden mt-8">
      <table className="min-w-full text-left text-gray-800">
        <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
          <tr>
            <th className="p-4 font-medium">Guest Name</th>
            <th className="p-4 font-medium">Room</th>
            <th className="p-4 font-medium">Check-in</th>
            <th className="p-4 font-medium">Check-out</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(reservations) && reservations.length > 0 ? (
            reservations.map((reservation) => (
              <tr key={reservation._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-4">{reservation.guestName}</td>
                <td className="p-4">{reservation.room?.roomNumber || "N/A"}</td>
                <td className="p-4">{formatDate(reservation.checkInDate)}</td>
                <td className="p-4">{formatDate(reservation.checkOutDate)}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reservation.status === "CheckedIn" ? "bg-green-100 text-green-800" :
                      reservation.status === "CheckedOut" ? "bg-gray-100 text-gray-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {reservation.status}
                  </span>
                </td>
                <td className="p-4 space-x-2 flex">
                  {reservation.status === "Pending" || "Booked" &&  (
                    <button
                      onClick={() => handleCheckIn(reservation._id)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
                    >
                      Check-in
                    </button>
                  )}
                  {reservation.status === "CheckedIn" && (
                    <button
                      onClick={() => handleCheckOut(reservation._id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Check-out
                    </button>
                  )}
                  {reservation.status !== "CheckedOut" && (
                    <button
                      onClick={() => handleDelete(reservation._id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                No reservations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationListTable;
