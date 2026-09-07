import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./i18n";
import FarmerPage from "./pages/FarmerPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState("farmer");
  const [session, setSession] = useState(() =>
    JSON.parse(localStorage.getItem("krishak-mitra-session") || "null"),
  );

  const changeLanguage = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("krishak-mitra-language", nextLanguage);
  };

  if (!session) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginPage
          language={i18n.language}
          onLanguageChange={changeLanguage}
          t={t}
          onLogin={(role, mobile, farmerId) => {
            const next = { role, mobile, farmerId };
            setSession(next);
            setView(role);
            localStorage.setItem("krishak-mitra-session", JSON.stringify(next));
          }}
        />
      </>
    );
  }

  const logout = () => {
    setSession(null);
    localStorage.removeItem("krishak-mitra-session");
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#173f3a",
            color: "#fff",
            fontSize: "14px",
            borderRadius: "8px",
          },
          success: {
            iconTheme: { primary: "#ed7348", secondary: "#fff" },
          },
        }}
      />
      {view === "farmer" && session.role === "farmer" ? (
        <FarmerPage
          language={i18n.language}
          onLanguageChange={changeLanguage}
          onLogout={logout}
          t={t}
        />
      ) : (
        <AdminPage
          language={i18n.language}
          onLanguageChange={changeLanguage}
          onLogout={logout}
          t={t}
        />
      )}
    </>
  );
}