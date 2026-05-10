import { loginStudent } from "./api/authApi";

function App() {
  const testLogin = async () => {
    try {
      const res = await loginStudent({
        apogee: "A1234",
        password: "Password123!",
      });

      console.log("Backend response:", res);
      console.log("Token:", localStorage.getItem("accessToken"));
    } catch (error) {
      console.log("Erreur:", error);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Axios Backend</h1>
      <button onClick={testLogin}>Test Backend Login</button>
    </div>
  );
}

export default App;