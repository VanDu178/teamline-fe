import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
