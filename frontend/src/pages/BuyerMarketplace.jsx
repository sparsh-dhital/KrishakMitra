import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Store, RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { AuctionCard } from "../components/AuctionCard";
import { Badge, Button, Card, Input } from "../components/ui";
import { getOpenAuctions, placeBidDirectly } from "../services/biddingService";

export default function BuyerMarketplace({ role = "admin", buyerId = "demo-buyer" }) {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bid, setBid] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  async function loadAuctions() {
    setLoading(true);
    try {
      setAuctions(await getOpenAuctions());
    } catch (error) {
      setAuctions([]);
      toast.error(error?.message || "Unable to load marketplace listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAuctions(); }, []);

  const visibleAuctions = auctions
    .filter((auction) => (auction?.crops?.name || auction?.crop_name || "").toLowerCase().includes(search.toLowerCase().trim()))
    .sort((first, second) => sort === "price" ? Number(first?.base_price || 0) - Number(second?.base_price || 0) : sort === "quantity" ? Number(second?.quantity || 0) - Number(first?.quantity || 0) : new Date(second?.created_at || 0) - new Date(first?.created_at || 0));

  async function submitBid(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await placeBidDirectly(selectedAuction?.id, buyerId, bid);
      toast.success("Bid placed successfully.");
      setSelectedAuction(null);
      setBid("");
      await loadAuctions();
    } catch (error) {
      toast.error(error?.message || "Unable to place bid.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">Private market</p>
          <h1 className="font-display text-2xl font-bold text-forest">Direct Farmer Marketplace</h1>
          <p className="text-sm text-muted mt-1">Buy harvested crops directly through live private bids.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAuctions} disabled={loading} className="gap-2"><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs font-bold uppercase tracking-widest text-muted">Open listings</p><p className="font-display text-2xl font-extrabold text-forest mt-1">{auctions.length}</p></Card>
        <Card className="p-4"><p className="text-xs font-bold uppercase tracking-widest text-muted">Lowest base price</p><p className="font-display text-2xl font-extrabold text-brand mt-1">{auctions.length ? `${Math.min(...auctions.map((auction) => Number(auction?.base_price || 0))).toLocaleString("en-IN")}` : "-"}</p></Card>
        <Card className="p-4"><p className="text-xs font-bold uppercase tracking-widest text-muted">Direct trade</p><p className="font-display text-2xl font-extrabold text-forest mt-1 flex items-center gap-2">Live <Sparkles className="w-5 h-5 text-amber-500" /></p></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" /><Input className="pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crops..." /></div>
        <div className="relative sm:w-56"><SlidersHorizontal className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" /><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-line bg-surface pl-11 pr-4 text-sm font-bold text-forest"><option value="newest">Newest first</option><option value="price">Lowest base price</option><option value="quantity">Largest quantity</option></select></div>
      </div>

      {loading ? <Card><p className="text-sm text-muted">Loading open listings...</p></Card> : auctions.length === 0 ? (
        <Card className="text-center py-12"><Store className="w-10 h-10 text-brand mx-auto mb-4" /><h2 className="font-bold text-forest">No open listings yet</h2><p className="text-sm text-muted mt-2">New farmer listings will appear here.</p></Card>
      ) : (
        visibleAuctions.length ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{visibleAuctions.map((auction) => <AuctionCard key={auction?.id} auction={auction} role={role} buyerId={buyerId} onBid={(item, current) => { setSelectedAuction(item); setBid(String(Number(current || 0) + 1)); }} />)}</div> : <Card className="text-center py-10"><p className="text-muted font-medium">No listings match your search.</p></Card>
      )}

      {selectedAuction && (
        <div className="fixed inset-0 z-50 bg-forest/40 p-4 flex items-center justify-center" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6"><div><Badge tone="success">Open auction</Badge><h2 className="font-display text-xl font-bold text-forest mt-2">Place a higher bid</h2><p className="text-sm text-muted mt-1">{selectedAuction?.crops?.name || "Crop listing"}</p></div><button className="text-muted hover:text-forest" onClick={() => setSelectedAuction(null)} aria-label="Close"><X className="w-5 h-5" /></button></div>
            <form onSubmit={submitBid} className="space-y-5"><div><label className="block text-sm font-bold text-forest mb-2">Your offer per quintal</label><Input type="number" min="0" step="0.01" value={bid} onChange={(event) => setBid(event.target.value)} required /></div><Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting..." : "Submit bid"}</Button></form>
          </Card>
        </div>
      )}
    </div>
  );
}
