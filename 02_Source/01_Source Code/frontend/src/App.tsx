import { useEffect, useState } from 'react'
import './App.css'
import { type Material } from './types/Material'
import { fetchMaterials } from './services/materialService'

function App() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetchMaterials()
      .then(data => setMaterials(data))
      .catch(error => console.error('Error fetching materials:', error));
  }, []);

  return (
    <>
      <h1>Material List</h1>
      <div className="card">
        {materials.length === 0 ? (
          <p>No materials found or loading...</p>
        ) : (
          <table border={1} style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Part Number</th>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => (
                <tr key={mat.material_id}>
                  <td>{mat.material_id}</td>
                  <td>{mat.part_number}</td>
                  <td>{mat.material_name}</td>
                  <td>{mat.material_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default App
