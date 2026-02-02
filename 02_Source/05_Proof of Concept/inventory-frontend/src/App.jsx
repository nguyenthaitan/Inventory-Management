import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useKeycloak } from '@react-keycloak/web'

function App() {
  const [count, setCount] = useState(0)
  const { keycloak, initialized } = useKeycloak()

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div style={{ marginBottom: 16 }}>
        {initialized ? (
          keycloak?.authenticated ? (
            <>
              <span>Signed in as: {keycloak?.tokenParsed?.preferred_username || keycloak.subject}</span>
              <button style={{ marginLeft: 8 }} onClick={() => keycloak.logout()}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => keycloak.login()}>Login</button>
          )
        ) : (
          <span>Initializing Keycloak...</span>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
