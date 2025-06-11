import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from './contexts/ChatContext';

import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
