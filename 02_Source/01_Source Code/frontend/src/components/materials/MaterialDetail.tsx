import React from 'react'
import { Material } from '../../types/Material'

type Props = {
  material: Material
  onClose?: () => void
}

const MaterialDetail: React.FC<Props> = ({ material, onClose }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>Material Detail</h3>
        <button onClick={onClose}>Close</button>
      </div>
      <dl>
        <dt>ID</dt>
        <dd>{material.material_id}</dd>
        <dt>Part Number</dt>
        <dd>{material.part_number}</dd>
        <dt>Name</dt>
        <dd>{material.material_name}</dd>
        <dt>Type</dt>
        <dd>{material.material_type}</dd>
        <dt>Storage</dt>
        <dd>{material.storage_conditions || '-'}</dd>
        <dt>Spec</dt>
        <dd>{material.specification_document || '-'}</dd>
        <dt>Created</dt>
        <dd>{new Date(material.created_date).toLocaleString()}</dd>
      </dl>
    </div>
  )
}

export default MaterialDetail
