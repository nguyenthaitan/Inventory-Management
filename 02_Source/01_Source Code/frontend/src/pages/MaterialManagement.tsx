/**
 * Material Management Page
 * Main page integrating all Material components (List, Search, Form, Detail)
 */

import React, { useState, useCallback } from "react";
import type { Material } from "../types/Material";
import {
  MaterialList,
  MaterialSearch,
  MaterialForm,
  MaterialDetail,
} from "../components";
import { materialService } from "../services/material.service";
import "./MaterialManagement.css";

type ViewMode = "list" | "detail" | "form";
type FormMode = "create" | "edit";

interface FormState {
  visible: boolean;
  mode: FormMode;
  material?: Material;
}

interface DetailState {
  visible: boolean;
  material?: Material;
}

export const MaterialManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [formState, setFormState] = useState<FormState>({
    visible: false,
    mode: "create",
  });
  const [detailState, setDetailState] = useState<DetailState>({
    visible: false,
  });
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  // Open create form
  const handleOpenCreateForm = useCallback(() => {
    setFormState({
      visible: true,
      mode: "create",
    });
    setViewMode("form");
  }, []);

  // Open edit form
  const handleOpenEditForm = useCallback((material: Material) => {
    setFormState({
      visible: true,
      mode: "edit",
      material,
    });
    setViewMode("form");
  }, []);

  // Close form
  const handleCloseForm = useCallback(() => {
    setFormState({
      visible: false,
      mode: "create",
      material: undefined,
    });
    setViewMode("list");
  }, []);

  // Handle form success - refresh list and close form
  const handleFormSuccess = useCallback(() => {
    setListRefreshKey((prev) => prev + 1);
    handleCloseForm();
  }, [handleCloseForm]);

  // Open detail view
  const handleOpenDetail = useCallback((material: Material) => {
    setDetailState({
      visible: true,
      material,
    });
    setViewMode("detail");
  }, []);

  // Close detail view
  const handleCloseDetail = useCallback(() => {
    setDetailState({
      visible: false,
      material: undefined,
    });
    setViewMode("list");
  }, []);

  // Handle delete material
  const handleDeleteMaterial = useCallback(
    async (materialId: string) => {
      try {
        setDeleteLoading(true);
        setDeleteError(null);
        await materialService.delete(materialId);
        // Refresh list after delete
        setListRefreshKey((prev) => prev + 1);
        handleCloseDetail();
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Delete failed");
        setDeleteError(err);
        console.error("[MaterialManagement] Delete failed:", err);
      } finally {
        setDeleteLoading(false);
      }
    },
    [handleCloseDetail],
  );

  // Handle material selection from search - open detail
  const handleSearchSelectMaterial = useCallback((materialId: string) => {
    // In a real app, you might fetch from a map or pass the whole material
    // For now, just close search and show message
    console.log("Material selected from search:", materialId);
    setViewMode("list");
  }, []);

  return (
    <div className="material-management">
      <header className="management-header">
        <div className="header-content">
          <h1>Material Management</h1>
          <p className="header-subtitle">
            Manage materials, create new entries, search and filter by type
          </p>
        </div>
        <button className="btn-create" onClick={handleOpenCreateForm}>
          + New Material
        </button>
      </header>

      <div className="management-body">
        {/* Search Section */}
        <section className="search-section">
          <MaterialSearch onResultSelect={handleSearchSelectMaterial} />
        </section>

        {/* Main Content Area */}
        <div className="content-area">
          {/* List View */}
          {viewMode === "list" && (
            <div className="list-view" key={listRefreshKey}>
              <MaterialList onSelectMaterial={handleOpenDetail} />
            </div>
          )}

          {/* Detail View */}
          {viewMode === "detail" &&
            detailState.visible &&
            detailState.material && (
              <div className="detail-view">
                <div className="detail-panel">
                  <MaterialDetail
                    material={detailState.material}
                    onEdit={handleOpenEditForm}
                    onDelete={handleDeleteMaterial}
                    onClose={handleCloseDetail}
                  />
                  {deleteError && (
                    <div className="delete-error-message">
                      <p>Failed to delete: {deleteError.message}</p>
                    </div>
                  )}
                  {deleteLoading && (
                    <div className="delete-loading-overlay">
                      <p>Deleting...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Form Modal */}
          {formState.visible && (
            <div className="form-modal">
              <div className="form-modal-overlay" onClick={handleCloseForm} />
              <div className="form-modal-content">
                <MaterialForm
                  mode={formState.mode}
                  existingMaterial={formState.material}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCloseForm}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialManagement;
