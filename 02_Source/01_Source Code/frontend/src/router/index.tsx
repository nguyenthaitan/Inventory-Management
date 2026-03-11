import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardIT from '../pages/admin/DashboardIT';
import SystemMonitoring from '../pages/admin/SystemMonitoring';
import BackupRestore from '../pages/admin/BackupRestore';
import ErrorLogs from '../pages/admin/ErrorLogs';
import SystemReports from '../pages/admin/SystemReports';
import DashboardQC from '../pages/qc/DashboardQC';
import InboundControl from '../pages/qc/InboundControl';
import InventoryQC from '../pages/qc/InventoryQC';
import ProductInspection from '../pages/qc/ProductInspection';
import ReportTraceability from '../pages/qc/ReportTraceability';
import DashboardManager from '../pages/manager/Dashboard';
import InventoryManager from '../pages/manager/Inventory';
import MaterialManagementManager from '../pages/manager/MaterialManagement';
import ManagerMaterialList from '../pages/manager/materials/List';
import ManagerMaterialDetail from '../pages/manager/materials/Detail';
import ManagerMaterialForm from '../pages/manager/materials/FormPage';
import ProductManagementManager from '../pages/manager/ProductManagement';
import ReportsManager from '../pages/manager/Reports';
import TransactionManagementManager from '../pages/manager/TransactionManagement';
import UserManagementManager from '../pages/manager/UserManagement';
import DashboardOperator from '../pages/operator/DashboardOperator';
import InventoryAuditOperator from '../pages/operator/InventoryAudit';
import MaterialManagementOperator from '../pages/operator/MaterialManagement';
import OperatorMaterialList from '../pages/operator/materials/List';
import OperatorMaterialDetail from '../pages/operator/materials/Detail';
import OperatorMaterialForm from '../pages/operator/materials/FormPage';
import ProductCreationOperator from '../pages/operator/ProductCreation';
import StockInOperator from '../pages/operator/StockIn';
import StockOutOperator from '../pages/operator/StockOut';
import TransactionHistoryOperator from '../pages/operator/TransactionHistory';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ApiTestProductionBatch from '../pages/operator/production-batches/ProductionBatch';
import ProductionBatchList from '../pages/manager/production-batches/List';
import ProductionBatchDetail from '../pages/manager/production-batches/Detail';
import ProductionBatchForm from '../pages/manager/production-batches/FormPage';
import OperatorProductionBatchList from '../pages/operator/production-batches/List';
import OperatorProductionBatchDetail from '../pages/operator/production-batches/Detail';
import OperatorProductionBatchForm from '../pages/operator/production-batches/FormPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // Khung chung
    children: [
      // IT ADMIN
      { path: 'admin/dashboard', element: <DashboardIT /> },
      { path: 'admin/monitoring', element: <SystemMonitoring /> },
      { path: 'admin/backup', element: <BackupRestore /> },
      { path: 'admin/error-logs', element: <ErrorLogs /> },
      { path: 'admin/reports', element: <SystemReports /> },

      // QC
      { path: 'qc/dashboard', element: <DashboardQC /> },
      { path: 'qc/inbound', element: <InboundControl /> },
      { path: 'qc/inventory', element: <InventoryQC /> },
      { path: 'qc/inspection', element: <ProductInspection /> },
      { path: 'qc/traceability', element: <ReportTraceability /> },

      // Manager
      { path: 'manager/dashboard', element: <DashboardManager /> },
      { path: 'manager/inventory', element: <InventoryManager /> },
      { path: 'manager/material', element: <MaterialManagementManager /> },
      { path: 'manager/materials', element: <ManagerMaterialList /> },
      { path: 'manager/materials/create', element: <ManagerMaterialForm /> },
      { path: 'manager/materials/:id', element: <ManagerMaterialDetail /> },
      { path: 'manager/materials/:id/edit', element: <ManagerMaterialForm /> },
      { path: 'manager/product', element: <ProductManagementManager /> },
      { path: 'manager/reports', element: <ReportsManager /> },
      { path: 'manager/transaction', element: <TransactionManagementManager /> },
      { path: 'manager/user', element: <UserManagementManager /> },
      { path: 'manager/production-batches', element: <ProductionBatchList /> },
      { path: 'manager/production-batches/create', element: <ProductionBatchForm /> },
      { path: 'manager/production-batches/:id', element: <ProductionBatchDetail /> },
      { path: 'manager/production-batches/:id/edit', element: <ProductionBatchForm /> },

      // Operator
      { path: 'operator/dashboard', element: <DashboardOperator /> },
      { path: 'operator/audit', element: <InventoryAuditOperator /> },
      { path: 'operator/material', element: <MaterialManagementOperator /> },
      { path: 'operator/materials', element: <OperatorMaterialList /> },
      { path: 'operator/materials/create', element: <OperatorMaterialForm /> },
      { path: 'operator/materials/:id', element: <OperatorMaterialDetail /> },
      { path: 'operator/materials/:id/edit', element: <OperatorMaterialForm /> },
      { path: 'operator/product', element: <ProductCreationOperator /> },
      { path: 'operator/stock-in', element: <StockInOperator /> },
      { path: 'operator/stock-out', element: <StockOutOperator /> },
      { path: 'operator/history', element: <TransactionHistoryOperator /> },
      { path: 'operator/production-batches', element: <OperatorProductionBatchList /> },
      { path: 'operator/production-batches/create', element: <OperatorProductionBatchForm /> },
      { path: 'operator/production-batches/:id', element: <OperatorProductionBatchDetail /> },
      { path: 'operator/production-batches/:id/edit', element: <OperatorProductionBatchForm /> },

      // Catch-all placeholder
      { path: '*', element: <div className="p-10 text-gray-400 text-lg">Page</div> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/api-test/batches',
    element: <ApiTestProductionBatch />,
  },
]);