import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Lenis from "lenis";
import "./i18n";
import FarmerPage from "./pages/FarmerPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import BuyerPage from "./pages/BuyerPage";
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

// Views: "landing" | "login" | "farmer" | "admin" | "buyer"
export default function App() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(() => i18n.resolvedLanguage || i18n.language || "en");

  useEffect(() => {
    const handleLanguageChanged = (nextLanguage) => setLanguage(nextLanguage || "en");
    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, [i18n]);

  // Initialize view from sessionStorage, ensuring dashboards have a valid session
  const [view, setView] = useState(() => {
    const savedView = sessionStorage.getItem("krishak-mitra-view");
    let initialSession = null;
    try {
      initialSession = JSON.parse(localStorage.getItem("krishak-mitra-session") || "null");
    } catch {}

    if (savedView && ["farmer", "admin", "buyer"].includes(savedView)) {
      if (initialSession) {
        const expectedView = initialSession.role === "admin" ? "admin" : initialSession.role === "buyer" ? "buyer" : "farmer";
        if (expectedView === savedView) return savedView;
      }
      return "landing";
    }
    return savedView || "landing";
  });

  useEffect(() => {
    sessionStorage.setItem("krishak-mitra-view", view);
  }, [view]);

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
    setView("landing");
    localStorage.removeItem("krishak-mitra-session");
    localStorage.removeItem("krishak-mitra-booking");
    sessionStorage.removeItem("krishak-mitra-view");
    sessionStorage.removeItem("krishak-mitra-farmer-tab");
    sessionStorage.removeItem("krishak-mitra-admin-tab");
    sessionStorage.removeItem("krishak-mitra-buyer-tab");
  };

  const handleLogin = (role, mobile, farmerId, buyerId, name) => {
    const next = { role, mobile, farmerId, buyerId, name };
    setSession(next);
    setView(role === "admin" ? "admin" : role === "buyer" ? "buyer" : "farmer");
    localStorage.setItem("krishak-mitra-session", JSON.stringify(next));
  };

  // Always let the user choose a dashboard explicitly from the landing page.
  const handleNavigateLogin = () => {
    if (session) {
      // Already logged in  go straight to their dashboard
      setView(session.role === "admin" ? "admin" : session.role === "buyer" ? "buyer" : "farmer");
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
          language={language}
          onLanguageChange={changeLanguage}
        />
      )}

      {view === "contact" && (
        <ContactPage

          onBack={() => setView("landing")}
          language={language}
          onLanguageChange={changeLanguage}
        />
      )}



      {view === "login" && (
        <LoginPage
          language={language}
          onLanguageChange={changeLanguage}
          t={t}
          onBack={() => setView("landing")}
          onLogin={handleLogin}
        />
      )}

      {view === "farmer" && <FarmerPage language={language} onLanguageChange={changeLanguage} onLogout={logout} onHome={() => setView("landing")} farmerId={session?.farmerId} farmerName={session?.name} />}
      {view === "admin" && <AdminPage language={language} onLanguageChange={changeLanguage} onLogout={logout} onHome={() => setView("landing")} adminName={session?.name} />}
      {view === "buyer" && <BuyerPage language={language} onLanguageChange={changeLanguage} onLogout={logout} onHome={() => setView("landing")} buyerId={session?.buyerId || "demo-buyer"} buyerName={session?.name} />}
    </SmoothScroll>
  );
}