import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <ChatProvider>
      <div className="App">
        <AuthProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    </ChatProvider>
  );
}

export default App;
