import React, { useEffect, useState } from 'react'
import { type Material } from '../../types/Material'
import { fetchMaterials } from '../../services/materialService'
import MaterialDetail from './MaterialDetail'

type Props = {
  onSelect?: (m: Material) => void
}

const MaterialList: React.FC<Props> = ({ onSelect }) => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [selected, setSelected] = useState<Material | null>(null)

  useEffect(() => {
    fetchMaterials().then(setMaterials).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Materials</h2>
      <table style={{ width: '100%', textAlign: 'left' }} border={1}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Part Number</th>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m: Material) => (
            <tr key={m._id} onClick={() => { setSelected(m); onSelect?.(m) }} style={{ cursor: 'pointer' }}>
              <td>{m.material_id}</td>
              <td>{m.part_number}</td>
              <td>{m.material_name}</td>
              <td>{m.material_type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div style={{ marginTop: 16 }}>
          <MaterialDetail material={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  )
}

export default MaterialList
