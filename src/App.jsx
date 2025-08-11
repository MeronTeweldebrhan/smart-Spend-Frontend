import TransactionPage from "./Pages/TransactionPage";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import Homepage from "./Pages/HomePage";
import Dashboard from "./Pages/Dashboard";
import ReportsPage from "./Pages/ReportsPage";
import CategoryPage from "./Pages/CategoryPage";
import TransactionDetailsPage from "./Pages/TransactionDetailPage";
import CategoryDetailPage from "./Pages/CategoryDetailPage";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Footbar from "./components/Footbar";
import NotFoundPage from "./Pages/NotFoundPage";
import SettingsPage from "./Pages/SettingsPage";
import AccountDetailPage from "./Pages/AccountDetailPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JournalEntryPage from "./Pages/JournalEntrys/JournalEntryPage";
import ChartAccountsPage from "./Pages/chartofAccounts/ChartofAccountsPage";
import ChartOfAccountDetailPage from "./Pages/chartofAccounts/chartofAccountsDetailPage";
import JournalEntryDetailPage from "./Pages/JournalEntrys/JournalEntryDetailPage";
import HotelRoomsPage from "./Pages/HotelPages/HotelRoomsPage";
import ReservationsPage from "./Pages/HotelPages/ReservationPage";
import HotelFrontDesk from "./Pages/HotelPages/HotelFrontDesk";
import RoomStatusPage from "./Pages/HotelPages/RoomStatusPage";

function App() {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/Signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/*  Only logged-in users can see this */}
        <Route path="/RoomStatusPage" element={<PrivateRoute><RoomStatusPage /></PrivateRoute>} />
        <Route path="/HotelFrontDesk" element={<PrivateRoute><HotelFrontDesk /></PrivateRoute>} />
        <Route path="/reservation" element={<PrivateRoute><ReservationsPage /></PrivateRoute>} />
        <Route path="/Roomsmanagment" element={<PrivateRoute><HotelRoomsPage /></PrivateRoute>} />
        <Route
          path="/chartofaccounts/:id"
          element={<PrivateRoute><ChartOfAccountDetailPage /></PrivateRoute>} />
        <Route
          path="/journal/:id"
          element={<PrivateRoute><JournalEntryDetailPage /></PrivateRoute>} />

        <Route
          path="/chartofAccounts"
          element={<PrivateRoute><ChartAccountsPage /></PrivateRoute>} />
        <Route
          path="/journal"
          element={<PrivateRoute><JournalEntryPage /></PrivateRoute>} />
        <Route
          path="/category/:id"
          element={
            <PrivateRoute>
              <CategoryDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/category"
          element={
            <PrivateRoute>
              <CategoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <ReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction"
          element={
            <PrivateRoute>
              <TransactionPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction/:id"
          element={
            <PrivateRoute>
              <TransactionDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route path="/account/:id" element={<PrivateRoute> <AccountDetailPage /></PrivateRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footbar />
    </>
  );
}

export default App;
