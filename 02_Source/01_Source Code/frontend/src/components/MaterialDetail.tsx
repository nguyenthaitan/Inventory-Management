/**
 * MaterialDetail Component
 * Displays detailed information about a single material
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { materialService } from '../services/materialService';
import type { Material } from '../types/material';
import { MATERIAL_TYPE_COLORS } from '../types/material';
import './MaterialDetail.css';

const MaterialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await materialService.getMaterialById(id!);
      setMaterial(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch material');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await materialService.deleteMaterial(id!);
      navigate('/materials');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete material');
    }
  };

  if (loading) {
    return <div className="loading">Loading material details...</div>;
  }

  if (error) {
    return (
      <div className="material-detail-container">
        <div className="error-message">{error}</div>
        <Link to="/materials" className="btn btn-secondary">
          ← Back to List
        </Link>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="material-detail-container">
        <div className="error-message">Material not found</div>
        <Link to="/materials" className="btn btn-secondary">
          ← Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="material-detail-container">
      <div className="detail-header">
        <h1>{material.material_name}</h1>
        <div className="detail-actions">
          <Link to="/materials" className="btn btn-secondary">
            ← Back to List
          </Link>
          <Link to={`/materials/${id}/edit`} className="btn btn-primary">
            ✏️ Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Basic Information */}
        <section className="detail-section">
          <h2>Basic Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Material ID:</label>
              <span className="value">{material.material_id}</span>
            </div>
            <div className="detail-item">
              <label>Part Number:</label>
              <span className="value part-number">{material.part_number}</span>
            </div>
            <div className="detail-item">
              <label>Material Name:</label>
              <span className="value">{material.material_name}</span>
            </div>
            <div className="detail-item">
              <label>Material Type:</label>
              <span
                className="material-type-badge"
                style={{ backgroundColor: MATERIAL_TYPE_COLORS[material.material_type] }}
              >
                {material.material_type}
              </span>
            </div>
          </div>
        </section>

        {/* Storage and Specification */}
        <section className="detail-section">
          <h2>Storage & Specification</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Storage Conditions:</label>
              <span className="value">{material.storage_conditions || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <label>Specification Document:</label>
              <span className="value">{material.specification_document || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <label>Default Label Template:</label>
              <span className="value">{material.default_label_template_id || 'Not specified'}</span>
            </div>
          </div>
        </section>

        {/* System Information */}
        <section className="detail-section">
          <h2>System Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Created By:</label>
              <span className="value">{material.created_by}</span>
            </div>
            <div className="detail-item">
              <label>Created At:</label>
              <span className="value">{new Date(material.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <label>Updated At:</label>
              <span className="value">{new Date(material.updatedAt).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <label>Status:</label>
              <span className={`status-badge ${material.is_active ? 'active' : 'inactive'}`}>
                {material.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </section>

        {/* Metadata (if exists) */}
        {material.metadata && Object.keys(material.metadata).length > 0 && (
          <section className="detail-section">
            <h2>Additional Metadata</h2>
            <div className="metadata-display">
              <pre>{JSON.stringify(material.metadata, null, 2)}</pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MaterialDetail;
