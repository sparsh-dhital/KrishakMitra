import { useEffect, useState } from "react";
import {
  Gavel,
  LayoutDashboard,
  Bell,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { SidebarLayout, Card, Badge, Button } from "../components/ui";
import BuyerMarketplace from "./BuyerMarketplace";
import {
  getBuyerBidActivity,
  getBuyerNotifications,
} from "../services/biddingService";

export default function BuyerPage({
  language,
  onLanguageChange,
  onLogout,
  onHome,
  buyerId,
}) {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    setActivity(getBuyerBidActivity(buyerId));
    setNotifications(getBuyerNotifications(buyerId));
  }, [activeTab, buyerId]);
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
      onHome={onHome}
      language={language}
      onLanguageChange={onLanguageChange}
      displayName="Buyer / Institution"
      roleLabel="Private market"
    >
      {activeTab === "marketplace" && (
        <BuyerMarketplace role="buyer" buyerId={buyerId || "demo-buyer"} />
      )}
      {activeTab === "activity" && (
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
            Buyer workspace
          </p>
          <h1 className="font-display text-2xl font-bold text-forest mb-6">
            My bid activity
          </h1>

          <div className="space-y-4">
            {activity.length ? (
              activity.map((bid) => (
                <Card
                  key={bid.id}
                  className="flex items-center justify-between gap-4 border-l-4 border-l-brand"
                >
                  <div>
                    <h3 className="font-bold text-forest">
                      Auction {bid.auction_id}
                    </h3>
                    <p className="text-sm text-muted">
                      Placed {new Date(bid.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-display text-xl font-extrabold text-forest">
                    Rs {Number(bid.offered_price).toLocaleString("en-IN")}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="text-center text-muted">
                No bids placed yet.
              </Card>
            )}
          </div>
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
            Buyer workspace
          </p>
          <h1 className="font-display text-2xl font-bold text-forest mb-6">
            Notifications
          </h1>
          <div className="space-y-4">
            {notifications.length ? (
              notifications.map((notification) => (
                <Card key={notification.id}>
                  <p className="font-bold text-forest text-sm">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {notification.message}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="text-center text-muted">
                No notifications yet.
              </Card>
            )}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
