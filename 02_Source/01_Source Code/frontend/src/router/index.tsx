import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardIT from "../pages/admin/DashboardIT";
import SystemMonitoring from "../pages/admin/SystemMonitoring";
import BackupRestore from "../pages/admin/BackupRestore";
import ErrorLogs from "../pages/admin/ErrorLogs";
import SystemReports from "../pages/admin/SystemReports";
import DashboardQC from "../pages/qc/DashboardQC";
import InboundControl from "../pages/qc/InboundControl";
import InventoryQC from "../pages/qc/InventoryQC";
import ProductInspection from "../pages/qc/ProductInspection";
import ReportTraceability from "../pages/qc/ReportTraceability";
import DashboardManager from "../pages/manager/Dashboard";
import InventoryLot from "../pages/manager/inventory-lot/InventoryLot";
import MaterialManagementManager from "../pages/manager/MaterialManagement";
import ProductManagementManager from "../pages/manager/ProductManagement";
import ReportsManager from "../pages/manager/Reports";
import TransactionManagementManager from "../pages/manager/TransactionManagement";
import UserManagementManager from "../pages/manager/UserManagement";
import DashboardOperator from "../pages/operator/DashboardOperator";
import InventoryAuditOperator from "../pages/operator/InventoryAudit";
import MaterialManagementOperator from "../pages/operator/MaterialManagement";
import ProductCreationOperator from "../pages/operator/ProductCreation";
import StockInOperator from "../pages/operator/StockIn";
import StockOutOperator from "../pages/operator/StockOut";
import TransactionHistoryOperator from "../pages/operator/TransactionHistory";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import type {JSX} from "react";

// ProtectedRoute component - React component thực sự kiểm tra token mỗi lần render
function ProtectedRoute({ element }: { element: JSX.Element }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return element;
}

function requireAuth(element: JSX.Element) {
  return <ProtectedRoute element={element} />;
}

// HomeRedirect component - redirect "/" về login hoặc dashboard dựa trên token và role
function HomeRedirect() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    switch (user.role) {
      case 'manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'operator':
        return <Navigate to="/operator/dashboard" replace />;
      case 'quality-control':
        return <Navigate to="/qc/dashboard" replace />;
      case 'it_admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "",
    element: <MainLayout />,
    children: [
      // IT ADMIN
      { path: "/admin/dashboard", element: requireAuth(<DashboardIT />) },
      { path: "/admin/monitoring", element: requireAuth(<SystemMonitoring />) },
      { path: "/admin/backup", element: requireAuth(<BackupRestore />) },
      { path: "/admin/error-logs", element: requireAuth(<ErrorLogs />) },
      { path: "/admin/reports", element: requireAuth(<SystemReports />) },

      // QC
      { path: "/qc/dashboard", element: requireAuth(<DashboardQC />) },
      { path: "/qc/inbound", element: requireAuth(<InboundControl />) },
      { path: "/qc/inventory", element: requireAuth(<InventoryQC />) },
      { path: "/qc/inspection", element: requireAuth(<ProductInspection />) },
      { path: "/qc/traceability", element: requireAuth(<ReportTraceability />) },

      // Manager
      { path: "/manager/dashboard", element: requireAuth(<DashboardManager />) },
      { path: "/manager/inventory", element: requireAuth(<InventoryLot />) },
      { path: "/manager/material", element: requireAuth(<MaterialManagementManager />) },
      { path: "/manager/product", element: requireAuth(<ProductManagementManager />) },
      { path: "/manager/reports", element: requireAuth(<ReportsManager />) },
      {
        path: "/manager/transaction",
        element: requireAuth(<TransactionManagementManager />),
      },
      { path: "/manager/user", element: requireAuth(<UserManagementManager />) },

      // Operator
      { path: "/operator/dashboard", element: requireAuth(<DashboardOperator />) },
      { path: "/operator/audit", element: requireAuth(<InventoryAuditOperator />) },
      { path: "/operator/material", element: requireAuth(<MaterialManagementOperator />) },
      { path: "/operator/product", element: requireAuth(<ProductCreationOperator />) },
      { path: "/operator/stock-in", element: requireAuth(<StockInOperator />) },
      { path: "/operator/stock-out", element: requireAuth(<StockOutOperator />) },
      { path: "/operator/history", element: requireAuth(<TransactionHistoryOperator />) },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
