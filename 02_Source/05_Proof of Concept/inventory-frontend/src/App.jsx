import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useKeycloak } from '@react-keycloak/web'

function App() {
  const [count, setCount] = useState(0)
  const { keycloak, initialized } = useKeycloak()

  // Khi Keycloak sẵn sàng và user đã authenticated, thực hiện các việc sau:
  // 1) Lưu access token và id token vào sessionStorage để frontend có thể lấy token gửi kèm
  //    Authorization header khi gọi API.
  // 2) Thiết lập một timer định kỳ để gọi `keycloak.updateToken(30)` nhằm refresh token nếu
  //    token sắp hết hạn (đảm bảo token còn ít nhất 30s). Nếu refresh thành công, cập nhật
  //    token mới vào sessionStorage.
  // 3) Nếu user logout hoặc chưa authenticated thì xóa token khỏi sessionStorage.
  //
  // Lưu ý bảo mật: lưu token trong sessionStorage có thể bị tấn công theo kiểu XSS. Trong môi
  // trường production, cân nhắc dùng cookie HttpOnly (do backend set) hoặc cơ chế token rotation
  // để tăng cường an ninh.
  useEffect(() => {
    if (!initialized || !keycloak) return

    let refreshTimer

    // Hàm lưu token vào sessionStorage (chỉ lưu khi token tồn tại)
    const saveTokens = () => {
      if (keycloak.token) sessionStorage.setItem('access_token', keycloak.token)
      if (keycloak.idToken) sessionStorage.setItem('id_token', keycloak.idToken)
    }

    // Hàm xóa token khỏi sessionStorage (gọi khi logout hoặc chưa authenticated)
    const clearTokens = () => {
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('id_token')
    }

    if (keycloak.authenticated) {
      // Khi đã authenticated, lưu token và bắt đầu vòng refresh định kỳ
      saveTokens()

      // Thiết lập refresh timer: mỗi 60s gọi updateToken(30)
      // updateToken(30) sẽ cố gắng refresh token nếu thời gian còn lại < 30s
      refreshTimer = setInterval(() => {
        keycloak
          .updateToken(30)
          .then((refreshed) => {
            // Nếu token được refresh (refreshed === true), cập nhật token mới vào storage
            if (refreshed) saveTokens()
          })
          .catch((err) => {
            // Ghi log lỗi; nếu fail có thể yêu cầu user đăng nhập lại tùy chính sách app
            console.error('Failed to refresh token', err)
            keycloak.login()
          })
      }, 60 * 1000)
    } else {
      // Nếu chưa authenticated, đảm bảo token đã được xóa
      clearTokens()
    }

    return () => {
      if (refreshTimer) clearInterval(refreshTimer)
    }
  }, [initialized, keycloak])

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
