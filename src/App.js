import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </ThemeProvider>
  );
}

export default App;
