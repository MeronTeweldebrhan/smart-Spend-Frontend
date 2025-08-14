import ReservationsPage from "../HotelPages/ReservationPage.jsx";
import RoomStatusPage from "../HotelPages/RoomStatusPage.jsx";
import { useState } from "react";
export default function HotelFrontDesk() {
  const [view, setView] = useState("reservations");

  return (
    <div className="App font-sans bg-gray-100 min-h-screen mt-12">
      <div className="flex justify-center p-4 space-x-4">
        <button
          onClick={() => setView("reservations")}
          className={`py-2 px-6 rounded-full font-semibold transition-colors duration-200 ${
            view === "reservations" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-800 shadow-md"
          }`}
        >
          Reservations
        </button>
        <button
          onClick={() => setView("roomStatus")}
          className={`py-2 px-6 rounded-full font-semibold transition-colors duration-200 ${
            view === "roomStatus" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-800 shadow-md"
          }`}
        >
          Room Status
        </button>
      </div>

      <div className="container mx-auto px-4">
        {view === "reservations" ? <ReservationsPage /> : <RoomStatusPage />}
      </div>
    </div>
  );
}
