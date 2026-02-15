import { useEffect, useState } from 'react'
import './App.css'

interface Material {
  material_id: string;
  material_name: string;
  part_number: string;
  material_type: string;
}

function App() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/materials`)
      .then(response => response.json())
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
