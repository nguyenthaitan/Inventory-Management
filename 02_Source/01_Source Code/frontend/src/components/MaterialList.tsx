/**
 * MaterialList Component
 * Displays paginated list of materials with pagination controls
 */

import React, { useMemo } from "react";
import type { Material, MaterialType } from "../types/Material";
import { useMaterialList } from "../hooks";
import "./MaterialList.css";

interface MaterialListProps {
  onSelectMaterial?: (material: Material) => void;
  highlightType?: MaterialType;
}

export const MaterialList: React.FC<MaterialListProps> = ({
  onSelectMaterial,
  highlightType,
}) => {
  const {
    materials,
    total,
    page,
    limit,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    setLimit,
    refetch,
  } = useMaterialList();

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  if (error) {
    return (
      <div className="material-list error">
        <div className="error-message">
          <h3>Failed to load materials</h3>
          <p>{error.message}</p>
          <button onClick={refetch}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="material-list">
      <div className="list-header">
        <h2>Materials</h2>
        <div className="list-info">
          Total: <strong>{total}</strong> | Showing{" "}
          {Math.min(limit, materials.length)} of {total}
        </div>
      </div>

      {loading && materials.length === 0 ? (
        <div className="loading">
          <p>Loading materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="empty-state">
          <p>No materials found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="material-table">
              <thead>
                <tr>
                  <th>Material ID</th>
                  <th>Material Name</th>
                  <th>Part Number</th>
                  <th>Type</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr
                    key={material._id}
                    className={
                      highlightType && material.material_type === highlightType
                        ? "highlight"
                        : ""
                    }
                  >
                    <td>
                      <code>{material.material_id}</code>
                    </td>
                    <td>{material.material_name}</td>
                    <td>{material.part_number}</td>
                    <td>
                      <span className="badge">{material.material_type}</span>
                    </td>
                    <td>
                      {new Date(material.created_date).toLocaleDateString()}
                    </td>
                    <td>
                      {onSelectMaterial && (
                        <button
                          className="btn-view"
                          onClick={() => onSelectMaterial(material)}
                          title="View details"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="list-footer">
            <div className="limit-control">
              <label htmlFor="limit-select">Items per page:</label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                disabled={loading}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="pagination">
              <button
                onClick={previousPage}
                disabled={!hasPreviousPage || loading}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <button onClick={nextPage} disabled={!hasNextPage || loading}>
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaterialList;
