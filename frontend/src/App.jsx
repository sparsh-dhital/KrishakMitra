import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Lenis from "lenis";
import "./i18n";
import FarmerPage from "./pages/FarmerPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ContactPage from "./pages/ContactPage";

function SmoothScroll({ children }) {
  useEffect(() => {
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

// Views: "landing" | "login" | "farmer" | "admin"
export default function App() {
  const { t, i18n } = useTranslation();

  // Always start at the landing page regardless of any saved session
  const [view, setView] = useState("landing");

  // Load persisted session but DON'T auto-navigate into dashboard
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("krishak-mitra-session") || "null");
    } catch {
      return null;
    }
  });

  const changeLanguage = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("krishak-mitra-language", nextLanguage);
  };

  const logout = () => {
    setSession(null);
    setView("landing");
    localStorage.removeItem("krishak-mitra-session");
    localStorage.removeItem("krishak-mitra-booking");
  };

  const handleLogin = (role, mobile, farmerId) => {
    const next = { role, mobile, farmerId };
    setSession(next);
    setView(role === "admin" ? "admin" : "farmer");
    localStorage.setItem("krishak-mitra-session", JSON.stringify(next));
  };

  // If user already has a session and clicks "Go to Dashboard" on landing page
  const handleNavigateLogin = () => {
    if (session) {
      // Already logged in — go straight to their dashboard
      setView(session.role === "admin" ? "admin" : "farmer");
    } else {
      setView("login");
    }
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

      {view === "landing" && (
        <LandingPage
          onNavigateLogin={handleNavigateLogin}
          onNavigateContact={() => setView("contact")}
          hasSession={!!session}
          language={i18n.language}
          onLanguageChange={changeLanguage}
        />
      )}

      {view === "contact" && (
        <ContactPage
          language={i18n.language}
          onLanguageChange={changeLanguage}
          onBack={() => setView("landing")}
        />
      )}

      {view === "login" && (
        <LoginPage
          language={i18n.language}
          onLanguageChange={changeLanguage}
          t={t}
          onBack={() => setView("landing")}
          onLogin={handleLogin}
        />
      )}

      {view === "farmer" && (
        <FarmerPage
          language={i18n.language}
          onLanguageChange={changeLanguage}
          onLogout={logout}
          t={t}
        />
      )}

      {view === "admin" && (
        <AdminPage
          language={i18n.language}
          onLanguageChange={changeLanguage}
          onLogout={logout}
          t={t}
        />
      )}
    </SmoothScroll>
  );
}