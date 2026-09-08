import { useState } from "react";
import { Gavel, LayoutDashboard, Bell } from "lucide-react";
import { SidebarLayout, Card } from "../components/ui";
import BuyerMarketplace from "./BuyerMarketplace";

export default function BuyerPage({ language, onLanguageChange, onLogout, buyerId }) {
  const [activeTab, setActiveTab] = useState("marketplace");
  const navItems = [
    { id: "marketplace", label: "Browse Auctions", icon: Gavel },
    { id: "activity", label: "My Bid Activity", icon: LayoutDashboard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <SidebarLayout
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      language={language}
      onLanguageChange={onLanguageChange}
      displayName="Buyer / Institution"
      roleLabel="Private market"
    >
      {activeTab === "marketplace" && <BuyerMarketplace role="buyer" buyerId={buyerId || "demo-buyer"} />}
      {activeTab === "activity" && (
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">Buyer workspace</p>
          <h1 className="font-display text-2xl font-bold text-forest mb-6">My bid activity</h1>
          <Card><p className="text-sm text-muted">Your active bids are shown on their auction cards. Keep bidding until the farmer accepts a top offer.</p></Card>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">Buyer workspace</p>
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Notifications</h1>
          <Card><p className="text-sm text-muted">You will see updates here when farmers accept or close your bids.</p></Card>
        </div>
      )}
    </SidebarLayout>
  );
}
