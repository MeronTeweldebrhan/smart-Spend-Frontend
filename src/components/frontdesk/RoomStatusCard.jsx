

const statusColors = {
  Available: "bg-green-500",
  Booked: "bg-yellow-500",
  Occupied: "bg-red-500",
  Maintenance: "bg-gray-400",
};

export default function RoomStatusCard({ room, onCardClick }) {
  
  return (
    <div   onClick={() => onCardClick(room)}
    className="relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white font-semibold text-sm ${
          statusColors[room.status] || "bg-gray-300"
        }`}
      >
        {room.status || "Unknown"}
      </div>
      <h3 className="text-2xl font-bold mb-2">Room {room.roomNumber || "-"}</h3>
      <p className="text-gray-700 mb-1">
        Type: <span className="font-medium">{room.type || "-"}</span>
      </p>
      <p className="text-gray-700 mb-1">
        Rate: <span className="font-medium">${room.rate?.toFixed(2) || "0.00"}</span> / night
      </p>
      <p className="text-gray-700 mb-1">
        Guest Name : <span className="font-medium">{room.guestName || "None"}</span>
      </p>
      <p className="text-gray-700">
        Check-in:{" "}
        <span className="font-medium">
          {room.checkInDate ? new Date(room.checkInDate).toLocaleDateString() : "-"}
        </span>
      </p>
      <p className="text-gray-700">
        Check-out:{" "}
        <span className="font-medium">
          {room.checkOutDate ? new Date(room.checkOutDate).toLocaleDateString() : "-"}
        </span>
      </p>
       <p className="text-gray-700">
        Check-out:{" "}
        <span className="font-medium">
          {room.checkOutDate ? new Date(room.checkOutDate).toLocaleDateString() : "-"}
        </span>
      </p>
    </div>
  );
}
