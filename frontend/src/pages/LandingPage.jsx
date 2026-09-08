import { motion } from "framer-motion";
import { ArrowRight, Leaf, CheckCircle2, Clock, Activity, CreditCard } from "lucide-react";
import { Button, Badge } from "../components/ui";
import Logo from "../components/Logo";
import LanguagePicker from "../components/LanguagePicker";

export default function LandingPage({ onNavigateLogin, language, onLanguageChange }) {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-cream font-body selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-surface/80 backdrop-blur-md border-b border-line z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Full logo; mix-blend-multiply removes white bg on the frosted header */}
          <Logo variant="full" className="h-14 w-auto mix-blend-multiply" />
          
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-forest">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand transition-colors">Home</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand transition-colors">How it Works</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand transition-colors">Features</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand transition-colors">Impact</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand transition-colors">Contact</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <LanguagePicker value={language} onChange={onLanguageChange} />
            <Button variant="dark" onClick={onNavigateLogin}>Login</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-forest leading-[1.1] tracking-tight mb-6">
            Smarter Procurement. Stronger Farmers.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted font-medium mb-10 max-w-xl">
            Real-time coordination between farmers, procurement centres and government systems for a transparent and efficient agricultural ecosystem.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" onClick={onNavigateLogin} className="w-full sm:w-auto gap-2 text-base">Book a Slot <ArrowRight className="w-5 h-5" /></Button>
            <Button variant="outline" size="lg" onClick={onNavigateLogin} className="w-full sm:w-auto gap-2 bg-transparent border-forest/20 text-forest text-base">Watch Demo</Button>
          </motion.div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
          {/* Mockup of UI steps matching reference */}
          <div className="absolute inset-0 bg-forest p-8 flex flex-col items-end gap-4 overflow-hidden">
             <div className="w-64 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-4 translate-x-8">
               <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center"><Leaf className="w-5 h-5 text-brand" /></div>
               <div><p className="text-xs text-muted font-bold">Step 1</p><p className="text-sm text-forest font-bold">Choose centre & slot</p></div>
             </div>
             <div className="w-64 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-4 -translate-x-4">
               <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center"><Activity className="w-5 h-5 text-brand" /></div>
               <div><p className="text-xs text-muted font-bold">Step 2</p><p className="text-sm text-forest font-bold">Get digital token</p></div>
             </div>
             <div className="w-64 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-4 translate-x-12">
               <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center"><Clock className="w-5 h-5 text-brand" /></div>
               <div><p className="text-xs text-muted font-bold">Step 3</p><p className="text-sm text-forest font-bold">Track live position</p></div>
             </div>
             <div className="w-64 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-4 translate-x-2">
               <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-brand" /></div>
               <div><p className="text-xs text-muted font-bold">Step 4</p><p className="text-sm text-forest font-bold">Quality check</p></div>
             </div>
             <div className="w-64 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-4 translate-x-16">
               <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-brand" /></div>
               <div><p className="text-xs text-muted font-bold">Step 5</p><p className="text-sm text-forest font-bold">Direct payment</p></div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[3rem] p-12 lg:p-20 border border-line shadow-sm grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-display text-4xl font-extrabold text-forest mb-6">The Problem</h2>
            <p className="text-lg text-muted font-medium">Farmers face long waiting times, lack of information regarding procurement schedules, and uncertainty about procurement status.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {["Long queues", "Unclear schedules", "No real-time status", "Uncertain payments"].map((issue, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <span className="text-red-500 font-bold">!</span>
                  </div>
                  <span className="font-bold text-forest">{issue}</span>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-24 px-6 bg-forest text-white">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-extrabold mb-6">Our Solution — KrishakMitra</h2>
              <p className="text-lg text-white/80 font-medium mb-10 max-w-lg leading-relaxed">
                A coordination and visibility layer over the existing procurement workflow. Helping farmers and officers make better decisions, reduce waiting time and ensure smooth, transparent procurement.
              </p>
              <Button onClick={onNavigateLogin} className="bg-brand text-white hover:bg-brand-hover gap-2">Learn More <ArrowRight className="w-4 h-4" /></Button>
            </div>
            {/* Visual placeholder for solution */}
            <div className="h-96 rounded-[3rem] bg-white/5 border border-white/10 p-8 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-brand/20 blur-[100px]" />
               <div className="relative z-10 bg-surface rounded-3xl p-6 w-full max-w-xs shadow-2xl text-forest">
                 <Badge tone="success" className="mb-4">Demo</Badge>
                 <div className="space-y-4">
                   <div className="h-12 bg-slate-100 rounded-xl" />
                   <div className="h-32 bg-slate-100 rounded-xl" />
                   <div className="h-12 bg-brand rounded-xl" />
                 </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
