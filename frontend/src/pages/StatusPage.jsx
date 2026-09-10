import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, useLiveSync } from "../services/api";
import { Card, Badge, CircularProgress, Eyebrow } from "../components/ui";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";

export default function StatusPage() {
  const { tokenId } = useParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [queueEntry, setQueueEntry] = useState(null);
  const [error, setError] = useState("");
  const syncTick = useLiveSync();

  useEffect(() => {
    if (!tokenId) return;
    setLoading(true);
    api.getQueueEntry(tokenId)
      .then(data => {
        setQueueEntry(data);
        setError("");
      })
      .catch(err => setError(err.message || "Failed to load status"))
      .finally(() => setLoading(false));
  }, [tokenId, syncTick]);

  if (loading && !queueEntry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <CircularProgress size="lg" className="text-brand" />
      </div>
    );
  }

  if (error || !queueEntry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Token</h2>
          <p className="text-slate-600 mb-6">{error || "This token does not exist or has expired."}</p>
          <Link to="/" className="text-brand font-bold hover:underline">Return to Home</Link>
        </Card>
      </div>
    );
  }

  const { token, position, estimated_wait_mins, status } = queueEntry;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brand mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Home
          </Link>
          <Eyebrow>LIVE TRACKING</Eyebrow>
          <h1 className="text-3xl font-display font-extrabold text-forest mt-1">Status Update</h1>
        </div>

        <Card className="p-8 border-t-4 border-t-brand shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Clock className="w-32 h-32" />
          </div>
          
          <div className="text-center mb-8 relative z-10">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Token Number</p>
            <div className="inline-block bg-brand/10 text-brand px-6 py-2 rounded-xl border border-brand/20 font-mono text-3xl font-extrabold tracking-widest shadow-inner">
              {token?.token_number}
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-line">
              <span className="text-sm font-bold text-muted">Current Status</span>
              <Badge tone={status === "PAID" ? "success" : status === "BOOKED" ? "default" : "warning"} className="text-sm px-3 py-1">
                {status}
              </Badge>
            </div>

            {status !== "PAID" && status !== "COMPLETED" && position > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600/70 mb-1">Queue Position</p>
                  <p className="text-2xl font-mono font-extrabold text-blue-700">#{position}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600/70 mb-1">Est. Wait</p>
                  <p className="text-2xl font-mono font-extrabold text-amber-700">{estimated_wait_mins}m</p>
                </div>
              </div>
            )}

            {status === "PAID" && (
              <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-800">Process Completed</p>
                <p className="text-sm text-green-700 mt-1">Payment has been transferred to your account.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
