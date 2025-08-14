/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/frontdesk/ReservationsPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";
import CreateReservationForm from "../../components/frontdesk/CreateReservation.jsx";
import ReservationListTable from "../../components/frontdesk/ReservationListTable.jsx";
import { useRoomsUpdate } from "../../Context/RoomsUpdateContext.jsx";

export default function ReservationsPage() {
  const { activeAccountId } = useAuth();
  const { setRoomsVersion } = useRoomsUpdate();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    guestName: "",
    room: "",
    checkInDate: "",
    checkOutDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReservations = async () => {
    if (!activeAccountId) return;
    try {
      const { data } = await backendClient.get(`/hotel/reservations`, {
        params: { account: activeAccountId },
      });
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load reservations");
      setReservations([]);
    }
  };

  const fetchAvailableRooms = async () => {
    if (!activeAccountId) return;
    try {
      const { data } = await backendClient.get(`/hotel/rooms/${activeAccountId}`);
      const available = data.filter(
        (room) => room.status === "Available" || room._id === formData.room
      );
      setAvailableRooms(available);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [activeAccountId]);

  useEffect(() => {
     if (isModalOpen && activeAccountId) {
    fetchAvailableRooms();
  }
  }, [isModalOpen, activeAccountId, formData.room]);

  const refreshData = () => {
    fetchReservations();
    fetchAvailableRooms();
    setRoomsVersion((v) => v + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await backendClient.put(`/hotel/reservations/${editingId}`, {
          ...formData,
          account: activeAccountId,
        });
        toast.success("Reservation updated successfully!");
      } else {
        await backendClient.post("/hotel/reservations", {
          ...formData,
          account: activeAccountId,
        });
        toast.success("Reservation created successfully!");
      }
      setFormData({
        guestName: "",
        room: "",
        checkInDate: "",
        checkOutDate: "",
      });
      setEditingId(null);
      setIsModalOpen(false);
      refreshData();
    } catch (error) {
      toast.error("Failed to save reservation. Please check your input and try again.",error);
    }
  };

  const handleEdit = (reservation) => {
    setEditingId(reservation._id);
    setFormData({
      guestName: reservation.guestName,
      room: reservation.room?._id,
      checkInDate: reservation.checkInDate.split("T")[0],
      checkOutDate: reservation.checkOutDate.split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleCheckIn = async (id) => {
    try {
      await backendClient.patch(`/hotel/reservations/${id}/checkin`);
      toast.success("Guest checked in successfully!");
      refreshData();
      navigate("/RoomStatusPage");
    } catch {
      toast.error("Failed to check in guest.");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await backendClient.patch(`/hotel/reservations/${id}/checkout`);
      toast.success("Guest checked out successfully!");
      refreshData();
    } catch {
      toast.error("Failed to check out guest.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    try {
      await backendClient.delete(`/hotel/reservations/${id}`);
      toast.success("Reservation deleted successfully!");
      refreshData();
    } catch {
      toast.error("Failed to delete reservation.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Reservations</h1>

      {/* Button to open modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
      >
        + Add Reservation
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-4 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({
                  guestName: "",
                  room: "",
                  checkInDate: "",
                  checkOutDate: "",
                });
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <CreateReservationForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              editingId={editingId}
              availableRooms={availableRooms}
            />
          </div>
        </div>
      )}

      {/* Reservation list table */}
      <ReservationListTable
        reservations={reservations}
        handleCheckIn={handleCheckIn}
        handleCheckOut={handleCheckOut}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />
    </div>
  );
}
