import { useState, useEffect } from "react";
import backendClient from "../../Clients/backendClient.js";
import { useAuth } from "../../Context/useAuth.js";
import { toast } from "react-toastify";

import CreateOrUpdateRoomForm from "../../components/frontdesk/CreateOrUpdateRoomForm.jsx";
import RoomListTable from "../../components/frontdesk/RoomListTable.jsx";

export default function HotelRoomsPage() {
    const { activeAccountId } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({ roomNumber: "", type: "", rate: "", description: "" });
    const [editingId, setEditingId] = useState(null);

    const fetchRooms = async () => {
        if (!activeAccountId) return;
        try {
            const { data } = await backendClient.get(`/hotel/rooms/${activeAccountId}`);
            setRooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load rooms:", error);
            toast.error("Failed to load rooms");
            setRooms([]);
        }
    };

    useEffect(() => {
        console.log("Current activeAccountId:", activeAccountId); // --- Crucial for debugging!
        fetchRooms();
    }, [activeAccountId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Log the accountId being sent to the backend
            console.log("Submitting with accountId:", activeAccountId); 
            
            if (editingId) {
                await backendClient.put(`/hotel/rooms/${editingId}`, { ...formData, accountId: activeAccountId });
                toast.success("Room updated successfully!");
            } else {
                await backendClient.post("/hotel/rooms", { ...formData, accountId: activeAccountId });
                toast.success("Room created successfully!");
            }
            setFormData({ roomNumber: "", type: "", rate: "", description: "" });
            setEditingId(null);
            fetchRooms(); // Refresh the list after an action
        } catch (error) {
            console.error("Error saving room:", error);
            toast.error("Failed to save room. Check your input and try again.");
        }
    };

    const handleEdit = (room) => {
        setFormData({ roomNumber: room.roomNumber, type: room.type, rate: room.rate, description: room.description });
        setEditingId(room._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            await backendClient.delete(`/hotel/rooms/${id}`);
            toast.success("Room deleted successfully!");
            fetchRooms(); // Refresh the list
        } catch (error) {
            console.error("Error deleting room:", error);
            toast.error("Failed to delete room.");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Hotel Rooms Management</h1>
            <CreateOrUpdateRoomForm 
                formData={formData} 
                setFormData={setFormData} 
                handleSubmit={handleSubmit} 
                editingId={editingId} 
            />
            <RoomListTable 
                rooms={rooms} 
                handleEdit={handleEdit} 
                handleDelete={handleDelete} 
            />
        </div>
    );
}
