import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gavel, LayoutDashboard, Bell, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { SidebarLayout, Card, Badge, Button } from "../components/ui";
import BuyerMarketplace from "./BuyerMarketplace";

export default function BuyerPage({ language, onLanguageChange, onLogout, onHome, buyerId }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("marketplace");
  const navItems = [
    { id: "marketplace", label: t("marketplace"), icon: Gavel },
    { id: "activity", label: t("bidActivity"), icon: LayoutDashboard },
    { id: "notifications", label: t("alerts"), icon: Bell },
  ];

  return (
    <SidebarLayout
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout} onHome={onHome}
      language={language}
      onLanguageChange={onLanguageChange}
      displayName="Buyer / Institution"
      roleLabel="Private market"
    >
      {activeTab === "marketplace" && <BuyerMarketplace role="buyer" buyerId={buyerId || "demo-buyer"} />}
      {activeTab === "activity" && (
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">{t("buyerWorkspace")}</p>
          <h1 className="font-display text-2xl font-bold text-forest mb-6">{t("myBidActivity")}</h1>
          
          <div className="space-y-4">
            <Card className="flex items-center justify-between hover:shadow-md transition-shadow border-l-4 border-l-brand">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-forest text-lg">Paddy Grade A - 40 Quintals</h3>
                  <p className="text-sm text-muted">Auction #A-8924 &bull; Closes in 2h 15m</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{t("yourBid")}</p>
                  <p className="font-display text-xl font-extrabold text-forest">₹85,000</p>
                </div>
                <Badge tone="success" className="h-8">{t("winning")}</Badge>
                <Button variant="outline" size="sm"><ArrowRight className="w-4 h-4" /></Button>
              </div>
            </Card>

            <Card className="flex items-center justify-between hover:shadow-md transition-shadow border-l-4 border-l-amber-500 bg-amber-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-forest text-lg">Cotton - 15 Quintals</h3>
                  <p className="text-sm text-muted">Auction #A-8910 &bull; Closes in 45m</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{t("yourBid")}</p>
                  <p className="font-display text-xl font-extrabold line-through text-slate-400">₹42,000</p>
                </div>
                <Badge variant="warning" className="h-8">{t("outbid")}</Badge>
                <Button variant="primary" size="sm">{t("bidHigher")}</Button>
              </div>
            </Card>

            <Card className="flex items-center justify-between hover:shadow-md transition-shadow border-l-4 border-l-slate-300 opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-forest text-lg">Maize - 25 Quintals</h3>
                  <p className="text-sm text-muted">Auction #A-8850 &bull; Closed yesterday</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{t("winningBid")}</p>
                  <p className="font-display text-xl font-extrabold text-forest">₹61,000</p>
                </div>
                <Badge tone="default" className="h-8">{t("lost")}</Badge>
                <Button variant="ghost" size="sm" disabled>{t("closed")}</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">{t("buyerWorkspace")}</p>
          <h1 className="font-display text-2xl font-bold text-forest mb-6">{t("notifications")}</h1>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-line shadow-sm">
              <div className="w-2 h-2 mt-2 rounded-full bg-brand shrink-0" />
              <div>
                <p className="font-bold text-forest text-sm">You have been outbid on Cotton - 15 Quintals!</p>
                <p className="text-xs text-muted mt-1">A new bid of ₹43,500 was placed 5 minutes ago. Place a higher bid to win.</p>
              </div>
              <p className="text-xs text-slate-400 ml-auto whitespace-nowrap">5 mins ago</p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-line shadow-sm">
              <div className="w-2 h-2 mt-2 rounded-full bg-slate-300 shrink-0" />
              <div>
                <p className="font-bold text-forest text-sm">Auction Closed: Maize - 25 Quintals</p>
                <p className="text-xs text-muted mt-1">This auction has ended. You did not win this lot.</p>
              </div>
              <p className="text-xs text-slate-400 ml-auto whitespace-nowrap">1 day ago</p>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
