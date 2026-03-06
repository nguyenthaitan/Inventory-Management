/**
 * MaterialDetail Component
 * Display single material detail view
 */

import React from "react";
import type { Material } from "../types/Material";
import { useMaterialDetail } from "../hooks";
import "./MaterialDetail.css";

interface MaterialDetailProps {
  materialId?: string;
  material?: Material;
  onEdit?: (material: Material) => void;
  onDelete?: (materialId: string) => void;
  onClose?: () => void;
}

export const MaterialDetail: React.FC<MaterialDetailProps> = ({
  materialId,
  material: propMaterial,
  onEdit,
  onDelete,
  onClose,
}) => {
  // Use hook if materialId provided, otherwise use prop
  const {
    material: hookMaterial,
    loading,
    error,
    refetch,
  } = useMaterialDetail(materialId);
  const material = propMaterial || hookMaterial;

  if (!material && loading) {
    return (
      <div className="material-detail loading">
        <p>Loading material details...</p>
      </div>
    );
  }

  if (!material && error) {
    return (
      <div className="material-detail error">
        <div className="error-content">
          <h3>Failed to load material</h3>
          <p>{error.message}</p>
          <button onClick={refetch}>Retry</button>
          {onClose && <button onClick={onClose}>Close</button>}
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="material-detail empty">
        <p>No material selected</p>
        {onClose && <button onClick={onClose}>Close</button>}
      </div>
    );
  }

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${material.material_name}"?`,
      )
    ) {
      if (onDelete) {
        onDelete(material._id);
      }
    }
  };

  return (
    <div className="material-detail">
      <div className="detail-header">
        <h2>{material.material_name}</h2>
        {onClose && (
          <button
            className="btn-close"
            onClick={onClose}
            title="Close detail view"
          >
            ✕
          </button>
        )}
      </div>

      <div className="detail-content">
        {/* Basic Information Section */}
        <section className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-field">
              <label>Material ID</label>
              <code className="code-value">{material.material_id}</code>
            </div>
            <div className="detail-field">
              <label>Part Number</label>
              <code className="code-value">{material.part_number}</code>
            </div>
            <div className="detail-field">
              <label>Material Type</label>
              <span className="type-badge large">{material.material_type}</span>
            </div>
            <div className="detail-field full-width">
              <label>Material Name</label>
              <p>{material.material_name}</p>
            </div>
          </div>
        </section>

        {/* Optional Details Section */}
        {(material.storage_conditions || material.specification_document) && (
          <section className="detail-section">
            <h3>Additional Details</h3>
            <div className="detail-grid">
              {material.storage_conditions && (
                <div className="detail-field full-width">
                  <label>Storage Conditions</label>
                  <p>{material.storage_conditions}</p>
                </div>
              )}
              {material.specification_document && (
                <div className="detail-field full-width">
                  <label>Specification Document</label>
                  <code className="code-value">
                    {material.specification_document}
                  </code>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Timestamp Section */}
        <section className="detail-section">
          <h3>Metadata</h3>
          <div className="detail-grid">
            <div className="detail-field">
              <label>Created</label>
              <p>{new Date(material.created_date).toLocaleString()}</p>
            </div>
            {material.modified_date && (
              <div className="detail-field">
                <label>Last Modified</label>
                <p>{new Date(material.modified_date).toLocaleString()}</p>
              </div>
            )}
            <div className="detail-field">
              <label>ID</label>
              <code className="code-value small">{material._id}</code>
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <div className="detail-actions">
          {onEdit && (
            <button className="btn-edit" onClick={() => onEdit(material)}>
              Edit Material
            </button>
          )}
          {onDelete && (
            <button className="btn-delete" onClick={handleDelete}>
              Delete Material
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialDetail;
