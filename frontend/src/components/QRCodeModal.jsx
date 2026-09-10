import { useState } from "react";
import QRCode from "react-qr-code";

/**
 * QRCodeModal — A self-contained, production-ready modal for displaying
 * a dynamic QR gate pass with full booking metadata.
 *
 * Props:
 *   isOpen    — boolean controlling visibility
 *   onClose   — callback to close the modal
 *   slotData  — { booking, token, farmerName, centreName }
 */
export default function QRCodeModal({ isOpen, onClose, slotData }) {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  // ── Safely extract data with fallbacks ──────────────────────────
  const booking = slotData?.booking || {};
  const token = slotData?.token || {};
  const farmerName =
    slotData?.farmerName || booking.farmer_name || "Unknown Farmer";
  const centreName = slotData?.centreName || "Unknown Centre";
  const centreId = booking.centre_id || "N/A";
  const ticketId = booking.id || token.id || "N/A";
  const tokenNumber = token.token_number || "N/A";
  const status = booking.status || "BOOKED";
  const date = booking.date || new Date().toISOString().split("T")[0];
  const slotTime = booking.slot_time || "N/A";
  const estimatedFare = booking.estimated_fare || 0;
  const totalQuantity = booking.estimated_quantity || 0;

  const crops = (booking.crops || []).map((c) => ({
    name: c.crop_name || "Unknown",
    quantity: Number(c.quantity) || 0,
  }));

  // ── JSON payload for QR ─────────────────────────────────────────
  const qrPayload = JSON.stringify({
    ticketId,
    tokenNumber,
    farmerName,
    crops,
    totalQuantity,
    centerId: centreId,
    centreName,
    slotTime,
    date,
    status,
    estimatedFare,
  });

  // ── Verify Pass simulation ──────────────────────────────────────
  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1500);
  };

  const handleClose = () => {
    setVerified(false);
    setVerifying(false);
    onClose();
  };

  // ── Status badge color ──────────────────────────────────────────
  const statusColors = {
    BOOKED: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
    CHECKED_IN: { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
    WAITING: { bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA" },
    WEIGHING: { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
    QUALITY_CHECK: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
    ACCEPTED: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
    PAID: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  };
  const sc = statusColors[status] || statusColors.BOOKED;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div
        style={styles.modalContainer}
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────── */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerEyebrow}>DIGITAL GATE PASS</p>
            <h2 style={styles.headerTitle}>KrishakMitra</h2>
          </div>
          <button style={styles.closeButton} onClick={handleClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Ticket tear line ──────────────────────────────── */}
        <div style={styles.tearLine}>
          <div style={styles.tearCircleLeft} />
          <div style={styles.tearDash} />
          <div style={styles.tearCircleRight} />
        </div>

        {/* ── QR Code ───────────────────────────────────────── */}
        <div style={styles.qrSection}>
          <div style={styles.qrWrapper}>
            <QRCode
              value={qrPayload}
              size={220}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#0A2A1B"
              style={{ width: "100%", height: "auto", maxWidth: 220 }}
            />
          </div>
          <p style={styles.tokenLabel}>Token</p>
          <p style={styles.tokenNumber}>{tokenNumber}</p>
        </div>

        {/* ── Metadata Grid ─────────────────────────────────── */}
        <div style={styles.metaSection}>
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <p style={styles.metaLabel}>Farmer</p>
              <p style={styles.metaValue}>{farmerName}</p>
            </div>
            <div style={{ ...styles.metaItem, textAlign: "right" }}>
              <p style={styles.metaLabel}>Date</p>
              <p style={styles.metaValue}>{date}</p>
            </div>
          </div>

          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <p style={styles.metaLabel}>Centre</p>
              <p style={styles.metaValue}>{centreName}</p>
            </div>
            <div style={{ ...styles.metaItem, textAlign: "right" }}>
              <p style={styles.metaLabel}>Slot Time</p>
              <p style={styles.metaValue}>{slotTime}</p>
            </div>
          </div>

          <div style={styles.cropSection}>
            <p style={styles.metaLabel}>Crops</p>
            {crops.length > 0 ? (
              crops.map((c, i) => (
                <div key={i} style={styles.cropRow}>
                  <span style={styles.cropName}>{c.name}</span>
                  <span style={styles.cropQty}>{c.quantity} q</span>
                </div>
              ))
            ) : (
              <p style={styles.metaValue}>No crops specified</p>
            )}
          </div>

          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <p style={styles.metaLabel}>Total Quantity</p>
              <p style={styles.metaValueBold}>{totalQuantity} quintals</p>
            </div>
            <div style={{ ...styles.metaItem, textAlign: "right" }}>
              <p style={styles.metaLabel}>Estimated Fare</p>
              <p style={styles.fareValue}>
                ₹ {estimatedFare.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div style={styles.statusRow}>
            <p style={styles.metaLabel}>Status</p>
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: sc.bg,
                color: sc.text,
                borderColor: sc.border,
              }}
            >
              {status}
            </span>
          </div>
        </div>

        {/* ── Footer / Verify ───────────────────────────────── */}
        <div style={styles.footer}>
          {verified ? (
            <div style={styles.verifiedBanner}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#065F46"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span style={styles.verifiedText}>Gate Pass Verified ✓</span>
            </div>
          ) : (
            <button
              style={{
                ...styles.verifyButton,
                opacity: verifying ? 0.7 : 1,
                cursor: verifying ? "not-allowed" : "pointer",
              }}
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <span style={styles.spinner} />
                  Verifying...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Verify Pass
                </>
              )}
            </button>
          )}
          <p style={styles.footerHint}>
            Present this QR code at the mandi gate
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Inline styles — zero CSS file dependencies
// ════════════════════════════════════════════════════════════════
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    animation: "qrFadeIn 0.2s ease-out",
  },
  modalContainer: {
    width: "100%",
    maxWidth: "420px",
    maxHeight: "90vh",
    overflowY: "auto",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y",
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
    animation: "qrSlideUp 0.3s ease-out",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 24px 16px",
    background: "linear-gradient(135deg, #0A2A1B 0%, #14532D 100%)",
    borderRadius: "24px 24px 0 0",
    color: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
  },
  headerEyebrow: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#86EFAC",
    margin: 0,
  },
  headerTitle: {
    fontSize: "22px",
    fontWeight: 800,
    margin: "4px 0 0",
    color: "#FFFFFF",
  },
  closeButton: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#FFFFFF",
    transition: "background 0.2s",
  },
  tearLine: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    marginTop: "-12px",
    zIndex: 2,
  },
  tearCircleLeft: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    marginLeft: "-12px",
    flexShrink: 0,
  },
  tearDash: {
    flex: 1,
    borderTop: "2px dashed #E2E8F0",
    margin: "0 4px",
  },
  tearCircleRight: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    marginRight: "-12px",
    flexShrink: 0,
  },
  qrSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 24px 16px",
  },
  qrWrapper: {
    padding: "16px",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "2px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tokenLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#94A3B8",
    margin: "16px 0 4px",
  },
  tokenNumber: {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#0A2A1B",
    margin: 0,
    padding: "4px 20px",
    backgroundColor: "#F0FDF4",
    borderRadius: "12px",
    border: "1px solid #BBF7D0",
  },
  metaSection: {
    padding: "0 24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
  },
  metaLabel: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#94A3B8",
    margin: "0 0 2px",
  },
  metaValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1E293B",
    margin: 0,
    wordBreak: "break-word",
  },
  metaValueBold: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#0A2A1B",
    margin: 0,
  },
  fareValue: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#B45309",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    margin: 0,
  },
  cropSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: "12px",
    padding: "12px",
    border: "1px solid #E2E8F0",
  },
  cropRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
  },
  cropName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1E293B",
  },
  cropQty: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#0A2A1B",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    padding: "4px 12px",
    borderRadius: "20px",
    border: "1px solid",
  },
  footer: {
    padding: "16px 24px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    borderTop: "1px solid #F1F5F9",
  },
  verifyButton: {
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#FFFFFF",
    backgroundColor: "#187948",
    border: "none",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(24,121,72,0.3)",
  },
  verifiedBanner: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#ECFDF5",
    border: "2px solid #A7F3D0",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  verifiedText: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#065F46",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#FFFFFF",
    borderRadius: "50%",
    animation: "qrSpin 0.6s linear infinite",
  },
  footerHint: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#94A3B8",
    margin: 0,
    textAlign: "center",
  },
};

// ── Inject keyframe animations (runs once) ────────────────────────
if (
  typeof document !== "undefined" &&
  !document.getElementById("qr-modal-keyframes")
) {
  const styleEl = document.createElement("style");
  styleEl.id = "qr-modal-keyframes";
  styleEl.textContent = `
    @keyframes qrFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes qrSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes qrSpin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(styleEl);
}
