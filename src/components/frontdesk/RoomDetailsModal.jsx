// src/components/frontdesk/RoomDetailsModal.jsx
import  { useState, useEffect } from "react";
import Modal from "react-modal";
import backendClient from "../../Clients/backendClient.js";
import { toast } from "react-toastify";

// Custom styles for the modal (optional, you can use Tailwind CSS for content)
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "2rem",
    borderRadius: "0.75rem",
    maxWidth: "1000px",
    height: "90%",
    width: "90%",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
};

const statusColors = {
  Available: "bg-green-500",
  Booked: "bg-yellow-500",
  Occupied: "bg-red-500",
  Maintenance: "bg-gray-400",
};

export default function RoomDetailsModal({ isOpen, onRequestClose, room, onUpdate }) {
  // Use local state to manage form fields for editing
  const [editingCheckoutDate, setEditingCheckoutDate] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (room && room.checkOutDate) {
      // Set the editing state only when the modal opens and has a room
      setEditingCheckoutDate(new Date(room.checkOutDate).toISOString().split('T')[0]);
    }
  }, [room]);

  if (!room) {
    return null;
  }

  const handleCheckout = async () => {
    if (!window.confirm(`Are you sure you want to check out guest '${room.guestName}' from room ${room.roomNumber}?`)) {
      return;
    }
    try {
      await backendClient.patch(`/hotel/reservations/${room.reservation._id}/checkout`);
      toast.success("Guest checked out successfully!");
      onUpdate(); // Trigger a refresh on the parent page
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to check out guest.");
    }
  };

  const handlePayment = async () => {
    try {
      await backendClient.patch(`/hotel/reservations/${room.reservation._id}/pay`);
      toast.success("Payment recorded successfully!");
      onUpdate();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment.");
    }
  };

  const handleExtendCheckout = async () => {
    try {
      await backendClient.patch(`/hotel/reservations/${room.reservation._id}/extend`, {
        newCheckOutDate: editingCheckoutDate,
      });
      toast.success("Checkout date extended successfully!");
      onUpdate();
      setIsExtending(false);
    } catch (error) {
      console.error("Error extending checkout date:", error);
      toast.error("Failed to extend checkout date.");
    }
  };

  const isOccupied = room.status === "Occupied";
  const hasReservation = !!room.reservation;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Room Details"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Room {room.roomNumber} Details</h2>
        <button
          onClick={onRequestClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-gray-700">
          <span className="font-semibold">Type:</span> {room.type}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Rate:</span> ${room.rate?.toFixed(2)} / night
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Status:</span>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-white font-semibold text-sm ${
              statusColors[room.status] || "bg-gray-300"
            }`}
          >
            {room.status}
          </span>
        </p>
        {isOccupied && hasReservation && (
          <>
            <p className="text-gray-700">
              <span className="font-semibold">Guest Name:</span> {room.guestName}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Check-in:</span>{" "}
              {new Date(room.checkInDate).toLocaleDateString()}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-gray-700">
                <span className="font-semibold">Check-out:</span>{" "}
                {new Date(room.checkOutDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => setIsExtending(!isExtending)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isExtending ? "Cancel" : "Extend"}
              </button>
            </div>
            {isExtending && (
              <div className="flex flex-col space-y-2 mt-2">
                <input
                  type="date"
                  value={editingCheckoutDate}
                  onChange={(e) => setEditingCheckoutDate(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleExtendCheckout}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Save Extension
                </button>
              </div>
            )}
            <p className="text-gray-700">
              <span className="font-semibold">Payment Status:</span>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  room.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {room.paymentStatus || "Unpaid"}
              </span>
            </p>
          </>
        )}
      </div>

      {isOccupied && hasReservation && (
        <div className="flex justify-end space-x-2 mt-6 border-t pt-4">
          {room.paymentStatus !== "Paid" && (
            <button
              onClick={handlePayment}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Mark as Paid
            </button>
          )}
          <button
            onClick={handleCheckout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Check Out
          </button>
        </div>
      )}
    </Modal>
  );
}