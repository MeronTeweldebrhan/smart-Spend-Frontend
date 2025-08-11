
export default function CreateOrUpdateRoomForm({ formData, setFormData, handleSubmit, editingId }) {
    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4 max-w-lg">
            {/* ... (input fields from original component) ... */}
            <div>
                <label className="block font-medium">Room Number</label>
                <input type="text" className="input" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} required />
            </div>
            <div>
                <label className="block font-medium">Type</label>
                <select className="input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                    <option value="">Select Type</option>
                    <option>Single</option>
                    <option>Double</option>
                    <option>Suite</option>
                </select>
            </div>
            <div>
                <label className="block font-medium">Rate</label>
                <input type="number" className="input" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} required />
            </div>
            <div>
                <label className="block font-medium">Description</label>
                <textarea className="input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>
            <button type="submit" className="btn-primary w-full">
                {editingId ? "Update Room" : "Add Room"}
            </button>
        </form>
    );
}