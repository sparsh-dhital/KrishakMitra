import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Gavel, Package, IndianRupee, CheckCircle2, Clock3, TrendingUp, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "./ui";
import { acceptHighestBidDirectly, getAuctionBids, getHighestBid, removeAuctionDirectly, supabase } from "../services/biddingService";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export function AuctionCard({ auction, role, buyerId, onBid, onUpdated, onRemoved }) {
  const [highestBid, setHighestBid] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const auctionId = auction?.id;

  useEffect(() => {
    if (!auctionId) return undefined;
    let active = true;
    Promise.all([getHighestBid(auctionId), getAuctionBids(auctionId)]).then(([bid, bids]) => {
      if (!active) return;
      setHighestBid(bid);
      setBidHistory(bids || []);
    }).catch(() => {});
    if (!supabase) return () => { active = false; };

    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids", filter: `auction_id=eq.${auctionId}` }, (payload) => {
        setHighestBid((current) => Number(payload?.new?.offered_price || 0) > Number(current?.offered_price || 0) ? payload.new : current);
        setBidHistory((current) => [payload.new, ...current].sort((a, b) => Number(b.offered_price) - Number(a.offered_price)));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  useEffect(() => {
    const expiry = auction?.expires_at ? new Date(auction.expires_at).getTime() : 0;
    if (!expiry) {
      setTimeLeft("Open-ended");
      return undefined;
    }
    const update = () => {
      const remaining = Math.max(0, expiry - Date.now());
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(remaining ? `${hours}h ${minutes}m ${seconds}s` : "Ended");
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [auction?.expires_at]);

  async function acceptBid() {
    setAccepting(true);
    try {
      await acceptHighestBidDirectly(auctionId);
      toast.success("Top bid accepted.");
      onUpdated?.(auctionId);
    } catch (error) {
      toast.error(error?.message || "Unable to accept this bid.");
    } finally {
      setAccepting(false);
    }
  }

  async function removeAuction() {
    if (!window.confirm("Remove this crop listing? Any bids on it will also be removed.")) return;
    setRemoving(true);
    try {
      await removeAuctionDirectly(auctionId);
      toast.success("Auction listing removed.");
      onRemoved?.(auctionId);
    } catch (error) {
      toast.error(error?.message || "Unable to remove this listing.");
    } finally {
      setRemoving(false);
    }
  }

  const cropName = auction?.crops?.name || auction?.crop_name || "Crop listing";
  const quantity = auction?.quantity ?? auction?.quantity_quintals ?? 0;
  const currentPrice = highestBid?.offered_price || auction?.base_price || 0;

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-5 h-5 text-brand" />
            <h3 className="font-display text-lg font-bold text-forest">{cropName}</h3>
          </div>
          <Badge tone={auction?.status === "open" ? "success" : "default"}>{auction?.status || "open"}</Badge>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted uppercase tracking-widest">Current highest</p>
          <p className="font-display text-2xl font-extrabold text-brand">{money(currentPrice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-y border-line py-4">
        <div className="flex items-center gap-2 text-sm text-muted"><Package className="w-4 h-4" /> {quantity} q</div>
        <div className="flex items-center gap-2 text-sm text-muted"><IndianRupee className="w-4 h-4" /> Base {money(auction?.base_price)}</div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs font-bold">
        <span className="flex items-center gap-1.5 text-amber-700"><Clock3 className="w-4 h-4" /> {timeLeft}</span>
        <span className="flex items-center gap-1.5 text-brand"><TrendingUp className="w-4 h-4" /> {bidHistory.length} bid{bidHistory.length === 1 ? "" : "s"}</span>
      </div>

      {bidHistory.length > 0 && <div className="rounded-xl bg-slate-50 border border-line px-3 py-2 text-xs text-muted">Latest bid by <span className="font-bold text-forest">{bidHistory[0]?.buyer_id || "Buyer"}</span> at <span className="font-bold text-brand">{money(bidHistory[0]?.offered_price)}</span></div>}

      {role === "farmer" ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="dark" className="flex-1 gap-2" onClick={acceptBid} disabled={accepting || removing || !highestBid || auction?.status !== "open"}>
            <CheckCircle2 className="w-4 h-4" /> {accepting ? "Accepting..." : "Accept Top Bid"}
          </Button>
          <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50" onClick={removeAuction} disabled={accepting || removing || auction?.status !== "open"}>
            <Trash2 className="w-4 h-4" /> {removing ? "Removing..." : "Remove"}
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={() => onBid?.(auction, currentPrice)}>Place Higher Bid</Button>
      )}
    </Card>
  );
}

export default AuctionCard;
