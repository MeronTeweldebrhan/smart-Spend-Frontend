import { useState, useEffect } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";
import CreateReservationForm from "../../components/frontdesk/CreateReservation.jsx";
import ReservationListTable from "../../components/frontdesk/ReservationListTable.jsx";
import { useRoomsUpdate } from "../../Context/RoomsUpdateContext.jsx";

export default function ReservationsPage() {
  const { activeAccountId } = useAuth();
  const { setRoomsVersion } = useRoomsUpdate();

  const [reservations, setReservations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    guestName: "",
    room: "",
    checkInDate: "",
    checkOutDate: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchReservations = async () => {
    if (!activeAccountId) return;
    try {
      const { data } = await backendClient.get(`/hotel/reservations`, {
        params: { account: activeAccountId },
      });
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load reservations");
      setReservations([]);
    }
  };

  const fetchAvailableRooms = async () => {
    if (!activeAccountId) return;
    try {
      const { data } = await backendClient.get(`/hotel/rooms/${activeAccountId}`);
      const available = data.filter((room) => room.status === "Available");
      setAvailableRooms(available);
    } catch {
      // handle error silently
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchAvailableRooms();
  }, [activeAccountId]);

  const refreshData = () => {
    fetchReservations();
    fetchAvailableRooms();
    setRoomsVersion((v) => v + 1); // notify room status page
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
      setFormData({ guestName: "", room: "", checkInDate: "", checkOutDate: "" });
      setEditingId(null);
      refreshData();
    } catch {
      toast.error("Failed to save reservation. Check your input and try again.");
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await backendClient.patch(`/hotel/reservations/${id}/checkin`);
      toast.success("Guest checked in successfully!");
      refreshData();
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
      <CreateReservationForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        editingId={editingId}
        availableRooms={availableRooms}
      />
      <ReservationListTable
        reservations={reservations}
        handleCheckIn={handleCheckIn}
        handleCheckOut={handleCheckOut}
        handleDelete={handleDelete}
      />
    </div>
  );
}
