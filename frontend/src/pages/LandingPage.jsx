import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Leaf,
  Gavel
} from "lucide-react";
import Logo from "../components/Logo";
import LanguagePicker from "../components/LanguagePicker";

export default function LandingPage({ onNavigateLogin, onNavigateContact, language, onLanguageChange }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading as requested
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center font-body text-forest">
        <Logo variant="full" className="h-24 w-auto mb-8 animate-pulse mix-blend-multiply" />
        <div className="flex gap-3 mb-6">
          <div className="w-3.5 h-3.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3.5 h-3.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3.5 h-3.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <h2 className="text-xl md:text-2xl font-medium text-forest/80">Welcome to KrishakMitra</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body text-forest selection:bg-brand selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <header className="w-full py-4 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <Logo variant="full" className="h-12 md:h-[4.5rem] w-auto mix-blend-multiply" />
        <nav className="hidden md:flex items-center gap-10 text-base font-semibold">
          <a href="#features" className="hover:text-brand transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-brand transition-colors">How it Works</a>
          <a href="#impact" className="hover:text-brand transition-colors">Impact</a>
          <a href="#testimonials" className="hover:text-brand transition-colors">Testimonials</a>
          <button onClick={onNavigateContact} className="hover:text-brand transition-colors cursor-pointer">Contact Us</button>
        </nav>
        <div className="flex items-center gap-2 md:gap-5">
          <LanguagePicker value={language} onChange={onLanguageChange} />
          <button onClick={onNavigateLogin} className="bg-forest text-white px-8 py-3 rounded-full text-base font-medium hover:bg-forest-dark transition-colors">
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-10 md:py-20 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center text-sm font-bold text-brand bg-brand/10 px-4 py-1.5 rounded-full mb-6 self-start">
            <div className="w-2 h-2 rounded-full bg-brand mr-2" /> Next Generation Platform
          </div>
          <h1 className="font-display text-4xl md:text-[4rem] leading-[1.15] md:leading-[1.1] font-extrabold tracking-tight mb-6">
            Smarter Procurement.<br/>
            <span className="text-brand">Stronger Farmers.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
            Experience seamless coordination between farmers, procurement centres, and government systems. No more queues, just transparent, real-time efficiency.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <button className="w-full sm:w-auto bg-brand text-white px-8 py-3.5 rounded-full text-lg font-bold flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20">
              Book Your Slot <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-white text-forest px-8 py-3.5 rounded-full text-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors border border-line shadow-sm hover:shadow">
              <Play className="w-5 h-5 fill-forest" /> Watch Demo
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full bg-forest border-2 border-[#F8F9FA] flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-white/50" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-base font-extrabold">10,000+ Farmers</p>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                <span className="text-sm font-bold ml-1.5">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side mockup */}
        <div className="relative mt-12 md:mt-0 flex flex-col justify-center items-center">
          <div className="bg-forest rounded-[3rem] p-6 md:p-12 relative shadow-2xl flex flex-col justify-between w-full max-w-[500px] min-h-[420px] sm:min-h-[500px] md:min-h-[600px] aspect-square md:aspect-auto">
            <div className="absolute top-6 md:top-12 left-1/2 -translate-x-1/2 w-[90%] md:w-[85%] bg-white rounded-3xl p-4 md:p-5 shadow-xl flex items-center gap-4 transform -rotate-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 flex items-center justify-center text-brand shrink-0">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-forest leading-tight">Slot Confirmed</p>
                <p className="text-xs md:text-sm text-muted mt-1">Time: <span className="font-bold">Today, 10:30 AM</span></p>
              </div>
            </div>

            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-auto md:-left-16 w-[90%] md:w-[70%] bg-white rounded-3xl p-4 md:p-5 shadow-xl flex items-center gap-4 md:gap-5">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted leading-tight">Current Wait Time</p>
                <p className="text-lg md:text-xl font-extrabold text-forest mt-1">12 min</p>
              </div>
            </div>
            
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-auto md:-right-12 w-[90%] md:w-[75%] bg-white rounded-3xl p-4 md:p-5 shadow-xl flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm text-muted leading-tight">Payment Disbursed</p>
                  <span className="text-brand text-[10px] md:text-xs font-bold px-2 py-1 bg-brand/10 rounded uppercase">Verified</span>
                </div>
                <p className="text-xl md:text-2xl font-extrabold text-forest mt-2">₹45,200</p>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 flex justify-between px-2 md:px-6">
               <div className="text-center">
                 <p className="text-white font-extrabold text-2xl md:text-3xl">42</p>
                 <p className="text-white/50 text-xs md:text-sm uppercase tracking-wider mt-1.5 font-semibold">Live Queue</p>
               </div>
               <div className="text-center">
                 <p className="text-white font-extrabold text-2xl md:text-3xl">8</p>
                 <p className="text-white/50 text-xs md:text-sm uppercase tracking-wider mt-1.5 font-semibold">Verified</p>
               </div>
               <div className="text-center">
                 <p className="text-white font-extrabold text-2xl md:text-3xl">95%</p>
                 <p className="text-white/50 text-xs md:text-sm uppercase tracking-wider mt-1.5 font-semibold">Efficiency</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-line bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10 text-center divide-x-0 md:divide-x divide-line/50">
          <div>
            <h3 className="text-3xl md:text-5xl font-display font-extrabold mb-2 md:mb-3">10,000+</h3>
            <p className="text-sm md:text-base font-medium text-muted">Farmers Onboarded</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-display font-extrabold mb-2 md:mb-3">50+</h3>
            <p className="text-sm md:text-base font-medium text-muted">Procurement Centres</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-display font-extrabold mb-2 md:mb-3">95%</h3>
            <p className="text-sm md:text-base font-medium text-muted">Fast-Tracked Sales</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-display font-extrabold mb-2 md:mb-3">₹100Cr+</h3>
            <p className="text-sm md:text-base font-medium text-muted">Payments Processed</p>
          </div>
        </div>
      </section>

      {/* MSP Harvest Challenge */}
      <section id="msp-challenge" className="py-24 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
            <div className="bg-forest text-white rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70 border border-white/20 px-4 py-1.5 rounded-full mb-8">
                  <Activity className="w-4 h-4 text-brand" /> MSP harvest season
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight mb-6">When procurement slows down, farmers carry the risk.</h2>
                <p className="text-white/75 text-base md:text-lg leading-relaxed">
                  Farmers face significant challenges during the MSP harvest procurement seasons. They experience long waiting times, lack critical information regarding procurement schedules, and suffer from uncertainty about their procurement and payment status. This results in severe overcrowding at Mandis, multi-day wait times under open skies, and potential crop spoilage.
                </p>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
                <div><p className="text-2xl font-extrabold text-white">Multi-day</p><p className="text-xs text-white/55 mt-1">waiting risk</p></div>
                <div><p className="text-2xl font-extrabold text-white">Open skies</p><p className="text-xs text-white/55 mt-1">farmer exposure</p></div>
                <div><p className="text-2xl font-extrabold text-white">Crop loss</p><p className="text-xs text-white/55 mt-1">spoilage risk</p></div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Clock, title: "Plan before arrival", text: "See available mandi slots and capacity before loading the harvest." },
                { icon: Activity, title: "Know the queue", text: "Track token movement and estimated turn time instead of waiting blindly." },
                { icon: ShieldCheck, title: "Protect the MSP journey", text: "Keep booking, quality, acceptance, and payment updates in one traceable flow." },
                { icon: TrendingDown, title: "Reduce spoilage pressure", text: "Less uncertainty means fewer unnecessary trips and less time in crowded yards." },
                { icon: Gavel, title: "Unlock private demand", text: "Farmers can also list harvested crops for direct buyer and institution bids." },
                { icon: CreditCard, title: "Close the payment loop", text: "Make payment status visible after procurement instead of leaving farmers guessing." },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-line rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-brand/30 transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-green-50 text-brand flex items-center justify-center mb-5"><item.icon className="w-5 h-5" /></div>
                  <h3 className="font-bold text-forest text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block text-xs font-bold text-white bg-brand px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">Features</div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-4 tracking-tight">Everything You Need</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">A complete solution for a transparent and fast procurement process.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Real-time Visibility", desc: "Track live queue status and schedules to minimize wait times." },
              { icon: ShieldCheck, title: "Secure & Transparent", desc: "End-to-end transparency with digital tokens preventing malpractices." },
              { icon: CreditCard, title: "Direct Payments", desc: "Integration with banking APIs ensures instant transfers to accounts." },
              { icon: MapPin, title: "Smart Allocation", desc: "Intelligent routing to the nearest centers with available capacity." },
              { icon: Phone, title: "Mobile First", desc: "Designed for seamless use on any mobile device for farmers on the go." },
              { icon: Activity, title: "Smart Analytics", desc: "Government and centers get real-time data for better decision making." }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2rem] border border-line shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-brand/10 flex items-center justify-center mb-8 text-brand">
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
          <div className="inline-block text-xs font-bold text-white bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">Process</div>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4 tracking-tight">Five Simple Steps</h2>
          <p className="text-white/60 mb-24 text-lg">From booking your slot to receiving your payment.</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8 relative">
             {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-white/10 -translate-y-1/2 z-0" />
            
            {[
              { num: "1", title: "Choose Centre", desc: "Find nearest available center", icon: MapPin },
              { num: "2", title: "Book a Slot", desc: "Select preferred date & time", icon: Zap },
              { num: "3", title: "Get Token", desc: "Receive digital QR instantly", icon: Clock },
              { num: "4", title: "Quality Check", desc: "Bring produce for fast grading", icon: CheckCircle2 },
              { num: "5", title: "Get Paid", desc: "Money transferred directly", icon: CreditCard }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 w-full min-h-[280px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 lg:p-10 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white font-bold mb-6 shadow-lg shadow-brand/30 group-hover:scale-110 transition-transform">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-white font-bold mb-3 text-xl">{step.title}</h3>
                <p className="text-white/60 text-sm text-center leading-relaxed">{step.desc}</p>
                <div className="absolute -top-4 bg-forest text-white/50 text-sm font-bold px-4 py-1.5 rounded-full border border-white/10">
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
          
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-stretch">
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-5 tracking-tight">Transforming Lives</h2>
              <p className="text-muted mb-12 text-lg">Measurable impact across the agricultural ecosystem.</p>
              
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

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-6 right-2 md:-top-8 md:-right-8 bg-brand text-white text-center px-4 py-3 md:px-6 md:py-4 rounded-3xl shadow-xl z-10 transform rotate-3">
                <p className="font-extrabold text-2xl md:text-3xl leading-none">10K+</p>
                <p className="text-[10px] md:text-xs font-bold opacity-90 mt-1 md:mt-2 uppercase tracking-wider">Farmers</p>
              </div>
              
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-line flex flex-col justify-evenly h-full relative z-0">
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
      <section className="py-20 md:py-28 px-6 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto bg-forest rounded-[3rem] p-10 md:p-24 text-center relative overflow-hidden">
           {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10">
              <Leaf className="w-10 h-10 text-brand" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-5 tracking-tight">Ready to simplify your procurement?</h2>
            <p className="text-white/70 mb-12 text-lg md:text-xl max-w-2xl">Join thousands of farmers experiencing faster, fairer, and transparent transactions.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <button onClick={onNavigateLogin} className="w-full sm:w-auto bg-brand text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-3 hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={onNavigateContact} className="w-full sm:w-auto bg-transparent text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-3 hover:bg-white/5 transition-colors border border-white/20">
                <User className="w-5 h-5" /> Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest pt-20 pb-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="full" className="h-16 w-auto grayscale brightness-200 mb-8 mix-blend-screen" />
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
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
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

