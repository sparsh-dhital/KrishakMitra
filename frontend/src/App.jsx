import { useState } from "react";
import { getTranslations } from "./i18n";
import FarmerPage from "./pages/FarmerPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [view, setView] = useState("farmer");
  const [session, setSession] = useState(() =>
    JSON.parse(localStorage.getItem("krishak-mitra-session") || "null"),
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("krishak-mitra-language") || "en",
  );
  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem("krishak-mitra-language", nextLanguage);
  };
  const t = getTranslations(language);
  if (!session) {
    return (
      <LoginPage
        language={language}
        onLanguageChange={changeLanguage}
        onLogin={(role, mobile) => {
          const next = { role, mobile };
          setSession(next);
          setView(role);
          localStorage.setItem("krishak-mitra-session", JSON.stringify(next));
        }}
      />
    );
  }
  const logout = () => {
    setSession(null);
    localStorage.removeItem("krishak-mitra-session");
  };
  return view === "farmer" && session.role === "farmer" ? (
    <FarmerPage
      language={language}
      onLanguageChange={changeLanguage}
      onLogout={logout}
      t={t}
    />
  ) : (
    <AdminPage
      language={language}
      onLanguageChange={changeLanguage}
      onLogout={logout}
      t={t}
    />
  );
}
