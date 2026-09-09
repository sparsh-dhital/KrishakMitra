import { useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import LanguagePicker from "../components/LanguagePicker";
import Logo from "../components/Logo";

const countryOptions = [
  { code: "+91", name: "India", digits: 10 },
  { code: "+1", name: "USA / Canada", digits: 10 },
  { code: "+44", name: "United Kingdom", digits: 10 },
  { code: "+61", name: "Australia", digits: 9 },
  { code: "+971", name: "UAE", digits: 9 },
  { code: "+65", name: "Singapore", digits: 8 },
];

export default function ProfilePage({ onBack, language, onLanguageChange, profileId, displayName, roleLabel }) {
  const storageKey = `krishak-mitra-profile-${profileId}`;
  const [kycOpen, setKycOpen] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null") || {
        fullName: displayName,
        countryCode: "+91",
        phone: "",
        email: "",
        avatar: "",
        kycStatus: "Not submitted",
        kycDocument: "",
        kycDocumentType: "",
        kycDocumentNumber: "",
        kycDateOfBirth: "",
        kycGender: "",
        kycAddress: "",
        kycConsent: false,
      };
    } catch {
      return { fullName: displayName, countryCode: "+91", phone: "", email: "", avatar: "", kycStatus: "Not submitted", kycDocument: "", kycDocumentType: "", kycDocumentNumber: "", kycDateOfBirth: "", kycGender: "", kycAddress: "", kycConsent: false };
    }
  });

  function update(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function selectAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("avatar", reader.result);
    reader.readAsDataURL(file);
  }

  function selectKycDocument(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    update("kycDocument", file.name);
    update("kycStatus", "Document attached - ready to submit");
    const reader = new FileReader();
    reader.onload = () => update("kycDocumentData", reader.result);
    reader.readAsDataURL(file);
  }

  function saveProfile(event) {
    event.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(profile));
    toast.success("Profile saved successfully.");
  }

  function submitKyc() {
    const requiredFields = ["kycDocumentType", "kycDocumentNumber", "kycDateOfBirth", "kycGender", "kycAddress", "kycDocument"];
    if (requiredFields.some((field) => !profile[field]?.trim?.() && profile[field] !== true) || !profile.kycConsent) {
      toast.error("Complete all KYC details, attach a document, and accept the declaration.");
      return;
    }
    const next = { ...profile, kycStatus: "Submitted for review" };
    setProfile(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    toast.success("KYC submitted for admin review.");
  }

  return (
    <div className="min-h-screen bg-cream text-forest">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4"><button onClick={onBack} className="w-10 h-10 rounded-full border border-line bg-white flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button><Logo variant="full" className="h-9" /></div>
        <LanguagePicker value={language} onChange={onLanguageChange} />
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div><p className="text-sm font-bold uppercase tracking-widest text-brand">{roleLabel}</p><h1 className="font-display text-3xl font-extrabold mt-2">Profile & KYC Verification</h1><p className="text-muted mt-2">Keep your account details current and submit identity information for review.</p></div>
        <form onSubmit={saveProfile} className="bg-white border border-line rounded-3xl p-6 sm:p-10 space-y-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-5">
            <label className="group relative w-24 h-24 rounded-full bg-brand/10 text-brand flex items-center justify-center overflow-hidden cursor-pointer border-2 border-transparent hover:border-brand transition-colors" title="Click to update profile picture">
              {profile.avatar ? <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-2xl font-extrabold">{profile.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>}
              <span className="absolute inset-0 bg-forest/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-6 h-6" /></span>
              <input type="file" accept="image/*" onChange={selectAvatar} className="hidden" />
            </label>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-line font-bold text-sm cursor-pointer hover:bg-brand/5 hover:border-brand"><Camera className="w-4 h-4 text-brand" /> Update profile picture<input type="file" accept="image/*" onChange={selectAvatar} className="hidden" /></label>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="text-sm font-bold">Full name<input required value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal" /></label>
            <label className="text-sm font-bold">Role<input value={roleLabel} readOnly className="mt-2 w-full rounded-xl border border-line bg-slate-50 px-4 py-3 font-normal" /></label>
            <label className="text-sm font-bold">Phone number<div className="mt-2 flex gap-2"><div className="relative w-20 shrink-0"><button type="button" onClick={() => setCountryMenuOpen((open) => !open)} className="w-full h-full min-h-12 rounded-xl border border-line bg-brand/5 text-brand px-2 flex items-center justify-center gap-1 font-bold focus:outline-none focus:ring-2 focus:ring-brand/20" aria-label="Select country code" aria-expanded={countryMenuOpen}>{profile.countryCode || "+91"}<ChevronDown className="w-4 h-4" /></button>{countryMenuOpen && <div className="absolute z-30 top-full left-0 mt-2 w-56 rounded-xl border border-line bg-white shadow-xl overflow-hidden">{countryOptions.map((country) => <button key={country.code} type="button" onClick={() => { update("countryCode", country.code); update("phone", ""); setCountryMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-sm font-semibold text-forest hover:bg-brand/5 hover:text-brand">{country.name} ({country.code})</button>)}</div>}</div><input value={profile.phone} onChange={(e) => { const country = countryOptions.find((item) => item.code === (profile.countryCode || "+91")); update("phone", e.target.value.replace(/\D/g, "").slice(0, country.digits)); setCountryMenuOpen(false); }} inputMode="numeric" maxLength={countryOptions.find((item) => item.code === (profile.countryCode || "+91")).digits} placeholder={"0".repeat(countryOptions.find((item) => item.code === (profile.countryCode || "+91")).digits)} className="min-w-0 flex-1 rounded-xl border border-line px-4 py-3 font-normal focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" /></div><span className="block text-xs text-muted mt-1">{countryOptions.find((item) => item.code === (profile.countryCode || "+91")).name}: {countryOptions.find((item) => item.code === (profile.countryCode || "+91")).digits} digits</span></label>
            <label className="text-sm font-bold">Email<input type="email" pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" value={profile.email} onChange={(e) => update("email", e.target.value)} placeholder="name@example.com" className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" /><span className="block text-xs text-muted mt-1">Format: name@example.com</span></label>
          </div>
          <button type="submit" className="rounded-xl bg-forest text-white px-6 py-3 font-bold">Save profile details</button>
        </form>
        <section className="bg-white border border-line rounded-3xl p-6 sm:p-10 shadow-sm space-y-5">
          <div className="flex items-start gap-4"><div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div><div><h2 className="text-xl font-display font-extrabold">KYC verification</h2><p className="text-sm text-muted mt-1">Complete these required identity details before using buying, selling, or procurement actions.</p></div></div>
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-4"><p className="font-bold text-sm">Current status</p><p className="text-sm text-muted mt-1">{profile.kycStatus}</p></div>
          <button type="button" onClick={() => setKycOpen((open) => !open)} className="rounded-xl bg-brand text-white px-6 py-3 font-bold shadow-sm hover:bg-brand-hover">{kycOpen ? "Hide KYC details" : profile.kycStatus === "Not submitted" ? "Verify KYC" : "View / update KYC details"}</button>
        </section>
        {kycOpen && <section className="bg-white border border-brand/30 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div><h2 className="text-xl font-display font-extrabold">KYC details</h2><p className="text-sm text-muted mt-1">Enter the details exactly as shown on your identity document.</p></div>
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="text-sm font-bold">Document type<select value={profile.kycDocumentType} onChange={(e) => update("kycDocumentType", e.target.value)} className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal bg-white"><option value="">Select document</option><option value="Aadhaar Card">Aadhaar Card</option><option value="PAN Card">PAN Card</option><option value="Voter ID">Voter ID</option><option value="Driving Licence">Driving Licence</option><option value="Passport">Passport</option></select></label>
            <label className="text-sm font-bold">Document number<input value={profile.kycDocumentNumber} onChange={(e) => update("kycDocumentNumber", e.target.value.toUpperCase().slice(0, 20))} placeholder="Enter document number" className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal" /></label>
            <label className="text-sm font-bold">Date of birth<input type="date" value={profile.kycDateOfBirth} onChange={(e) => update("kycDateOfBirth", e.target.value)} className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal" /></label>
            <label className="text-sm font-bold">Gender<select value={profile.kycGender} onChange={(e) => update("kycGender", e.target.value)} className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal bg-white"><option value="">Select gender</option><option value="Female">Female</option><option value="Male">Male</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option></select></label>
          </div>
          <label className="block text-sm font-bold">KYC address<textarea required rows="2" value={profile.kycAddress} onChange={(e) => update("kycAddress", e.target.value)} placeholder="House/Flat, Street, Area, City, State, PIN code" className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none resize-y" /><span className="block text-xs text-muted mt-1">Format: House/Flat, Street, Area, City, State, PIN code.</span></label>
          <label className="block text-sm font-bold">Identity document<input type="file" accept="image/*,.pdf" onChange={selectKycDocument} className="mt-2 block w-full text-sm" /><span className="block text-xs text-muted mt-2">Accepted: Aadhaar, PAN, voter ID, driving licence, or passport image/PDF.</span></label>
          {profile.kycDocument && <p className="text-sm text-brand font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Attached: {profile.kycDocument}</p>}
          <label className="flex items-start gap-3 text-sm text-muted"><input type="checkbox" checked={profile.kycConsent} onChange={(e) => update("kycConsent", e.target.checked)} className="mt-1 accent-brand" /> I confirm that these details belong to me and the uploaded document is authentic.</label>
          <button type="button" onClick={submitKyc} className="rounded-xl bg-brand text-white px-6 py-3 font-bold shadow-sm hover:bg-brand-hover">Submit KYC for verification</button>
        </section>}
      </main>
    </div>
  );
}
