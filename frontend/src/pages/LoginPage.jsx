import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Building2 } from "lucide-react";
import { Button, Input, Card } from "../components/ui";
import Logo from "../components/Logo";
import LanguagePicker from "../components/LanguagePicker";

export default function LoginPage({
  onBack,
  onLogin,
  t,
  language,
  onLanguageChange,
}) {
  const [role, setRole] = useState("farmer");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expectedOtp, setExpectedOtp] = useState("");

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10 || !name.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const nextOtp = "123456";
      setExpectedOtp(nextOtp);
      toast.success(`Demo OTP: ${nextOtp}`);
      setStep(2);
    }, 800);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 6 || otp !== expectedOtp) {
      toast.error("Enter the OTP sent to your mobile number");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onLogin(
        role,
        mobile,
        role === "farmer" ? "12f3b7f6-5999-45e7-8811-3fd982a25345" : null,
        role === "buyer" ? `buyer-${mobile}` : null,
        name.trim(),
      );
    }, 800);
  };

  const handleDemoLogin = () => {
    const demoName =
      name.trim() || (role === "farmer" ? "Ramesh Kumar" : "Guest");
    onLogin(
      role,
      "9876543210",
      role === "farmer" ? "12f3b7f6-5999-45e7-8811-3fd982a25345" : null,
      role === "buyer" ? "demo-buyer" : null,
      demoName,
    );
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 sm:p-6 selection:bg-brand selection:text-white">
      <div className="fixed top-3 right-3 z-50 sm:top-4 sm:right-4">
        <LanguagePicker value={language} onChange={onLanguageChange} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full min-w-0 max-w-md"
      >
        <Button variant="ghost" className="mb-6 gap-2" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>

        <Card className="shadow-xl shadow-brand/5 border-line p-5 sm:p-10">
          <div className="flex flex-col items-center mb-6">
            <Logo variant="stacked" className="mb-1" />
            <p className="text-sm text-muted font-medium text-center mt-2">
              Access your procurement dashboard
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => {
                setRole("farmer");
                setStep(1);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                role === "farmer"
                  ? "bg-white text-forest shadow-sm"
                  : "text-muted hover:text-forest"
              }`}
            >
              Farmer
            </button>
            <button
              onClick={() => {
                setRole("admin");
                setStep(1);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                role === "admin"
                  ? "bg-white text-forest shadow-sm"
                  : "text-muted hover:text-forest"
              }`}
            >
              Officer (Admin)
            </button>
            <button
              onClick={() => {
                setRole("buyer");
                setStep(1);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                role === "buyer"
                  ? "bg-white text-forest shadow-sm"
                  : "text-muted hover:text-forest"
              }`}
            >
              Buyer / Institution
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">
                    Mobile Number
                  </label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="Enter 10-digit number"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={mobile.length < 10 || !name.trim() || isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Get OTP"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">
                    Enter 6-digit OTP
                  </label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="     "
                    className="tracking-[0.5em] font-display text-center text-xl"
                    autoFocus
                    required
                  />
                  <p className="text-xs font-medium text-muted mt-3 text-center">
                    Sent to +91 {mobile}.{" "}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-brand font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={otp.length < 6 || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-line">
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed border-2 h-12"
              onClick={handleDemoLogin}
            >
              {role === "buyer" ? (
                <Building2 className="w-5 h-5 text-brand" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-brand" />
              )}{" "}
              Bypass for Demo
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
