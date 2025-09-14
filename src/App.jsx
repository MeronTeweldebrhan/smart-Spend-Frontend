import TransactionPage from "./Pages/TransactionPage";
import LoginPage from "./Pages/UserPage/LoginPage";
import SignupPage from "./Pages/UserPage/SignupPage";
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
import ItemPage from "./Pages/Inventory/ItemsPage";
import ItemFormPage from "./Pages/Inventory/ItemsFormPage";
import PurchaseOrdersPage from "./Pages/Inventory/PurchaseOrderPage";
import PurchaseOrderFormPage from "./Pages/Inventory/PurchaseOrderFormPage";
import Sidebar from "./components/Sidebar";
import SuppliersPage from "./Pages/Vendor/SupplierPage";
import SupplierFormPage from "./Pages/Vendor/SupplierFormPage";
import GRNPage from "./Pages/Inventory/CreateGrnPage";
import GRNPrintPage from "./Pages/Inventory/GrnPrintPage";
import StockLedgerSummaryPage from "./Pages/Inventory/StockLegderPage";
import StockLedgerDetailPage from "./Pages/Inventory/StockLedgerDetailPage";
import DepartmentPage from "./Pages/Department/DepartmentPage";
import DepartmentFormPage from "./Pages/Department/DepartmentFormPage";
import StoreRequisitionPage from "./Pages/Inventory/StoreRequisitionPage";
import StoreIssuePage from "./Pages/Inventory/StoreIssuePage";
import StoreIssuePageForStoreman from "./Pages/Inventory/StoreIssuePageForStoreman";
import UserFormPage from "./Pages/UserPage/UserFormPage";

function App() {
  return (
    <>
      <Navbar />
      <Sidebar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/*   users Routes */}
        <Route path="/" element={<Homepage />} />
          <Route path="/user/new" element={<UserFormPage />} />
        <Route path="/Signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/*  users Routes */}

{/*  ========Only logged-in users can see this====== */}

        {/*  Vendor  Routes  */}
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/suppliers/new" element={<SupplierFormPage />} />
        <Route path="/suppliers/edit/:id" element={<SupplierFormPage />} />
        {/*  Vendor  Routes  */}

        {/*  Department  Routes  */}
        <Route path="/departments" element={<DepartmentPage />} />
        <Route path="/department/new" element={<DepartmentFormPage />} />
       <Route path="/department/edit/:id" element={<DepartmentFormPage />} />
        {/*  Department  Routes  */}

        {/*  Inventory Routes  */}
        <Route path="/store-issues/storeman" element={<StoreIssuePageForStoreman />} />
        <Route path="/store-requisition/new/:departmentId" element={<StoreRequisitionPage />} />
      <Route path="/store-issues/:departmentId" element={<StoreIssuePage />} />
        <Route path="/stock-ledgers" element={<StockLedgerSummaryPage />} />
        <Route
          path="/stock-ledger/:itemId"
          element={<StockLedgerDetailPage />}
        />
        <Route path="/grn/print/:id" element={<GRNPrintPage />} />
        <Route path="/grn/create" element={<GRNPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route
          path="/purchase-orders/new"
          element={<PurchaseOrderFormPage />}
        />
        <Route
          path="/purchase-orders/edit/:id"
          element={<PurchaseOrderFormPage />}
        />
        <Route
          path="/items/new"
          element={
            <PrivateRoute>
              <ItemFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/Item"
          element={
            <PrivateRoute>
              <ItemPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/category/:id"
          element={
            <PrivateRoute>
              <CategoryDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/CategoriesPage"
          element={
            <PrivateRoute>
              <CategoryPage />
            </PrivateRoute>
          }
        />
        {/*  Inventory Routes  */}

        
        <Route
          path="/RoomStatusPage"
          element={
            <PrivateRoute>
              <RoomStatusPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/HotelFrontDesk"
          element={
            <PrivateRoute>
              <HotelFrontDesk />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservation"
          element={
            <PrivateRoute>
              <ReservationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/Roomsmanagment"
          element={
            <PrivateRoute>
              <HotelRoomsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chartofaccounts/:id"
          element={
            <PrivateRoute>
              <ChartOfAccountDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/journal/:id"
          element={
            <PrivateRoute>
              <JournalEntryDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chartofAccounts"
          element={
            <PrivateRoute>
              <ChartAccountsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <PrivateRoute>
              <JournalEntryPage />
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
        <Route
          path="/account/:id"
          element={
            <PrivateRoute>
              {" "}
              <AccountDetailPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footbar />
    </>
  );
}

export default App;
