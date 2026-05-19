import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WorkoutPage from "./pages/WorkoutPage";
import HistoryPage from "./pages/HistoryPage";
import CalendarPage from "./pages/CalendarPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workout/:dayType" element={<WorkoutPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
