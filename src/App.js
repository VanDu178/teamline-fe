import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ToastContainer } from "react-toastify";
import { initSoundPlayer } from "./utils/soundPlayer";
import AppRoutes from "./routes";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <ChatProvider>
      <NotificationProvider>
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
      </NotificationProvider>
    </ChatProvider>
  );
}

export default App;
