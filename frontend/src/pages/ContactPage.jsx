import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import Logo from "../components/Logo";
import LanguagePicker from "../components/LanguagePicker";

export default function ContactPage({ onBack, language, onLanguageChange }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    alert("Message sent successfully! We will get back to you soon.");
    onBack();
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
            Get In Touch
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            We're here to help you grow.
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-12 max-w-md">
            Have questions about the procurement process, platform usage, or need technical support? Reach out to our dedicated team.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center shadow-sm shrink-0">
                <Phone className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Call Us (Toll-Free)</h3>
                <p className="text-muted">1800-123-4567</p>
                <p className="text-sm text-muted/70 mt-1">Available Mon-Sat, 9am - 6pm</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center shadow-sm shrink-0">
                <Mail className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email Support</h3>
                <p className="text-muted">support@krishakmitra.gov.in</p>
                <p className="text-sm text-muted/70 mt-1">We aim to reply within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center shadow-sm shrink-0">
                <MapPin className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Head Office</h3>
                <p className="text-muted">Ministry of Agriculture</p>
                <p className="text-sm text-muted/70 mt-1">Krishi Bhawan, New Delhi, 110001</p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-line">
          <h2 className="text-2xl font-bold mb-8">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="E.g. Ramesh Kumar"
                className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91"
                  className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="(Optional)"
                  className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Message</label>
              <textarea 
                required
                rows="4"
                placeholder="How can we help you?"
                className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full bg-forest text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-forest-dark transition-colors shadow-lg"
            >
              Send Message <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
