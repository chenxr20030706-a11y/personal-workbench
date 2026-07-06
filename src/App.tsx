import { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Home from "@/pages/Home";
import Research from "@/pages/Research";
import Reading from "@/pages/Reading";
import Media from "@/pages/Media";
import Career from "@/pages/Career";
import Ielts from "@/pages/Ielts";
import Health from "@/pages/Health";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import { useAuthStore } from "@/store/useAuthStore";
import { Sparkles } from "lucide-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-lavender-100">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-dream-blue-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/media" element={<Media />} />
          <Route path="/career" element={<Career />} />
          <Route path="/ielts" element={<Ielts />} />
          <Route path="/health" element={<Health />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
