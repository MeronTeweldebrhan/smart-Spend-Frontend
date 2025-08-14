
export default function RoomListTable({ rooms, handleEdit, handleDelete }) {
    return (
        <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3">Room #</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Rate</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(rooms) && rooms.length > 0 ? (
                        rooms.map((room) => (
                            <tr key={room._id} className="border-t">
                                <td className="p-3">{room.roomNumber}</td>
                                <td className="p-3">{room.type}</td>
                                <td className="p-3">${room.rate}</td>
                                <td className="p-3">{room.status}</td>
                                <td className="p-3 space-x-2">
                                    <button onClick={() => handleEdit(room)} className="btn-secondary">Edit</button>
                                    <button onClick={() => handleDelete(room._id)} className="btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="text-center p-4 text-gray-500">No rooms found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}