import { useState, useEffect } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";
import RoomStatusCard from "../../components/frontdesk/RoomStatusCard.jsx";
import { useRoomsUpdate } from "../../Context/RoomsUpdateContext.jsx";

export default function RoomStatusPage() {
  const { activeAccountId } = useAuth();
  const { roomsVersion } = useRoomsUpdate();

  const [rooms, setRooms] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'

  const fetchRooms = async () => {
    if (!activeAccountId) return;
    try {
      const { data } = await backendClient.get(`/hotel/rooms/${activeAccountId}`);
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load rooms");
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activeAccountId, roomsVersion]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Room Status
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            }`}
            aria-pressed={viewMode === "grid"}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            }`}
            aria-pressed={viewMode === "table"}
          >
            Table View
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rooms.length > 0 ? (
            rooms.map((room) => <RoomStatusCard key={room._id} room={room} />)
          ) : (
            <p className="text-gray-500 text-center col-span-full py-8">
              No rooms found for this account.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Housekeeping Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.roomNumber || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.type || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.status || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.housekeepingStatus || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.guestName || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(room.checkInDate)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(room.checkOutDate)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.paymentStatus || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500">
                    No rooms found for this account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
