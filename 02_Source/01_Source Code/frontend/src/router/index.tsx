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
import InventoryManager from "../pages/manager/InventoryManager";
import MaterialManagementManager from "../pages/manager/MaterialManagement";
import ManagerMaterialList from "../pages/manager/materials/List";
import ManagerMaterialDetail from "../pages/manager/materials/Detail";
import ManagerMaterialForm from "../pages/manager/materials/FormPage";
import ProductManagementManager from "../pages/manager/ProductManagement";
import ReportsManager from "../pages/manager/Reports";
import TransactionManagementManager from "../pages/manager/TransactionManagement";
import UserManagementManager from "../pages/manager/UserManagement";
import InventoryTransactionListManager from "../pages/manager/InventoryTransactionListManager";
import InventoryTransactionListOperator from "../pages/operator/InventoryTransactionListOperator";
import LabelManagement from "../pages/manager/LabelManagement";
import DashboardOperator from "../pages/operator/DashboardOperator";
import InventoryAuditOperator from "../pages/operator/InventoryAudit";
import MaterialManagementOperator from "../pages/operator/MaterialManagement";
import OperatorMaterialList from "../pages/operator/materials/List";
import OperatorMaterialDetail from "../pages/operator/materials/Detail";
import OperatorMaterialForm from "../pages/operator/materials/FormPage";
import ProductCreationOperator from "../pages/operator/ProductCreation";
import StockInOperator from "../pages/operator/StockIn";
import StockOutOperator from "../pages/operator/StockOut";
import TransactionHistoryOperator from "../pages/operator/TransactionHistory";
import LabelPrintOperator from "../pages/operator/LabelPrint";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ApiTestProductionBatch from "../pages/operator/production-batches/ProductionBatch";
import ProductionBatchList from "../pages/manager/production-batches/List";
import ProductionBatchDetail from "../pages/manager/production-batches/Detail";
import ProductionBatchForm from "../pages/manager/production-batches/FormPage";
import OperatorProductionBatchList from "../pages/operator/production-batches/List";
import OperatorProductionBatchDetail from "../pages/operator/production-batches/Detail";
import OperatorProductionBatchForm from "../pages/operator/production-batches/FormPage";
import type { JSX } from "react";
import { isTokenValid } from "../utils/authUtils";
import StockManagement from "../pages/manager/StockManagement.tsx";
import InventoryLot from "../pages/manager/inventory-lot/InventoryLot.tsx";

/**
 * Get user role from localStorage with normalization
 */
function getUserRole(): string | null {
  try {
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    const role = user.role as string;

    // Normalize role: backend sends uppercase, convert to frontend lowercase format
    const roleMap: Record<string, string> = {
      Manager: "manager",
      Operator: "operator",
      "Quality Control Technician": "quality-control",
      "IT Administrator": "it_admin",
    };

    return roleMap[role] || role;
  } catch {
    return null;
  }
}

/**
 * ProtectedRoute component - kiểm tra token + optional role
 */
function ProtectedRoute({
  element,
  requiredRoles,
}: {
  element: JSX.Element;
  requiredRoles?: string[];
}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const userRole = getUserRole();

  // Check token validity
  if (!token || !isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRoles && requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      const dashboardMap: Record<string, string> = {
        manager: "/manager/dashboard",
        operator: "/operator/dashboard",
        "quality-control": "/qc/dashboard",
        it_admin: "/admin/dashboard",
      };
      const redirectUrl = userRole ? dashboardMap[userRole] || "/" : "/login";
      return <Navigate to={redirectUrl} replace />;
    }
  }

  return element;
}

/**
 * Helper function để wrap component với ProtectedRoute
 */
function requireAuth(element: JSX.Element, requiredRoles?: string[]) {
  return <ProtectedRoute element={element} requiredRoles={requiredRoles} />;
}

/**
 * Helper function cho Manager routes
 */
function requireManagerAuth(element: JSX.Element) {
  return requireAuth(element, ["manager"]);
}

/**
 * Helper function cho Operator routes
 */
function requireOperatorAuth(element: JSX.Element) {
  return requireAuth(element, ["operator"]);
}

/**
 * Helper function cho QC routes
 */
function requireQCAuth(element: JSX.Element) {
  return requireAuth(element, ["quality-control"]);
}

/**
 * Helper function cho Admin routes
 */
function requireAdminAuth(element: JSX.Element) {
  return requireAuth(element, ["it_admin"]);
}

