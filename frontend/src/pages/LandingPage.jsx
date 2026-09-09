import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  ArrowRight, 
  Play, 
  Star, 
  Clock, 
  MapPin, 
  Zap, 
  Check, 
  CreditCard,
  ShieldCheck,
  TrendingDown,
  Heart,
  Award,
  User,
  CheckCircle2,
  Phone,
  Activity,
  Leaf
} from "lucide-react";
import Logo from "../components/Logo";
import LanguagePicker from "../components/LanguagePicker";

export default function LandingPage({ onNavigateLogin, onNavigateContact, hasSession, language, onLanguageChange }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body text-forest selection:bg-brand selection:text-white">
      {/* Navbar */}
      <header className="w-full py-4 px-4 sm:py-6 sm:px-6 max-w-7xl mx-auto flex items-center justify-between gap-3">
        <Logo variant="full" className="h-14" />
        <nav className="hidden md:flex items-center gap-10 text-base font-semibold">
          <a href="#features" className="hover:text-brand transition-colors">{t("landingFeatures")}</a>
          <a href="#how-it-works" className="hover:text-brand transition-colors">{t("landingHow")}</a>
          <a href="#impact" className="hover:text-brand transition-colors">{t("landingImpact")}</a>
          <a href="#testimonials" className="hover:text-brand transition-colors">{t("landingTestimonials")}</a>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-5">
          <LanguagePicker value={language} onChange={onLanguageChange} />
          <button onClick={onNavigateLogin} className="bg-forest text-white px-4 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:bg-forest-dark transition-colors shadow-sm">
            {hasSession ? t("overview") : `${t("signIn")} / Register`}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="min-w-0">
            <div className="inline-flex items-center text-sm font-bold text-brand bg-brand/10 px-4 py-1.5 rounded-full mb-8">
            <div className="w-2 h-2 rounded-full bg-brand mr-2" /> {t("landingBadge")}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-[5rem] leading-[1.05] font-extrabold tracking-tight mb-8">
            {t("landingTitle").split(". ")[0]}.<br/>
            <span className="text-brand">{t("landingTitle").split(". ")[1]}</span>
          </h1>
          <p className="text-muted text-xl mb-10 max-w-lg leading-relaxed">
            {t("landingIntro")} No more queues, just transparent, real-time efficiency.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-14">
            <button onClick={onNavigateLogin} className="w-full sm:w-auto bg-brand text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20">
              {hasSession ? t("overview") : t("bookSlot")} <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-white text-forest px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors border border-line">
              <Play className="w-5 h-5 fill-forest" /> {t("watchDemo")}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full bg-forest border-2 border-[#F8F9FA] flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-white/50" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-base font-extrabold">{t("farmersCount")}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                <span className="text-sm font-bold ml-1.5">{t("rating")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side mockup */}
        <div className="relative mt-16 min-w-0 md:mt-0">
          <div className="bg-forest rounded-[3rem] p-6 sm:p-10 md:p-14 aspect-square relative shadow-2xl flex flex-col justify-between max-w-lg mx-auto w-full">
            <div className="absolute top-8 sm:top-12 left-1/2 -translate-x-1/2 w-[85%] bg-white rounded-3xl p-3 sm:p-5 shadow-xl flex items-center gap-3 sm:gap-4 transform -rotate-1">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-brand">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-forest leading-tight">{t("bookingConfirmed")}</p>
                <p className="text-sm text-muted mt-1">Time: <span className="font-bold">Today, 10:30 AM</span></p>
              </div>
            </div>

            <div className="absolute top-[35%] left-0 xl:-left-16 w-[80%] md:w-[70%] bg-white rounded-3xl p-3 sm:p-5 shadow-xl flex items-center gap-3 sm:gap-5">
               <div className="w-12 h-12 rounded-full bg-forest text-white flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted leading-tight">{t("estimatedWait")}</p>
                <p className="text-xl font-extrabold text-forest mt-1">12 min</p>
              </div>
            </div>
            
            <div className="absolute top-[55%] right-0 xl:-right-12 w-[80%] md:w-[75%] bg-white rounded-3xl p-3 sm:p-5 shadow-xl flex items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted leading-tight">{t("paymentStatus")}</p>
                  <span className="text-brand text-xs font-bold px-2 py-1 bg-brand/10 rounded uppercase">{t("statusAccepted")}</span>
                </div>
                <p className="text-2xl font-extrabold text-forest mt-2">₹45,200</p>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 flex justify-between px-2 md:px-6">
               <div className="text-center">
                 <p className="text-white font-extrabold text-2xl md:text-3xl">42</p>
                 <p className="text-white/50 text-xs md:text-sm uppercase tracking-wider mt-1.5 font-semibold">{t("liveQueue")}</p>
               </div>
               <div className="text-center">
                 <p className="text-white font-extrabold text-2xl md:text-3xl">8</p>
                 <p className="text-white/50 text-xs md:text-sm uppercase tracking-wider mt-1.5 font-semibold">{t("statusAccepted")}</p>
               </div>
               <div className="text-center">
                 <p className="text-white font-extrabold text-2xl md:text-3xl">95%</p>
                 <p className="text-white/50 text-xs md:text-sm uppercase tracking-wider mt-1.5 font-semibold">{t("capacity")}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-line bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 text-center divide-x-0 md:divide-x divide-line/50">
          <div>
            <h3 className="text-xl sm:text-3xl lg:text-5xl font-display font-extrabold mb-3">10,000+</h3>
            <p className="text-base font-medium text-muted">{t("farmersCount")}</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-3xl lg:text-5xl font-display font-extrabold mb-3">50+</h3>
            <p className="text-base font-medium text-muted">{t("centre")}</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-3xl lg:text-5xl font-display font-extrabold mb-3">95%</h3>
            <p className="text-base font-medium text-muted">{t("bookedSuccess")}</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-3xl lg:text-5xl font-display font-extrabold mb-3">₹100Cr+</h3>
            <p className="text-base font-medium text-muted">{t("paymentStatus")}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <div className="inline-block text-xs font-bold text-white bg-brand px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">{t("landingFeatures")}</div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-4 tracking-tight">{t("featureHeading")}</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">{t("featureIntro")}</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: t("featureRealtime"), desc: t("featureRealtimeDesc") },
              { icon: ShieldCheck, title: t("featureSecure"), desc: t("featureSecureDesc") },
              { icon: CreditCard, title: t("featurePayments"), desc: t("featurePaymentsDesc") },
              { icon: MapPin, title: t("featureAllocation"), desc: t("featureAllocationDesc") },
              { icon: Phone, title: t("featureMobile"), desc: t("featureMobileDesc") },
              { icon: Activity, title: t("featureAnalytics"), desc: t("featureAnalyticsDesc") }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2rem] border border-line shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-[#F8F9FA] border border-line flex items-center justify-center mb-8 text-brand">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted text-base leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-28 bg-forest relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-block text-xs font-bold text-white bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">{t("process")}</div>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4 tracking-tight">{t("fiveSteps")}</h2>
          <p className="text-white/60 mb-24 text-lg">{t("processIntro")}</p>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
             {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-white/10 -translate-y-1/2 z-0" />
            
            {[
              { num: "1", title: t("chooseCentre"), desc: t("chooseCentreDesc"), icon: MapPin },
              { num: "2", title: t("bookSlotStep"), desc: t("bookSlotStepDesc"), icon: Zap },
              { num: "3", title: t("getToken"), desc: t("getTokenDesc"), icon: Clock },
              { num: "4", title: t("qualityCheck"), desc: t("qualityCheckDesc"), icon: CheckCircle2 },
              { num: "5", title: t("getPaid"), desc: t("getPaidDesc"), icon: CreditCard }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 w-full lg:w-1/5 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white font-bold mb-6 shadow-lg shadow-brand/30">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold mb-2 text-lg">{step.title}</h3>
                <p className="text-white/60 text-xs md:text-sm text-center leading-relaxed">{step.desc}</p>
                <div className="absolute -top-3.5 bg-forest text-white/50 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                  {step.num}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-28 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="inline-block text-xs font-bold text-brand bg-brand/10 px-4 py-1.5 rounded-full mb-8 uppercase tracking-wider">Impact</div>
          
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-5 tracking-tight">{t("impactHeading")}</h2>
              <p className="text-muted mb-12 text-lg">{t("impactIntro")}</p>
              
              <div className="space-y-8">
                {[
                  { icon: TrendingDown, text: "Reduction in Wait Time" },
                  { icon: ShieldCheck, text: "Transparent MSP Pricing" },
                  { icon: Heart, text: "Zero Malpractices" },
                  { icon: Award, text: "Government Recognized" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-brand shadow-sm">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-w-0">
              <div className="absolute -top-5 right-0 sm:-top-8 xl:-right-8 bg-brand text-white text-center px-4 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-xl z-10 transform rotate-3">
                <p className="font-extrabold text-3xl leading-none">10K+</p>
                <p className="text-xs font-bold opacity-90 mt-2 uppercase tracking-wider">Farmers</p>
              </div>
              
              <div className="bg-white p-6 sm:p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-line space-y-10 relative z-0">
                {[
                  { label: "Average Wait Time", val: "15m", pct: "20%" },
                  { label: "Farmer Satisfaction", val: "95%", pct: "95%" },
                  { label: "Digital Adoption", val: "82%", pct: "82%" }
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-3.5">
                      <span className="text-sm font-bold text-forest">{bar.label}</span>
                      <span className="text-sm font-extrabold text-brand">{bar.val}</span>
                    </div>
                    <div className="h-3.5 bg-line rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: bar.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto bg-forest rounded-[3rem] p-8 sm:p-16 md:p-24 text-center relative overflow-hidden">
           {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
            <div className="relative z-10 flex w-full min-w-0 flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10">
              <Leaf className="w-10 h-10 text-brand" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white mb-5 tracking-tight">{t("readyHeading")}</h2>
            <p className="text-white/70 mb-12 text-lg md:text-xl max-w-2xl">{t("readyIntro")}</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <button onClick={onNavigateLogin} className="w-full sm:w-auto bg-brand text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-3 hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20">
                {t("getStarted")} <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={onNavigateContact} className="w-full sm:w-auto bg-transparent text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-3 hover:bg-white/5 transition-colors border border-white/20">
                <User className="w-5 h-5" /> {t("support")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest pt-20 pb-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-16 sm:mb-20">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="full" className="h-11 mb-6" />
            <p className="text-white/60 text-sm leading-relaxed">Empowering Farmers with Technology and Transparency.</p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Product</h4>
            <ul className="space-y-4 text-white/70 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Company</h4>
            <ul className="space-y-4 text-white/70 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><button onClick={onNavigateContact} className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Legal</h4>
            <ul className="space-y-4 text-white/70 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-white/40 text-xs border-t border-white/10 pt-10 max-w-6xl mx-auto px-6 tracking-wide">
          © {new Date().getFullYear()} KrishakMitra. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

