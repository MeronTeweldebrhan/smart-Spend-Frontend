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

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/Signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/*  Only logged-in users can see this */}
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
        <Route path="/account/:id" element={<PrivateRoute> <AccountDetailPage/></PrivateRoute>}/>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footbar />
    </>
  );
}

export default App;
