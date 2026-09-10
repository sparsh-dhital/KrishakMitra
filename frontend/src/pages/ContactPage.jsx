import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Phone, MapPin, Send, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import LanguagePicker from "../components/LanguagePicker";

const countryOptions = [
  { code: "+91", name: "India", digits: 10 },
  { code: "+1", name: "United States / Canada", digits: 10 },
  { code: "+44", name: "United Kingdom", digits: 10 },
  { code: "+61", name: "Australia", digits: 9 },
  { code: "+971", name: "United Arab Emirates", digits: 9 },
  { code: "+65", name: "Singapore", digits: 8 },
];

export default function ContactPage({ onBack, language, onLanguageChange }) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          full_name: formData.get("full_name"),
          country_code: selectedCountry.code,
          phone: formData.get("phone"),
          email: formData.get("email") || null,
          message: formData.get("message"),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.detail || "Unable to send your message.");
      }

      form.reset();
      setSubmitted(true);
      toast.success("Message received. Our KrishakMitra support team will contact you soon.");
    } catch (error) {
      const message = error.name === "AbortError"
        ? "The email service took too long to respond. Please start the backend and try again."
        : error.message || "Unable to send your message. Please try again.";
      toast.error(message);
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body text-forest selection:bg-brand selection:text-white flex flex-col">
      
      <header className="w-full py-6 px-6 max-w-7xl mx-auto flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-forest" />
          </button>
          <Logo variant="full" className="h-10 cursor-pointer" onClick={onBack} />
        </div>
        <LanguagePicker value={language} onChange={onLanguageChange} />
      </header>

      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid md:grid-cols-2 gap-16 items-start">
        
        <div>
          <div className="inline-flex items-center text-sm font-bold text-brand bg-brand/10 px-4 py-1.5 rounded-full mb-6">
<<<<<<< HEAD
            {t("contactTitle")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            {t("contactHeading")}
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-12 max-w-md">
            {t("contactIntro")}
=======
            {t("contact.getInTouch")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            {t("contact.title")}
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-12 max-w-md">
            {t("contact.description")}
>>>>>>> main
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center shadow-sm shrink-0">
                <Phone className="w-6 h-6 text-brand" />
              </div>
              <div>
<<<<<<< HEAD
                <h3 className="font-bold text-lg mb-1">{t("callUs")}</h3>
=======
                <h3 className="font-bold text-lg mb-1">{t("contact.callUs")}</h3>
>>>>>>> main
                <p className="text-muted">1800-123-4567</p>
                <p className="text-sm text-muted/70 mt-1">{t("contact.hours")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center shadow-sm shrink-0">
                <Mail className="w-6 h-6 text-brand" />
              </div>
              <div>
<<<<<<< HEAD
                <h3 className="font-bold text-lg mb-1">{t("emailSupport")}</h3>
=======
                <h3 className="font-bold text-lg mb-1">{t("contact.emailSupport")}</h3>
>>>>>>> main
                <p className="text-muted">support@krishakmitra.gov.in</p>
                <p className="text-sm text-muted/70 mt-1">{t("contact.replyTime")}</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center shadow-sm shrink-0">
                <MapPin className="w-6 h-6 text-brand" />
              </div>
              <div>
<<<<<<< HEAD
                <h3 className="font-bold text-lg mb-1">{t("headOffice")}</h3>
=======
                <h3 className="font-bold text-lg mb-1">{t("contact.headOffice")}</h3>
>>>>>>> main
                <p className="text-muted">Ministry of Agriculture</p>
                <p className="text-sm text-muted/70 mt-1">Krishi Bhawan, New Delhi, 110001</p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-line">
<<<<<<< HEAD
          <h2 className="text-2xl font-bold mb-8">{t("sendMessage")}</h2>
=======
          <h2 className="text-2xl font-bold mb-8">{t("contact.sendMessage")}</h2>
>>>>>>> main
          <form
            onSubmit={handleSubmit}
            onFocusCapture={(event) => {
              if (!event.target.closest("[data-country-picker]")) {
                setIsCountryMenuOpen(false);
              }
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold mb-2">{t("login.fullName")}</label>
              <input 
                type="text" 
                name="full_name"
                required
                placeholder="E.g. Ramesh Kumar"
                className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">{t("contact.phoneNumber")}</label>
                <div className="flex gap-2">
                  <div className="relative w-20 shrink-0" data-country-picker>
                    <button
                      type="button"
                      onClick={() => setIsCountryMenuOpen((open) => !open)}
                      aria-label="Select country code"
                      aria-expanded={isCountryMenuOpen}
                      className="w-full px-2 py-3.5 bg-[#F8F9FA] border border-line rounded-xl flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    >
                      <span>{selectedCountry.code}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isCountryMenuOpen && (
                      <div className="absolute z-20 left-0 top-full mt-2 w-56 bg-white border border-line rounded-xl shadow-lg overflow-hidden">
                        {countryOptions.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setIsCountryMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-[#F8F9FA] transition-colors"
                          >
                            {country.name} ({country.code})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    minLength={selectedCountry.digits}
                    maxLength={selectedCountry.digits}
                    pattern={`[0-9]{${selectedCountry.digits}}`}
                    inputMode="numeric"
                    onInput={(event) => {
                      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, selectedCountry.digits);
                      setIsCountryMenuOpen(false);
                    }}
                    placeholder={"0".repeat(selectedCountry.digits)}
                    className="min-w-0 flex-1 px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
                <p className="text-xs text-muted mt-2">Enter {selectedCountry.digits} digits.</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">{t("contact.emailAddress")}</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="(Optional)"
                  className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">{t("contact.message")}</label>
              <textarea 
                name="message"
                required
                rows="4"
                placeholder="How can we help you?"
                className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-forest text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-forest-dark transition-colors shadow-lg"
            >
              {isSubmitting ? "Sending..." : "Send Message"} <Send className="w-5 h-5" />
            </button>
            {submitted && (
              <p className="text-sm font-semibold text-brand" role="status">
                Your message was sent. Our support team will contact you soon.
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
