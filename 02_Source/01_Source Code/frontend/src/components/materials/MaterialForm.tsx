import React, { useState } from 'react'
import { Material } from '../../types/Material'

type Props = {
  initial?: Partial<Material>
  onSubmit: (values: Partial<Material>) => void
  submitLabel?: string
}

const MaterialForm: React.FC<Props> = ({ initial = {}, onSubmit, submitLabel = 'Save' }) => {
  const [values, setValues] = useState<Partial<Material>>(initial)

  const change = (k: keyof Material, v: any) => setValues(prev => ({ ...prev, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(values) }}>
      <div>
        <label>Part Number</label>
        <input value={values.part_number || ''} onChange={e => change('part_number', e.target.value)} />
      </div>
      <div>
        <label>Name</label>
        <input value={values.material_name || ''} onChange={e => change('material_name', e.target.value)} />
      </div>
      <div>
        <label>Type</label>
        <input value={values.material_type || ''} onChange={e => change('material_type', e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  )
}

export default MaterialForm
