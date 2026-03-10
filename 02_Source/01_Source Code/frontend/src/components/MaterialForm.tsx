/**
 * MaterialForm Component
 * Form for creating and editing materials
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { materialService } from '../services/materialService';
import type { CreateMaterialRequest, UpdateMaterialRequest, MaterialType } from '../types/material';
import { MATERIAL_TYPE_OPTIONS } from '../types/material';
import './MaterialForm.css';

interface MaterialFormProps {
  mode: 'create' | 'edit';
}

const MaterialForm: React.FC<MaterialFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<CreateMaterialRequest>({
    part_number: '',
    material_name: '',
    material_type: '' as MaterialType,
    storage_conditions: '',
    specification_document: '',
    default_label_template_id: '',
    metadata: {},
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchMaterial();
    }
  }, [mode, id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const material = await materialService.getMaterialById(id!);
      setFormData({
        part_number: material.part_number,
        material_name: material.material_name,
        material_type: material.material_type,
        storage_conditions: material.storage_conditions || '',
        specification_document: material.specification_document || '',
        default_label_template_id: material.default_label_template_id || '',
        metadata: material.metadata || {},
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch material');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.part_number.trim()) {
      errors.part_number = 'Part number is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.part_number)) {
      errors.part_number = 'Part number must contain only uppercase letters, numbers, and hyphens';
    }

    if (!formData.material_name.trim()) {
      errors.material_name = 'Material name is required';
    } else if (formData.material_name.length < 3) {
      errors.material_name = 'Material name must be at least 3 characters';
    }

    if (!formData.material_type) {
      errors.material_type = 'Material type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        await materialService.createMaterial(formData);
      } else {
        const updateData: UpdateMaterialRequest = { ...formData };
        delete (updateData as any).part_number; // Cannot update part_number
        await materialService.updateMaterial(id!, updateData);
      }
      navigate('/materials');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} material`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading material...</div>;
  }

  return (
    <div className="material-form-container">
      <div className="form-header">
        <h1>{mode === 'create' ? 'Add New Material' : 'Edit Material'}</h1>
        <button onClick={() => navigate('/materials')} className="btn btn-secondary">
          ← Back to List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="material-form">
        {/* Part Number */}
        <div className="form-group">
          <label htmlFor="part_number" className="required">
            Part Number
          </label>
          <input
            type="text"
            id="part_number"
            name="part_number"
            value={formData.part_number}
            onChange={handleChange}
            disabled={mode === 'edit'}
            className={validationErrors.part_number ? 'error' : ''}
            placeholder="e.g., PART-10001"
          />
          {validationErrors.part_number && (
            <span className="error-text">{validationErrors.part_number}</span>
          )}
          {mode === 'edit' && (
            <span className="help-text">Part number cannot be changed</span>
          )}
        </div>

        {/* Material Name */}
        <div className="form-group">
          <label htmlFor="material_name" className="required">
            Material Name
          </label>
          <input
            type="text"
            id="material_name"
            name="material_name"
            value={formData.material_name}
            onChange={handleChange}
            className={validationErrors.material_name ? 'error' : ''}
            placeholder="e.g., Ascorbic Acid (Vitamin C)"
          />
          {validationErrors.material_name && (
            <span className="error-text">{validationErrors.material_name}</span>
          )}
        </div>

        {/* Material Type */}
        <div className="form-group">
          <label htmlFor="material_type" className="required">
            Material Type
          </label>
          <select
            id="material_type"
            name="material_type"
            value={formData.material_type}
            onChange={handleChange}
            className={validationErrors.material_type ? 'error' : ''}
          >
            <option value="">Select a type...</option>
            {MATERIAL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {validationErrors.material_type && (
            <span className="error-text">{validationErrors.material_type}</span>
          )}
        </div>

        {/* Storage Conditions */}
        <div className="form-group">
          <label htmlFor="storage_conditions">Storage Conditions</label>
          <input
            type="text"
            id="storage_conditions"
            name="storage_conditions"
            value={formData.storage_conditions}
            onChange={handleChange}
            placeholder="e.g., 2-8°C, protected from light"
          />
        </div>

        {/* Specification Document */}
        <div className="form-group">
          <label htmlFor="specification_document">Specification Document</label>
          <input
            type="text"
            id="specification_document"
            name="specification_document"
            value={formData.specification_document}
            onChange={handleChange}
            placeholder="e.g., SPEC-VC-2025-01"
          />
        </div>

        {/* Default Label Template ID */}
        <div className="form-group">
          <label htmlFor="default_label_template_id">Default Label Template ID</label>
          <input
            type="text"
            id="default_label_template_id"
            name="default_label_template_id"
            value={formData.default_label_template_id}
            onChange={handleChange}
            placeholder="e.g., TPL-RM-01"
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/materials')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : mode === 'create' ? 'Create Material' : 'Update Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;
