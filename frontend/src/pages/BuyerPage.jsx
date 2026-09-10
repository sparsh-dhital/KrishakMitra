import { useState, useEffect } from "react";
import { Gavel, LayoutDashboard, Bell, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { SidebarLayout, Card, Badge, Button, Eyebrow, CircularProgress } from "../components/ui";
import BuyerMarketplace from "./BuyerMarketplace";
import { getBuyerBids, getBuyerNotifications, getHighestBid } from "../services/biddingService";

export default function BuyerPage({ language, onLanguageChange, onLogout, onHome, buyerId }) {
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("krishak-mitra-buyer-tab") || "marketplace");
  const [bids, setBids] = useState([]);
  const [highestBidsMap, setHighestBidsMap] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("krishak-mitra-buyer-tab", activeTab);
    
    if (activeTab === "activity") {
       setLoading(true);
       getBuyerBids(buyerId).then(async (fetchedBids) => {
         // Filter to only show the highest bid per auction from this buyer
         const uniqueAuctions = {};
         for (const bid of fetchedBids) {
            if (!uniqueAuctions[bid.auction_id] || Number(bid.offered_price) > Number(uniqueAuctions[bid.auction_id].offered_price)) {
               uniqueAuctions[bid.auction_id] = bid;
            }
         }
         const finalBids = Object.values(uniqueAuctions);
         setBids(finalBids);
         
         const hBids = {};
         for (const bid of finalBids) {
            hBids[bid.auction_id] = await getHighestBid(bid.auction_id);
         }
         setHighestBidsMap(hBids);
         setLoading(false);
       });
    } else if (activeTab === "notifications") {
       setLoading(true);
       getBuyerNotifications(buyerId).then(data => {
         setNotifications(data);
         setLoading(false);
       });
    }
  }, [activeTab, buyerId]);

  const navItems = [
    { id: "marketplace", label: "Browse Auctions", icon: Gavel },
    { id: "activity", label: "My Bid Activity", icon: LayoutDashboard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const formatTimeAgo = (dateStr) => {
    const ms = Date.now() - new Date(dateStr).getTime();
    if (ms < 60000) return "Just now";
    if (ms < 3600000) return Math.floor(ms / 60000) + " mins ago";
    if (ms < 86400000) return Math.floor(ms / 3600000) + " hours ago";
    return Math.floor(ms / 86400000) + " days ago";
  };

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
          <Eyebrow className="mb-2">BUYER WORKSPACE</Eyebrow>
          <h1 className="font-display text-4xl font-extrabold text-forest mb-6">My bid activity</h1>
          
          {loading ? (
             <div className="flex justify-center p-12"><CircularProgress className="text-brand" size="lg" /></div>
          ) : bids.length === 0 ? (
             <Card className="text-center py-12">
               <Gavel className="w-10 h-10 text-brand mx-auto mb-4 opacity-50" />
               <h2 className="font-bold text-forest">No active bids</h2>
               <p className="text-sm text-muted mt-2">You haven't placed any bids yet. Head to the marketplace to get started.</p>
               <Button variant="primary" className="mt-4" onClick={() => setActiveTab("marketplace")}>Browse Auctions</Button>
             </Card>
          ) : (
            <div className="space-y-4">
              {bids.map(bid => {
                const highestBid = highestBidsMap[bid.auction_id];
                const isWinning = highestBid && highestBid.buyer_id === buyerId;
                const isClosed = bid.auctions?.status === "awarded" || bid.auctions?.status === "closed";
                const isLost = isClosed && !isWinning;
                
                return (
                  <Card key={bid.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-shadow ${
                    isWinning && !isClosed ? "border-l-4 border-l-brand hover:shadow-md" : 
                    !isWinning && !isClosed ? "border-l-4 border-l-amber-500 bg-amber-50/30 hover:shadow-md" : 
                    "border-l-4 border-l-slate-300 opacity-70"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isWinning && !isClosed ? "bg-green-50" : 
                        !isWinning && !isClosed ? "bg-amber-100" : "bg-slate-100"
                      }`}>
                        {isWinning && !isClosed && <CheckCircle2 className="w-6 h-6 text-brand" />}
                        {!isWinning && !isClosed && <Clock className="w-6 h-6 text-amber-600" />}
                        {isClosed && <XCircle className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-forest text-lg">
                          {bid.auctions?.crops?.name || bid.auctions?.crop_name || "Crop Listing"} 
                          {bid.auctions?.quantity && ` - ${bid.auctions.quantity} Quintals`}
                        </h3>
                        <p className="text-sm text-muted">
                          {isClosed ? "Auction Closed" : "Active Auction"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap sm:text-right items-center gap-4 sm:gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 border-t border-line sm:border-t-0 sm:pt-0">
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Your Bid</p>
                        <p className={`font-display text-xl font-extrabold ${!isWinning && !isClosed ? "line-through text-slate-400" : "text-forest"}`}>
                          {Number(bid.offered_price).toLocaleString("en-IN")}
                        </p>
                      </div>
                      
                      {!isWinning && !isClosed && highestBid && (
                        <div>
                          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Highest Bid</p>
                          <p className="font-display text-xl font-extrabold text-amber-600">
                            {Number(highestBid.offered_price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}
                      
                      <div className="ml-auto sm:ml-0 flex items-center gap-3">
                        {isWinning && !isClosed && <Badge tone="success" className="h-8">Winning</Badge>}
                        {!isWinning && !isClosed && <Badge tone="warning" className="h-8">Outbid</Badge>}
                        {isClosed && <Badge tone="default" className="h-8">{isWinning ? "Won" : "Lost"}</Badge>}
                        
                        {!isClosed && !isWinning && (
                          <Button variant="primary" size="sm" onClick={() => setActiveTab("marketplace")}>Bid Higher</Button>
                        )}
                        {!isClosed && isWinning && (
                           <Button variant="outline" size="sm" disabled>Highest Bidder</Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="max-w-3xl mx-auto">
          <Eyebrow className="mb-2">BUYER WORKSPACE</Eyebrow>
          <h1 className="font-display text-4xl font-extrabold text-forest mb-6">Notifications</h1>
          
          {loading ? (
             <div className="flex justify-center p-12"><CircularProgress className="text-brand" size="lg" /></div>
          ) : notifications.length === 0 ? (
             <Card className="text-center py-12">
               <Bell className="w-10 h-10 text-brand mx-auto mb-4 opacity-50" />
               <h2 className="font-bold text-forest">No notifications</h2>
               <p className="text-sm text-muted mt-2">You're all caught up! Important alerts like being outbid will appear here.</p>
             </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map(notif => (
                <div key={notif.id} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-line shadow-sm">
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.read ? "bg-slate-300" : "bg-brand"}`} />
                  <div className="flex-1">
                    <p className={`font-bold text-forest text-sm ${!notif.read ? "text-forest" : "text-slate-600"}`}>{notif.title}</p>
                    <p className="text-xs text-muted mt-1">{notif.message}</p>
                  </div>
                  <p className="text-xs font-medium text-slate-400 ml-auto whitespace-nowrap">{formatTimeAgo(notif.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </SidebarLayout>
  );
}
