import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

// App component serving standard and admin-guarded routes
function App() {
  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes />
    </>
  );
}

export default App;