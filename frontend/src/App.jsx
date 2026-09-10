import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Lenis from "lenis";
import "./i18n";
import FarmerPage from "./pages/FarmerPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import BuyerPage from "./pages/BuyerPage";
import BuyerMarketplace from "./pages/BuyerMarketplace";
import ContactPage from "./pages/ContactPage";
import StatusPage from "./pages/StatusPage";

function SmoothScroll({ children }) {
  useEffect(() => {
    // Disable Lenis on touch devices to prevent it from hijacking touch events
    // and causing input focus issues on mobile.
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => i18n.resolvedLanguage || i18n.language || "en");

  useEffect(() => {
    const handleLanguageChanged = (nextLanguage) => setLanguage(nextLanguage || "en");
    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, [i18n]);

  // Load persisted session
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("krishak-mitra-session") || "null");
    } catch {
      return null;
    }
  });

  const changeLanguage = (nextLanguage) => {
    if (!nextLanguage || nextLanguage === language) return;
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("krishak-mitra-language", nextLanguage);
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("krishak-mitra-session");
    localStorage.removeItem("krishak-mitra-booking");
    sessionStorage.removeItem("krishak-mitra-view");
    sessionStorage.removeItem("krishak-mitra-farmer-tab");
    sessionStorage.removeItem("krishak-mitra-admin-tab");
    sessionStorage.removeItem("krishak-mitra-buyer-tab");
    navigate("/");
  };

  const handleLogin = (role, mobile, farmerId, buyerId, name) => {
    const next = { role, mobile, farmerId, buyerId, name };
    setSession(next);
    localStorage.setItem("krishak-mitra-session", JSON.stringify(next));
    navigate(`/${role}`);
  };

  const handleNavigateLogin = () => {
    if (session) {
      navigate(`/${session.role}`);
    } else {
      navigate("/login");
    }
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!session) return <Navigate to="/login" replace />;
    if (allowedRole && session.role !== allowedRole) {
      return <Navigate to={`/${session.role}`} replace />;
    }
    return children;
  };

  return (
    <SmoothScroll>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#0A2A1B",
            color: "#fff",
            fontSize: "14px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            fontWeight: 600,
          },
          success: {
            iconTheme: { primary: "#187948", secondary: "#fff" },
          },
        }}
      />

      <Routes>
        <Route path="/" element={
          <LandingPage
            onNavigateLogin={handleNavigateLogin}
            onNavigateContact={() => navigate("/contact")}
            hasSession={!!session}
            language={language}
            onLanguageChange={changeLanguage}
          />
        } />

        <Route path="/contact" element={
          <ContactPage
            onBack={() => navigate("/")}
            language={language}
            onLanguageChange={changeLanguage}
          />
        } />

        <Route path="/status/:tokenId" element={<StatusPage />} />

        <Route path="/login" element={
          <LoginPage
            language={language}
            onLanguageChange={changeLanguage}
            t={t}
            onBack={() => navigate("/")}
            onLogin={handleLogin}
          />
        } />

        <Route path="/farmer" element={
          <ProtectedRoute allowedRole="farmer">
            <FarmerPage language={language} onLanguageChange={changeLanguage} onLogout={logout} onHome={() => navigate("/")} farmerId={session?.farmerId} farmerName={session?.name} />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminPage language={language} onLanguageChange={changeLanguage} onLogout={logout} onHome={() => navigate("/")} adminName={session?.name} />
          </ProtectedRoute>
        } />

        <Route path="/buyer" element={
          <ProtectedRoute allowedRole="buyer">
            <BuyerPage language={language} onLanguageChange={changeLanguage} onLogout={logout} onHome={() => navigate("/")} buyerId={session?.buyerId || "demo-buyer"} buyerName={session?.name} />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SmoothScroll>
  );
}