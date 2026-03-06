/**
 * MaterialForm Component
 * Form for creating and updating materials
 */

import React, { useEffect } from "react";
import type { Material, MaterialType } from "../types/Material";
import { useMaterialForm } from "../hooks";
import "./MaterialForm.css";

interface MaterialFormProps {
  mode?: "create" | "edit";
  existingMaterial?: Material;
  onSuccess?: (material: Material) => void;
  onCancel?: () => void;
}

const MATERIAL_TYPES: MaterialType[] = [
  "API",
  "Excipient",
  "Dietary Supplement",
  "Container",
  "Closure",
  "Process Chemical",
  "Testing Material",
];

export const MaterialForm: React.FC<MaterialFormProps> = ({
  mode = "create",
  existingMaterial,
  onSuccess,
  onCancel,
}) => {
  const {
    formData,
    errors,
    loading,
    error,
    success,
    setFieldValue,
    resetForm,
    submit,
    submitUpdate,
    clearSuccess,
  } = useMaterialForm(onSuccess);

  // Load existing material data when in edit mode
  useEffect(() => {
    if (mode === "edit" && existingMaterial) {
      setFieldValue("part_number", existingMaterial.part_number);
      setFieldValue("material_name", existingMaterial.material_name);
      setFieldValue(
        "material_type",
        existingMaterial.material_type as MaterialType,
      );
      if (existingMaterial.storage_conditions) {
        setFieldValue(
          "storage_conditions",
          existingMaterial.storage_conditions,
        );
      }
      if (existingMaterial.specification_document) {
        setFieldValue(
          "specification_document",
          existingMaterial.specification_document,
        );
      }
    }
  }, [mode, existingMaterial, setFieldValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      await submit();
    } else if (mode === "edit" && existingMaterial) {
      await submitUpdate(existingMaterial._id);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="material-form">
      <h2>{mode === "create" ? "Create New Material" : "Edit Material"}</h2>

      {error && (
        <div className="form-error alert">
          <p>{error.message}</p>
        </div>
      )}

      {success && (
        <div className="form-success alert">
          <p className="success-message">
            ✓ Material {mode === "create" ? "created" : "updated"} successfully!
          </p>
          <button className="alert-close" onClick={clearSuccess} type="button">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        {/* Material ID - Read Only in Edit Mode */}
        <div className="form-group">
          <label htmlFor="material_id">
            Material ID <span className="required">*</span>
          </label>
          <input
            id="material_id"
            type="text"
            value={formData.material_id}
            onChange={(e) => setFieldValue("material_id", e.target.value)}
            disabled={mode === "edit"}
            maxLength={20}
            className={errors.material_id ? "error" : ""}
            placeholder="e.g., MAT-001"
          />
          {errors.material_id && (
            <span className="field-error">{errors.material_id}</span>
          )}
          <span className="field-hint">Max 20 characters</span>
        </div>

        {/* Part Number */}
        <div className="form-group">
          <label htmlFor="part_number">
            Part Number <span className="required">*</span>
          </label>
          <input
            id="part_number"
            type="text"
            value={formData.part_number}
            onChange={(e) => setFieldValue("part_number", e.target.value)}
            maxLength={20}
            className={errors.part_number ? "error" : ""}
            placeholder="e.g., PN-2024-001"
          />
          {errors.part_number && (
            <span className="field-error">{errors.part_number}</span>
          )}
          <span className="field-hint">Max 20 characters</span>
        </div>

        {/* Material Name */}
        <div className="form-group">
          <label htmlFor="material_name">
            Material Name <span className="required">*</span>
          </label>
          <input
            id="material_name"
            type="text"
            value={formData.material_name}
            onChange={(e) => setFieldValue("material_name", e.target.value)}
            maxLength={100}
            className={errors.material_name ? "error" : ""}
            placeholder="e.g., Aspirin Powder"
          />
          {errors.material_name && (
            <span className="field-error">{errors.material_name}</span>
          )}
          <span className="field-hint">Max 100 characters</span>
        </div>

        {/* Material Type */}
        <div className="form-group">
          <label htmlFor="material_type">
            Material Type <span className="required">*</span>
          </label>
          <select
            id="material_type"
            value={formData.material_type}
            onChange={(e) =>
              setFieldValue("material_type", e.target.value as MaterialType)
            }
            className={errors.material_type ? "error" : ""}
          >
            <option value="">-- Select a type --</option>
            {MATERIAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.material_type && (
            <span className="field-error">{errors.material_type}</span>
          )}
        </div>

        {/* Storage Conditions */}
        <div className="form-group">
          <label htmlFor="storage_conditions">Storage Conditions</label>
          <input
            id="storage_conditions"
            type="text"
            value={formData.storage_conditions}
            onChange={(e) =>
              setFieldValue("storage_conditions", e.target.value)
            }
            maxLength={100}
            className={errors.storage_conditions ? "error" : ""}
            placeholder="e.g., 2-8°C, Protected from light"
          />
          {errors.storage_conditions && (
            <span className="field-error">{errors.storage_conditions}</span>
          )}
          <span className="field-hint">Max 100 characters (optional)</span>
        </div>

        {/* Specification Document */}
        <div className="form-group">
          <label htmlFor="specification_document">Specification Document</label>
          <input
            id="specification_document"
            type="text"
            value={formData.specification_document}
            onChange={(e) =>
              setFieldValue("specification_document", e.target.value)
            }
            maxLength={50}
            className={errors.specification_document ? "error" : ""}
            placeholder="e.g., SOP-2024-001"
          />
          {errors.specification_document && (
            <span className="field-error">{errors.specification_document}</span>
          )}
          <span className="field-hint">Max 50 characters (optional)</span>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Processing..."
              : mode === "create"
                ? "Create Material"
                : "Update Material"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            {mode === "create" ? "Reset" : "Cancel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;