// HomeRedirect component - redirect "/" về login hoặc dashboard dựa trên token và role
function HomeRedirect() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    // Normalize role to frontend format
    const role = typeof user.role === "string" ? user.role : "";
    const roleMap: Record<string, string> = {
      Manager: "manager",
      Operator: "operator",
      "Quality Control Technician": "quality-control",
      "IT Administrator": "it_admin",
    };
    const normalizedRole = roleMap[role] || role;

    switch (normalizedRole) {
      case "manager":
        return <Navigate to="/manager/dashboard" replace />;
      case "operator":
        return <Navigate to="/operator/dashboard" replace />;
      case "quality-control":
        return <Navigate to="/qc/dashboard" replace />;
      case "it_admin":
        return <Navigate to="/it-admin/dashboard" replace />;
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
      // IT ADMIN - Chỉ allow role 'it_admin'
      { path: "/admin/dashboard", element: requireAdminAuth(<DashboardIT />) },
      {
        path: "/admin/monitoring",
        element: requireAdminAuth(<SystemMonitoring />),
      },
      { path: "/admin/backup", element: requireAdminAuth(<BackupRestore />) },
      { path: "/admin/error-logs", element: requireAdminAuth(<ErrorLogs />) },
      { path: "/admin/reports", element: requireAdminAuth(<SystemReports />) },

      // QC - Chỉ allow role 'quality-control'
      { path: "/qc/dashboard", element: requireQCAuth(<DashboardQC />) },
      { path: "/qc/inbound", element: requireQCAuth(<InboundControl />) },
      { path: "/qc/inventory", element: requireQCAuth(<InventoryQC />) },
      { path: "/qc/inspection", element: requireQCAuth(<ProductInspection />) },
      {
        path: "/qc/traceability",
        element: requireQCAuth(<ReportTraceability />),
      },

      // Manager
      {
        path: "/manager/dashboard",
        element: requireAuth(<DashboardManager />),
      },
      { path: "/manager/inventory", element: requireAuth(<InventoryLot />) },
      {
        path: "/manager/material",
        element: requireAuth(<MaterialManagementManager />),
      },
      {
        path: "/manager/product",
        element: requireAuth(<ProductManagementManager />),
      },
      { path: "/manager/reports", element: requireAuth(<ReportsManager />) },
      {
        path: "/manager/transaction",
        element: requireManagerAuth(<TransactionManagementManager />),
      },
      {
        path: "/manager/user",
        element: requireAuth(<UserManagementManager />),
      },
      { path: "/manager/labels", element: <LabelManagement /> },
      { path: "/manager/production-batches", element: <ProductionBatchList /> },
      {
        path: "/manager/production-batches/create",
        element: <ProductionBatchForm />,
      },
      {
        path: "/manager/production-batches/:id",
        element: <ProductionBatchDetail />,
      },
      {
        path: "/manager/production-batches/:id/edit",
        element: <ProductionBatchForm />,
      },

      // Operator - Chỉ allow role 'operator'
      {
        path: "/operator/dashboard",
        element: requireOperatorAuth(<DashboardOperator />),
      },
      {
        path: "/operator/audit",
        element: requireOperatorAuth(<InventoryAuditOperator />),
      },
      {
        path: "/operator/material",
        element: requireOperatorAuth(<MaterialManagementOperator />),
      },
      {
        path: "/operator/materials",
        element: requireOperatorAuth(<OperatorMaterialList />),
      },
      {
        path: "/operator/materials/create",
        element: requireOperatorAuth(<OperatorMaterialForm />),
      },
      {
        path: "/operator/materials/:id",
        element: requireOperatorAuth(<OperatorMaterialDetail />),
      },
      {
        path: "/operator/materials/:id/edit",
        element: requireOperatorAuth(<OperatorMaterialForm />),
      },
      {
        path: "/operator/product",
        element: requireOperatorAuth(<ProductCreationOperator />),
      },
      {
        path: "/operator/stock-in",
        element: requireOperatorAuth(<StockInOperator />),
      },
      {
        path: "/operator/stock-out",
        element: requireOperatorAuth(<StockOutOperator />),
      },
      {
        path: "/operator/history",
        element: requireOperatorAuth(<TransactionHistoryOperator />),
      },
      {
        path: "/operator/labels",
        element: requireOperatorAuth(<LabelPrintOperator />),
      },
      {
        path: "/operator/production-batches",
        element: requireOperatorAuth(<OperatorProductionBatchList />),
      },
      {
        path: "/operator/production-batches/create",
        element: requireOperatorAuth(<OperatorProductionBatchForm />),
      },
      {
        path: "/operator/production-batches/:id",
        element: requireOperatorAuth(<OperatorProductionBatchDetail />),
      },
      {
        path: "/operator/production-batches/:id/edit",
        element: requireOperatorAuth(<OperatorProductionBatchForm />),
      },
      {
        path: "/operator/inventory-transactions",
        element: requireOperatorAuth(<InventoryTransactionListOperator />),
      },
      // Catch-all placeholder
      {
        path: "*",
        element: <div className="p-10 text-gray-400 text-lg">Page</div>,
      },
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
  {
    path: "/api-test/batches",
    element: <ApiTestProductionBatch />,
  },
]);
