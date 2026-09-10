import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const demoAuctionsKey = "krishak-mitra-demo-auctions";
const demoBidsKey = "krishak-mitra-demo-bids";
const demoNotificationsKey = "krishi-mitra-demo-notifications";

function readDemo(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeDemo(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function addDemoNotification(notification) {
  writeDemo(demoNotificationsKey, [notification, ...readDemo(demoNotificationsKey, [])]);
}

function demoListings() {
  return readDemo(demoAuctionsKey, [
    { id: "demo-auction-paddy", farmer_id: "12f3b7f6-5999-45e7-8811-3fd982a25345", crop_id: "cr1", quantity: 40, base_price: 2203, status: "open", crops: { name: "Paddy (Grade A)" }, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString() },
    { id: "demo-auction-maize", farmer_id: "demo-farmer-2", crop_id: "cr3", quantity: 25, base_price: 2090, status: "open", crops: { name: "Maize" }, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString() },
  ]);
}

function useDemoFallback(error) {
  return !supabase || Boolean(error);
}

function belongsToFarmer(auction, farmerId) {
  return auction?.farmer_id === farmerId || (farmerId === "12f3b7f6-5999-45e7-8811-3fd982a25345" && auction?.farmer_id === "f-1234");
}

function isMissingBiddingTable(error) {
  const message = String(error?.message || error?.details || error || "").toLowerCase();
  return message.includes("could not find the table") || message.includes("relation") || message.includes("404") || message.includes("schema cache");
}

function requireClient() {
  if (!supabase) {
    throw new Error("Supabase bidding is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

export async function getHighestBid(auctionId) {
  if (!auctionId) return null;
  const demoBid = readDemo(demoBidsKey, []).filter((bid) => bid.auction_id === auctionId).sort((a, b) => Number(b.offered_price) - Number(a.offered_price))[0];
  if (auctionId.startsWith("demo-")) return demoBid || null;
  const client = requireClient();
  const { data, error } = await client
    .from("bids")
    .select("id, auction_id, buyer_id, offered_price, created_at")
    .eq("auction_id", auctionId)
    .order("offered_price", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function getAuctionBids(auctionId) {
  if (!auctionId) return [];
  if (auctionId.startsWith("demo-")) {
    return readDemo(demoBidsKey, []).filter((bid) => bid.auction_id === auctionId).sort((a, b) => Number(b.offered_price) - Number(a.offered_price));
  }
  const client = requireClient();
  const { data, error } = await client.from("bids").select("id, auction_id, buyer_id, offered_price, created_at").eq("auction_id", auctionId).order("offered_price", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function placeBidDirectly(auctionId, buyerId, offeredPrice) {
  if (!auctionId || !buyerId) throw new Error("Auction and buyer details are required.");
  const price = Number(offeredPrice);
  if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid bid amount.");

  if (auctionId.startsWith("demo-")) {
    const auction = demoListings().find((item) => item.id === auctionId);
    const highestBid = await getHighestBid(auctionId);
    if (!auction || auction.status !== "open") throw new Error("This auction is no longer open.");
    if (price < Number(auction.base_price || 0)) throw new Error(`Bid must be at least ${auction.base_price}.`);
    if (price <= Number(highestBid?.offered_price || 0)) throw new Error(`Bid must be higher than ${highestBid.offered_price}.`);
    const bid = { id: `demo-bid-${Date.now()}`, auction_id: auctionId, buyer_id: buyerId, offered_price: price, created_at: new Date().toISOString() };
    writeDemo(demoBidsKey, [...readDemo(demoBidsKey, []), bid]);
    addDemoNotification({
      id: `demo-notification-${Date.now()}`,
      farmer_id: auction.farmer_id,
      type: "bid",
      title: "New private-market bid",
      message: "",
      type: "bidPlaced",
      data: { price: price.toLocaleString("en-IN"), crop: auction.crops?.name || "crop" },
      auction_id: auctionId,
      created_at: new Date().toISOString(),
      read: false,
    });
    return bid;
  }

  const client = requireClient();
  const { data: auction, error: auctionError } = await client
    .from("auctions")
    .select("id, base_price, status")
    .eq("id", auctionId)
    .maybeSingle();

  if (auctionError) throw auctionError;
  if (!auction) throw new Error("This auction could not be found.");
  if (auction.status !== "open") throw new Error("This auction is no longer open.");

  const highestBid = await getHighestBid(auctionId);
  const basePrice = Number(auction.base_price || 0);
  const currentHighest = Number(highestBid?.offered_price || 0);
  if (price < basePrice) throw new Error(`Bid must be at least ${basePrice}.`);
  if (price <= currentHighest) throw new Error(`Bid must be higher than ${currentHighest}.`);

  const { data, error } = await client
    .from("bids")
    .insert({ auction_id: auctionId, buyer_id: buyerId, offered_price: price })
    .select()
    .single();

  if (error) throw error;
  const { data: auctionForNotification } = await client.from("auctions").select("farmer_id").eq("id", auctionId).maybeSingle();
  if (auctionForNotification?.farmer_id) {
    await client.from("auction_notifications").insert({
      farmer_id: auctionForNotification.farmer_id,
      auction_id: auctionId,
      bid_id: data?.id,
      title: "New private-market bid",
      message: `A buyer placed a bid of ${price.toLocaleString("en-IN")} per quintal.`,
      is_read: false,
    }).catch(() => {});
  }
  return data;
}

export async function acceptHighestBidDirectly(auctionId) {
  if (!auctionId) throw new Error("Auction details are required.");
  if (auctionId.startsWith("demo-")) {
    const listings = demoListings().map((auction) => auction.id === auctionId ? { ...auction, status: "awarded" } : auction);
    writeDemo(demoAuctionsKey, listings);
    return listings.find((auction) => auction.id === auctionId);
  }
  const client = requireClient();
  const { data, error } = await client
    .from("auctions")
    .update({ status: "awarded", awarded_at: new Date().toISOString() })
    .eq("id", auctionId)
    .eq("status", "open")
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeAuctionDirectly(auctionId) {
  if (!auctionId) throw new Error("Auction details are required.");
  if (auctionId.startsWith("demo-")) {
    const listings = demoListings().filter((auction) => auction.id !== auctionId);
    writeDemo(demoAuctionsKey, listings);
    writeDemo(demoBidsKey, readDemo(demoBidsKey, []).filter((bid) => bid.auction_id !== auctionId));
    writeDemo(demoNotificationsKey, readDemo(demoNotificationsKey, []).filter((notification) => notification.auction_id !== auctionId));
    return { id: auctionId };
  }

  const client = requireClient();
  const { data, error } = await client
    .from("auctions")
    .delete()
    .eq("id", auctionId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function getOpenAuctions() {
  if (!supabase) return demoListings().filter((auction) => auction.status === "open");
  const client = requireClient();
  const { data, error } = await client
    .from("auctions")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    if (useDemoFallback(error) || isMissingBiddingTable(error)) return demoListings().filter((auction) => auction.status === "open");
    throw error;
  }
  return data?.map((auction) => ({ ...auction, crops: { name: auction.crop_name } })) || [];
}

export async function createAuctionDirectly({ farmerId, cropId, cropName, quantity, basePrice }) {
  if (!farmerId || !cropId) throw new Error("Farmer and crop details are required.");
  const parsedQuantity = Number(quantity);
  const parsedBasePrice = Number(basePrice);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) throw new Error("Enter a valid quantity.");
  if (!Number.isFinite(parsedBasePrice) || parsedBasePrice <= 0) throw new Error("Enter a valid base price.");

  if (!supabase) {
    const cropNames = { cr1: "Paddy (Grade A)", cr2: "Cotton (Long Staple)", cr3: "Maize" };
    const listing = { id: `demo-auction-${Date.now()}`, farmer_id: farmerId, crop_id: cropId, quantity: parsedQuantity, base_price: parsedBasePrice, status: "open", crops: { name: cropName || cropNames[cropId] || "Crop listing" }, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() };
    writeDemo(demoAuctionsKey, [listing, ...demoListings()]);
    return listing;
  }

  const client = requireClient();
  const { data, error } = await client
    .from("auctions")
    .insert({ farmer_id: farmerId, crop_id: cropId, crop_name: cropName || "Crop listing", quantity: parsedQuantity, base_price: parsedBasePrice, status: "open", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() })
    .select("*")
    .single();

  if (!error) return { ...data, crops: { name: data.crop_name } };
  if (!isMissingBiddingTable(error)) throw error;
  const cropNames = { cr1: "Paddy (Grade A)", cr2: "Cotton (Long Staple)", cr3: "Maize" };
  const listing = { id: `demo-auction-${Date.now()}`, farmer_id: farmerId, crop_id: cropId, quantity: parsedQuantity, base_price: parsedBasePrice, status: "open", crops: { name: cropName || cropNames[cropId] || "Crop listing" }, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() };
  writeDemo(demoAuctionsKey, [listing, ...demoListings()]);
  return listing;
}

export async function getFarmerAuctions(farmerId) {
  if (!farmerId) return [];
  if (!supabase) return demoListings().filter((auction) => belongsToFarmer(auction, farmerId));
  const client = requireClient();
  const { data, error } = await client
    .from("auctions")
    .select("*")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) {
    if (useDemoFallback(error) || isMissingBiddingTable(error)) return demoListings().filter((auction) => belongsToFarmer(auction, farmerId));
    throw error;
  }
  return data?.map((auction) => ({ ...auction, crops: { name: auction.crop_name } })) || [];
}

export async function getFarmerBidNotifications(farmerId) {
  if (!farmerId) return [];
  const localNotifications = readDemo(demoNotificationsKey, []).filter((notification) => notification?.farmer_id === farmerId);
  if (!supabase) return localNotifications;

  try {
    const { data } = await supabase
      .from("auction_notifications")
      .select("id, auction_id, bid_id, title, message, created_at, is_read")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false });
    return [...localNotifications, ...(data || [])];
  } catch {
    return localNotifications;
  }
}

export async function getAdminBidNotifications() {
  const localNotifications = readDemo(demoNotificationsKey, []);
  if (!supabase) return localNotifications;
  try {
    const { data } = await supabase
      .from("auction_notifications")
      .select("id, auction_id, bid_id, farmer_id, title, message, created_at, is_read")
      .order("created_at", { ascending: false });
    return [...localNotifications, ...(data || [])];
  } catch {
    return localNotifications;
  }
}
