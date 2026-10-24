import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/common/AppShell";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AuthPage } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { NewTrip } from "./pages/NewTrip";
import { ProfilePage } from "./pages/Profile";
import { TripDetail } from "./pages/TripDetail";
import { HistoryPage } from "./pages/History";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="trips/new" element={<NewTrip />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

