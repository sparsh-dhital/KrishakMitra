import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Clock3, FilePenLine, ShieldAlert } from "lucide-react";
import { api } from "../services/api";
import { Button, Card, Input, Eyebrow } from "../components/ui";

const statusStyles = {
  approved: "bg-green-50 text-green-700 border-green-200",
  denied: "bg-red-50 text-red-700 border-red-200",
  changes_requested: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function FarmerProfilePage({ farmerId, farmerName }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    village: "",
    aadhaar_ref: "",
    land_details: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getFarmer(farmerId).then((data) => {
      setProfile(data);
      setForm({
        name: data.name || data.full_name || farmerName || "",
        phone: data.phone || data.mobile_number || "",
        village: data.village || "",
        aadhaar_ref: data.aadhaar_ref || "",
        land_details: data.land_details?.description || data.land_details || "",
      });
    });
  }, [farmerId, farmerName]);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateFarmerProfile(farmerId, {
        ...form,
        land_details: { description: form.land_details },
      });
      setProfile(updated);
      toast.success("Profile submitted for KYC review.");
    } catch (error) {
      toast.error(error.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile)
    return <div className="p-8 text-center text-muted">Loading profile...</div>;
  const status = profile.kyc_status || "pending";
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Eyebrow>YOUR PROFILE</Eyebrow>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-forest">
          Farmer profile
        </h1>
        <p className="mt-2 text-muted">
          Keep your details accurate for faster procurement.
        </p>
      </div>
      <Card className="border-brand/20 bg-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-harvest">
              <FilePenLine />
            </div>
            <div>
              <p className="font-bold text-forest">KYC verification</p>
              <p className="text-sm text-muted">
                {profile.kyc_note || "Submit your details for admin review."}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusStyles[status] || statusStyles.pending}`}
          >
            {status.replace("_", " ")}
          </span>
        </div>
        {status === "approved" && (
          <p className="mt-5 flex items-center gap-2 text-sm font-bold text-green-700">
            <CheckCircle2 className="h-5 w-5" /> Your KYC is approved. No repeat
            verification is needed.
          </p>
        )}
        {status === "pending" && (
          <p className="mt-5 flex items-center gap-2 text-sm font-bold text-muted">
            <Clock3 className="h-5 w-5" /> Admin review is required before your
            next booking.
          </p>
        )}
        {status === "changes_requested" && (
          <p className="mt-5 flex items-center gap-2 text-sm font-bold text-amber-700">
            <ShieldAlert className="h-5 w-5" /> Please update the requested
            details and submit again.
          </p>
        )}
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-forest">
            Full name
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="mt-2"
            />
          </label>
          <label className="text-sm font-bold text-forest">
            Phone number
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
              className="mt-2"
            />
          </label>
          <label className="text-sm font-bold text-forest">
            Village
            <Input
              value={form.village}
              onChange={(e) => update("village", e.target.value)}
              required
              className="mt-2"
            />
          </label>
          <label className="text-sm font-bold text-forest">
            Aadhaar reference
            <Input
              value={form.aadhaar_ref}
              onChange={(e) => update("aadhaar_ref", e.target.value)}
              required
              className="mt-2"
            />
          </label>
          <label className="text-sm font-bold text-forest sm:col-span-2">
            Land details
            <Input
              value={form.land_details}
              onChange={(e) => update("land_details", e.target.value)}
              className="mt-2"
            />
          </label>
          <Button type="submit" disabled={saving} className="sm:col-span-2">
            {saving ? "Submitting..." : "Save and submit for KYC"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
