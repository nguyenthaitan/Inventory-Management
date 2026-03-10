/**
 * MaterialList Component
 * Displays a list of materials with sorting, filtering, and pagination
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { materialService } from '../services/materialService';
import type { Material, MaterialQueryParams, MaterialType } from '../types/material';
import { MATERIAL_TYPE_OPTIONS, MATERIAL_TYPE_COLORS } from '../types/material';
import './MaterialList.css';

const MaterialList: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState<number>(20);

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<MaterialType | ''>('');

  // Sort state
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'material_name' | 'part_number'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, selectedType, sortBy, sortOrder]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: MaterialQueryParams = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.material_type = selectedType as MaterialType;

      const result = await materialService.getAllMaterials(params);

      setMaterials(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch materials');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMaterials();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await materialService.deleteMaterial(id);
      fetchMaterials();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getMaterialTypeColor = (type: MaterialType) => {
    return MATERIAL_TYPE_COLORS[type] || '#000';
  };

  if (loading && materials.length === 0) {
    return <div className="loading">Loading materials...</div>;
  }

  return (
    <div className="material-list-container">
      <div className="material-list-header">
        <h1>Materials</h1>
        <Link to="/materials/new" className="btn btn-primary">
          + Add Material
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <form onSubmit={handleSearch} className="search-filter-bar">
        <input
          type="text"
          placeholder="Search by name or part number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value as MaterialType | '');
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Types</option>
          {MATERIAL_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Results Info */}
      <div className="results-info">
        Showing {materials.length} of {total} materials
      </div>

      {/* Materials Table */}
      <div className="table-container">
        <table className="materials-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('part_number')} className="sortable">
                Part Number {sortBy === 'part_number' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('material_name')} className="sortable">
                Material Name {sortBy === 'material_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Type</th>
              <th>Storage Conditions</th>
              <th>Specification</th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material._id}>
                <td className="part-number">{material.part_number}</td>
                <td>
                  <Link to={`/materials/${material._id}`} className="material-link">
                    {material.material_name}
                  </Link>
                </td>
                <td>
                  <span
                    className="material-type-badge"
                    style={{ backgroundColor: getMaterialTypeColor(material.material_type) }}
                  >
                    {material.material_type}
                  </span>
                </td>
                <td>{material.storage_conditions || '-'}</td>
                <td>{material.specification_document || '-'}</td>
                <td>{new Date(material.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/materials/${material._id}/edit`} className="btn-icon btn-edit" title="Edit">
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleDelete(material._id)}
                    className="btn-icon btn-delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MaterialList;
