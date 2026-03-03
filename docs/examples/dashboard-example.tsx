import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from "recharts";

/* ═══════════════════════ RESPONSIVE HOOK ═══════════════════════ */
function useWindowSize() {
  const [size, setSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1400, h: typeof window !== "undefined" ? window.innerHeight : 900 });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

/* breakpoints: mobile < 768, tablet 768-1079, desktop >= 1080 */
const BP = { mobile: 768, tablet: 1080 };

/* ───────────────────────── DATA ───────────────────────── */
const occupancyData = [
  { day: "01", av: 45, oc: 30, nr: -10 },
  { day: "-", av: 40, oc: 25, nr: -8 },
  { day: "03", av: 55, oc: 35, nr: -15 },
  { day: "-", av: 48, oc: 28, nr: -12 },
  { day: "-", av: 42, oc: 32, nr: -10 },
  { day: "06", av: 70, oc: 50, nr: -25 },
  { day: "-", av: 60, oc: 40, nr: -20 },
  { day: "-", av: 55, oc: 38, nr: -18 },
  { day: "09", av: 90, oc: 60, nr: -35 },
  { day: "-", av: 80, oc: 55, nr: -30 },
  { day: "-", av: 75, oc: 50, nr: -28 },
  { day: "12", av: 110, oc: 70, nr: -45 },
  { day: "-", av: 100, oc: 65, nr: -40 },
  { day: "-", av: 95, oc: 62, nr: -38 },
  { day: "15", av: 160, oc: 100, nr: -70 },
  { day: "-", av: 140, oc: 90, nr: -60 },
  { day: "-", av: 130, oc: 85, nr: -55 },
  { day: "18", av: 200, oc: 120, nr: -90 },
  { day: "-", av: 180, oc: 110, nr: -80 },
  { day: "-", av: 170, oc: 105, nr: -75 },
  { day: "21", av: 140, oc: 85, nr: -50 },
  { day: "-", av: 130, oc: 80, nr: -45 },
  { day: "-", av: 125, oc: 78, nr: -42 },
  { day: "24", av: 150, oc: 90, nr: -55 },
  { day: "-", av: 140, oc: 85, nr: -50 },
  { day: "-", av: 135, oc: 82, nr: -48 },
  { day: "27", av: 100, oc: 65, nr: -35 },
  { day: "-", av: 95, oc: 60, nr: -32 },
  { day: "-", av: 90, oc: 58, nr: -30 },
  { day: "30", av: 70, oc: 45, nr: -20 },
];
const arrivalsData = [
  { id: "#105", name: "Marvin McKinney", time: "10 minutes ago", color: "#5B8C5A", initial: "M" },
  { id: "#105", name: "Albert Flores", time: "2 minutes ago", color: "#C4A67D", initial: "A" },
  { id: "#107", name: "Guy Hawkins", time: "2 hours ago", color: "#6BAF6B", initial: "G" },
  { id: "#108", name: "Brooklyn Simmons", time: "12 hours ago", color: "#9B6B9B", initial: "B" },
  { id: "#108", name: "Cody Fisher", time: "22 hours ago", color: "#C49070", initial: "C" },
  { id: "#108", name: "Darlene Robertson", time: "3 days ago", color: "#6B6BC4", initial: "D" },
];
const platformData = [
  { name: "Booking.com", pct: 90, color: "#4A7C3F" },
  { name: "Airbnb.com", pct: 70, color: "#D45454" },
  { name: "Agoda.com", pct: 50, color: "#8DB83E" },
  { name: "Hotels.com", pct: 40, color: "#5B5BC0" },
];

/* ───────────────────────── ANIMATED NUMBER ───────────────────────── */
function AnimNum({ value, prefix = "", duration = 1200 }) {
  const [d, setD] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setD(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <>{prefix}{d.toLocaleString()}</>;
}

/* ───────────────────────── ICON MAP ───────────────────────── */
const iconMap = {
  dashboard: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="5.5" height="5.5" rx="1.2"/><rect x="10.5" y="2" width="5.5" height="5.5" rx="1.2"/><rect x="2" y="10.5" width="5.5" height="5.5" rx="1.2"/><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.2"/></svg>,
  calendar: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3.5" width="14" height="12" rx="2"/><path d="M2 7.5h14M6 1.5v3M12 1.5v3"/></svg>,
  door: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="1.5" width="12" height="15" rx="2"/><circle cx="12" cy="9.5" r="1"/></svg>,
  users: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.5"/><path d="M1.5 16c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="13" cy="6.5" r="2"/><path d="M13 10.5c2.2 0 4 1.8 4 4"/></svg>,
  user: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="3"/><path d="M3 16.5c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  star: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2l2.2 4.5 5 .7-3.6 3.5.8 5L9 13.4l-4.4 2.3.8-5L1.8 7.2l5-.7z"/></svg>,
  file: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1.5H5a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V6.5z"/><path d="M10 1.5v5h5"/></svg>,
  tool: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5a4.5 4.5 0 00-5.6 5.6L2 12.5 3.5 14l2 1.5 4.4-4.4A4.5 4.5 0 0012 2.5z"/></svg>,
  box: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="5" width="15" height="11" rx="1.5"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h5A1.5 1.5 0 0113 3.5V5"/></svg>,
  upload: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14V4M5 8l4-4 4 4M3 14h12"/></svg>,
  settings: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.5"/><path d="M14.5 11a1 1 0 00.2 1.1l.1.1a1.2 1.2 0 01-1.7 1.7l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9v.3a1.2 1.2 0 01-2.4 0v-.2a1 1 0 00-.7-.9 1 1 0 00-1.1.2l-.1.1a1.2 1.2 0 01-1.7-1.7l.1-.1A1 1 0 005.5 11a1 1 0 00-.9-.6h-.3a1.2 1.2 0 010-2.4h.2a1 1 0 00.9-.7 1 1 0 00-.2-1.1l-.1-.1a1.2 1.2 0 011.7-1.7l.1.1a1 1 0 001.1.2h0a1 1 0 00.6-.9v-.3a1.2 1.2 0 012.4 0v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a1.2 1.2 0 011.7 1.7l-.1.1a1 1 0 00-.2 1.1v0a1 1 0 00.9.6h.3a1.2 1.2 0 010 2.4h-.2a1 1 0 00-.9.6z"/></svg>,
  bell: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 6.5a4.5 4.5 0 00-9 0c0 5-2.25 6.5-2.25 6.5h13.5s-2.25-1.5-2.25-6.5"/><path d="M10.3 15a1.5 1.5 0 01-2.6 0"/></svg>,
  help: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7"/><path d="M6.5 6.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="9" cy="13" r=".5" fill="currentColor"/></svg>,
};

/* ───────────────────────── SIDEBAR ───────────────────────── */
function Sidebar({ open, onClose, isMobile }) {
  const [active, setActive] = useState("Dashboard");
  const sections = [
    { label: "DAILY OPERATION", items: [
      { name: "Dashboard", icon: "dashboard" },
      { name: "Reservation", icon: "calendar", dd: true },
      { name: "Room Operation", icon: "door" },
      { name: "Manage Staff", icon: "users", dd: true },
      { name: "Manage Guests", icon: "user", dd: true },
      { name: "Promotions", icon: "star" },
    ]},
    { label: "ACCOUNTING", items: [
      { name: "Report", icon: "file", dd: true },
      { name: "Maintenance", icon: "tool" },
    ]},
    { label: "SYSTEM OPTIONS", items: [
      { name: "Manage Platform", icon: "box" },
      { name: "Upgrade Plan", icon: "upload" },
      { name: "Settings", icon: "settings" },
    ]},
  ];

  const sidebarContent = (
    <aside className="sidebar-aside">
      {/* Logo */}
      <div style={{ padding: "20px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "#4A7C59", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>F</div>
          <span style={{ fontWeight: 700, fontSize: 15.5, color: "#1A1A1A", letterSpacing: -0.2 }}>Fixoria <sup style={{ fontSize: 8, fontWeight: 600 }}>™</sup></span>
        </div>
        {isMobile ? (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#777", display: "flex" }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l10 10M14 4L4 14"/></svg>
          </button>
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #DDD", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="12" height="12" fill="none" stroke="#888" strokeWidth="1.5"><rect x="1" y="1" width="4" height="10" rx="1"/><rect x="7" y="1" width="4" height="10" rx="1"/></svg>
          </div>
        )}
      </div>

      {/* Hotel Selector */}
      <div style={{ padding: "6px 18px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E6E3DD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#6B6B6B" }}>G</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1A1A" }}>Grand Sylhet Hotel</div>
          <div style={{ fontSize: 10.5, color: "#A0A0A0" }}>3 admin added</div>
        </div>
        <svg width="12" height="12" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }} className="hide-scrollbar">
        {sections.map((sec, si) => (
          <div key={si}>
            <div style={{ padding: "14px 8px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: "#A8A8A8", textTransform: "uppercase" }}>
              {sec.label}
              <span style={{ color: "#C8C8C8", fontSize: 14, lineHeight: 1, cursor: "pointer" }}>—</span>
            </div>
            {sec.items.map((item) => {
              const isA = active === item.name;
              return (
                <button key={item.name} onClick={() => { setActive(item.name); if (isMobile) onClose(); }} style={{
                  display: "flex", alignItems: "center", gap: 9, width: "100%",
                  padding: "7px 10px", borderRadius: 8, border: isA ? "1px solid #E0DDD6" : "1px solid transparent",
                  background: isA ? "#F0EDE7" : "transparent", color: isA ? "#1A1A1A" : "#5A5A5A",
                  fontSize: 13, fontWeight: isA ? 600 : 400, cursor: "pointer",
                  fontFamily: "inherit", textAlign: "left", transition: "all 0.15s", marginBottom: 1,
                }}>
                  <span style={{ display: "flex", opacity: 0.6, flexShrink: 0 }}>{iconMap[item.icon]}</span>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  {item.dd && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ padding: "0 10px 6px" }}>
        <button style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 10px", borderRadius: 8, border: "none", background: "transparent", color: "#5A5A5A", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative" }}>
          <span style={{ display: "flex", opacity: 0.6 }}>{iconMap.bell}</span>
          Notifications
          <span style={{ position: "absolute", left: 22, top: 3, width: 16, height: 16, borderRadius: "50%", background: "#E8453C", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>5</span>
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 10px", borderRadius: 8, border: "none", background: "transparent", color: "#5A5A5A", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <span style={{ display: "flex", opacity: 0.6 }}>{iconMap.help}</span>
          Support
        </button>
      </div>

      {/* Profile */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #EEECE8", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #C4A882, #A08060)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 600 }}>RA</div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1A1A" }}>Rahat Ali</div>
          <div style={{ fontSize: 10.5, color: "#A0A0A0" }}>Super Admin</div>
        </div>
      </div>
    </aside>
  );

  /* Mobile: overlay drawer */
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 998,
            opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        />
        {/* Drawer */}
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 260, zIndex: 999,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(.16,1,.3,1)",
        }}>
          {sidebarContent}
        </div>
      </>
    );
  }

  /* Desktop/Tablet: static sidebar */
  return sidebarContent;
}

/* ───────────────────────── SMALL SELECT ───────────────────────── */
function Select({ value }) {
  return (
    <div style={{
      padding: "6px 28px 6px 10px", borderRadius: 7, border: "1px solid #DEDBD5",
      fontSize: 12, color: "#5A5A5A", background: "#fff", cursor: "pointer",
      whiteSpace: "nowrap", userSelect: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
    }}>{value}</div>
  );
}

/* ───────────────────────── STAT CARD ───────────────────────── */
function StatCard({ title, value, subtitle, change, positive, delay = 0 }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div className="stat-card" style={{
      flex: "1 1 0", minWidth: 0, background: "#fff", borderRadius: 12,
      border: "1px solid #EEEDEA", padding: "16px 18px",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(8px)",
      transition: "all 0.5s cubic-bezier(.16,1,.3,1)",
    }}>
      <div style={{ fontSize: 12, color: "#8A8A8A", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: "#1A1A1A", letterSpacing: -1, lineHeight: 1 }}>
          <AnimNum value={value} />
        </span>
        {title === "Check In" && (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M16 6L6 16" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/><path d="M6 8v8h8" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
        {title === "Check Out" && (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 16L16 6" stroke="#C75050" strokeWidth="2" strokeLinecap="round"/><path d="M8 6h8v8" stroke="#C75050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#A5A5A5" }}>
        <span>{subtitle}</span>
        <span style={{ color: positive ? "#4A7C59" : "#C75050", fontWeight: 600, fontSize: 11, display: "flex", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 8 }}>{positive ? "▲" : "▼"}</span>{change}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── OCCUPANCY CHART ───────────────────────── */
function OccupancyChart({ isMobile }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 300); }, []);

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #EEEDEA", padding: isMobile ? "14px 12px" : "18px 20px",
      opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
      transition: "all 0.6s cubic-bezier(.16,1,.3,1)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", marginBottom: 6 }}>Occupancy</div>
          <div style={{ display: "flex", gap: isMobile ? 10 : 16, alignItems: "center", flexWrap: "wrap" }}>
            {[{ c: "#6B8E6B", l: "Available" }, { c: "#3D5A3D", l: "Occupied" }, { c: "#C8C8C8", l: "Not Ready" }].map(({ c, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#888" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{l}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Select value="All Occupancy" />
          <Select value="30 Days" />
          <button style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #DEDBD5", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="#777" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
          </button>
        </div>
      </div>
      <div style={{ width: "100%", height: isMobile ? 200 : 250 }}>
        <ResponsiveContainer>
          <BarChart data={occupancyData} barGap={1} barCategoryGap="18%" margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10.5, fill: "#AAA" }} interval={0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10.5, fill: "#AAA" }} domain={[-100, 200]} ticks={[-100, -50, 0, 50, 100, 200]} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} contentStyle={{ borderRadius: 8, border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,.06)", fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#E0E0DD" />
            <Bar dataKey="av" name="Available" fill="#A8C5A8" radius={[2, 2, 0, 0]} animationDuration={900} animationBegin={200} />
            <Bar dataKey="oc" name="Occupied" fill="#4A6B4A" radius={[2, 2, 0, 0]} animationDuration={900} animationBegin={400} />
            <Bar dataKey="nr" name="Not Ready" fill="#C8C8C5" radius={[0, 0, 2, 2]} animationDuration={900} animationBegin={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ───────────────────────── REVENUE OVERVIEW ───────────────────────── */
function RevenueOverview({ isMobile }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 500); }, []);

  return (
    <div style={{
      flex: "1 1 280px", minWidth: 0, background: "#fff", borderRadius: 12,
      border: "1px solid #EEEDEA", padding: isMobile ? "14px 14px" : "18px 20px",
      opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
      transition: "all 0.6s cubic-bezier(.16,1,.3,1)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>Revenue Overview</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10.5, color: "#A0A0A0", marginBottom: 2 }}>Total Revenue</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1A1A1A", letterSpacing: -0.5 }}>
            <AnimNum value={912120} prefix="$" duration={1400} />
          </div>
        </div>
        <Select value="30 Days" />
      </div>
      <div style={{ display: "flex", gap: isMobile ? 16 : 32, marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid #F0EFEB", flexWrap: "wrap" }}>
        {[{ icon: "money", label: "Offline Revenue", val: 612120 }, { icon: "monitor", label: "Platform Revenue", val: 300000 }].map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ opacity: 0.5 }}>
              {r.icon === "money"
                ? <svg width="22" height="22" fill="none" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="4.5" width="19" height="13" rx="2"/><circle cx="11" cy="11" r="2.5"/></svg>
                : <svg width="22" height="22" fill="none" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="18" height="12" rx="2"/><path d="M8 19h6M11 15v4"/></svg>
              }
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: "#A0A0A0" }}>{r.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>
                <AnimNum value={r.val} prefix="$" duration={1400} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {platformData.map((p, i) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#666", width: 85, flexShrink: 0 }}>{p.name}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 4, background: "#F0EDE7", overflow: "hidden" }}>
              <div style={{ width: show ? `${p.pct}%` : "0%", height: "100%", borderRadius: 4, background: p.color, transition: `width 1s cubic-bezier(.16,1,.3,1) ${i * 0.12 + 0.3}s` }} />
            </div>
            <span style={{ fontSize: 12, color: "#666", width: 30, textAlign: "right" }}>{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── RECENT ARRIVALS ───────────────────────── */
function RecentArrivals({ isMobile }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 600); }, []);

  return (
    <div style={{
      flex: "1 1 310px", minWidth: 0, background: "#fff", borderRadius: 12,
      border: "1px solid #EEEDEA", padding: isMobile ? "14px 12px" : "18px 20px",
      opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
      transition: "all 0.6s cubic-bezier(.16,1,.3,1)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>Recent Arrivals</div>
        <span style={{ fontSize: 12, color: "#555", cursor: "pointer", fontWeight: 500 }}>View All</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "38px 1fr 80px 28px" : "44px 1fr 110px 36px", padding: "6px 0", borderBottom: "1px solid #F0EFEB", fontSize: 10.5, color: "#A8A8A8", fontWeight: 500 }}>
        <span>R. No</span><span>Name</span><span>Time</span><span style={{ textAlign: "right" }}>Action</span>
      </div>
      {arrivalsData.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: isMobile ? "38px 1fr 80px 28px" : "44px 1fr 110px 36px", alignItems: "center", padding: "9px 0", borderBottom: i < arrivalsData.length - 1 ? "1px solid #F8F7F5" : "none", cursor: "pointer", transition: "background .12s" }}>
          <span style={{ fontSize: 12, color: "#777" }}>{r.id}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: r.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>{r.initial}</div>
            <span style={{ fontSize: 12.5, color: "#333", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
          </div>
          <span style={{ fontSize: 11.5, color: "#A5A5A5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.time}</span>
          <div style={{ textAlign: "right", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#BBB"><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/></svg>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── CALENDAR PANEL ───────────────────────── */
function CalendarPanel({ isMobile }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 350); }, []);

  const days = [
    { n: "01", d: "Sun" }, { n: "02", d: "Mon" }, { n: "03", d: "Tue" },
    { n: "04", d: "Wed" }, { n: "05", d: "Thu", today: true }, { n: "06", d: "Fri" }, { n: "07", d: "Sat" },
  ];

  const GuestTag = ({ name, info, color, initial, extra, style: s }) => (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: `${color}15`, border: `1px solid ${color}28`,
      borderRadius: 8, padding: "5px 8px", cursor: "pointer",
      transition: "transform .12s, box-shadow .12s", minWidth: 0, ...s,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 600, flexShrink: 0 }}>{initial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        <div style={{ fontSize: 8.5, color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{info}</div>
      </div>
      {extra && <span style={{ fontSize: 8.5, color: "#AAA", flexShrink: 0, whiteSpace: "nowrap" }}>{extra}</span>}
    </div>
  );

  const PlusBtn = () => (
    <div style={{ width: "100%", minHeight: 42, borderRadius: 8, border: "1.5px dashed #D0CEC8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#B0AEA6" }}>
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 2v10M2 7h10"/></svg>
    </div>
  );
  const RoomLabel = ({ id }) => <div style={{ fontSize: 10.5, fontWeight: 500, color: "#999", textAlign: "center", margin: "10px 0 5px" }}>{id}</div>;
  const GroupLabel = ({ text }) => <div style={{ textAlign: "center", fontSize: 8.5, letterSpacing: 4, color: "#CCC", fontWeight: 500, marginTop: 4, marginBottom: 2 }}>{text}</div>;

  return (
    <div className="calendar-panel" style={{
      background: "#fff", borderRadius: 12, border: "1px solid #EEEDEA",
      padding: "16px 16px 14px",
      width: isMobile ? "100%" : 310,
      minWidth: isMobile ? "unset" : 310,
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(10px)",
      transition: "all 0.6s cubic-bezier(.16,1,.3,1)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>Calendar</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9.5, color: "#A0A0A0" }}>
          <svg width="10" height="10" fill="none" stroke="#A0A0A0" strokeWidth="1.2"><circle cx="5" cy="5" r="4"/><path d="M5 3v2l1.2 1"/></svg>
          Every Check-out at 12:00 PM
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#A0A0A0", marginBottom: 12 }}>Recent activities of 12 rooms</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", marginBottom: 10 }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#777", display: "flex" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1A1A" }}>
          <span style={{ fontWeight: 700 }}>7 days</span> of November 2024 (1-7)
        </span>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#777", display: "flex" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 2l5 5-5 5"/></svg>
        </button>
      </div>

      <div style={{ marginBottom: 8 }}><Select value="Room #100-103" /></div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[{ t: "1 Bed (10)", a: false }, { t: "2 Beds (6)", a: true }, { t: "3 Beds (5)", a: false }].map((tab) => (
          <button key={tab.t} style={{ padding: "5px 14px", borderRadius: 20, border: tab.a ? "1.5px solid #1A1A1A" : "1px solid #DEDBD5", background: "#fff", fontSize: 11, color: tab.a ? "#1A1A1A" : "#888", fontWeight: tab.a ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{tab.t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: 8 }}>
        {days.map((d) => (
          <div key={d.n} style={{ position: "relative", padding: "2px 0" }}>
            {d.today && <span style={{ display: "inline-block", fontSize: 7.5, fontWeight: 700, color: "#4A7C59", background: "#E4F0E4", padding: "1px 5px", borderRadius: 3, marginBottom: 2 }}>TODAY</span>}
            <div style={{ fontSize: 11, color: "#555", fontWeight: 500, lineHeight: 1.5 }}>{d.n}</div>
            <div style={{ fontSize: 9.5, color: "#BBB" }}>{d.d}</div>
          </div>
        ))}
      </div>

      <RoomLabel id="Room #100" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 48px", gap: 4, marginBottom: 2 }}>
        <GuestTag name="Arlene McCoy" info="Check in at 08:10PM, Out at 11:30 PM" color="#6B8E6B" initial="A" />
        <PlusBtn />
      </div>

      <RoomLabel id="Room #101" />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 48px", gap: 4 }}>
          <GuestTag name="Hamid Khan" info="Check in at 08:10PM" color="#B07070" initial="H" />
          <PlusBtn />
        </div>
        <GuestTag name="Lane David" info="Check in at 08:10PM" color="#C4A882" initial="L" extra="child - 8 years old" />
        <GuestTag name="Mayesha" info="Check in at 08:10PM" color="#C4B882" initial="M" />
      </div>
      <GroupLabel text="F A M I L Y" />

      <RoomLabel id="Room #102" />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <GuestTag name="Cody Fisher" info="Check in at 08:10PM, Out at 11:30 PM" color="#8B7B6B" initial="C" />
          <GuestTag name="Darlene Robertson" info="Check in at 08:10PM" color="#C49070" initial="D" />
        </div>
        <GuestTag name="Brooklyn Simmons" info="Check in at 08:10PM, Out at 11:30 PM" color="#6B8E6B" initial="B" />
      </div>
      <GroupLabel text="F R I E N D S" />

      <RoomLabel id="Room #103" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
        <GuestTag name="Floyd Miles" info="Check in at 08:10PM, Out at 11:30 PM" color="#8B7B6B" initial="F" />
        <GuestTag name="Dianne Russell" info="Check in at 08:10PM" color="#C49070" initial="D" />
      </div>

      <button style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #DEDBD5", background: "#fff", fontSize: 13, fontWeight: 500, color: "#333", cursor: "pointer", fontFamily: "inherit", transition: "background .12s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#F8F7F5"}
        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
      >Full View</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function FixoriaDashboard() {
  const { w } = useWindowSize();
  const isMobile = w < BP.mobile;
  const isTablet = w >= BP.mobile && w < BP.tablet;
  const isDesktop = w >= BP.tablet;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Stat cards: wrap to column on mobile */
  const statLayout = isMobile
    ? { display: "flex", flexDirection: "column", gap: 12 }
    : { display: "flex", gap: 14 };

  /* Revenue + Arrivals: always wrap, full-width on mobile */
  const bottomRowStyle = isMobile
    ? { display: "flex", flexDirection: "column", gap: 12 }
    : { display: "flex", gap: 14, flexWrap: "wrap" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html, body, #root { height:100%; width:100%; }

        /* ─── GLOBAL: hide ALL scrollbars everywhere ─── */
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }

        /* ─── ONLY the main scroll container gets a styled scrollbar ─── */
        .main-scroll { scrollbar-width: thin !important; scrollbar-color: #D8D5CE transparent !important; }
        .main-scroll::-webkit-scrollbar { display: block !important; width: 5px !important; }
        .main-scroll::-webkit-scrollbar-track { background: transparent !important; }
        .main-scroll::-webkit-scrollbar-thumb { background: #D8D5CE !important; border-radius: 4px !important; }
        .main-scroll::-webkit-scrollbar-thumb:hover { background: #BBB !important; }

        /* sidebar inner */
        .sidebar-aside {
          width: 100%; height: 100%; background: #FAFAF8;
          display: flex; flex-direction: column;
          border-right: 1px solid #EEECE8;
          font-family: inherit; font-size: 13px;
        }
        .hide-scrollbar { overflow-y: auto; }

        /* Hamburger button */
        .hamburger-btn {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid #DEDBD5; background: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <div style={{
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        width: "100%", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isMobile ? "#F4F2EE" : "#E8E5DE",
        padding: isMobile ? 0 : isTablet ? 10 : 18,
      }}>
        {/* ─── Window Frame ─── */}
        <div style={{
          width: "100%", maxWidth: 1440,
          height: isMobile ? "100vh" : "calc(100vh - " + (isTablet ? 20 : 36) + "px)",
          background: "#F4F2EE",
          borderRadius: isMobile ? 0 : 20,
          overflow: "hidden", display: "flex", flexDirection: "row",
          boxShadow: isMobile ? "none" : "0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        }}>

          {/* ─── Sidebar ─── */}
          {isMobile ? (
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={true} />
          ) : (
            <div style={{ width: 220, minWidth: 220, height: "100%", flexShrink: 0 }}>
              <Sidebar open={true} onClose={() => {}} isMobile={false} />
            </div>
          )}

          {/* ─── Main scrollable area (SINGLE scroll) ─── */}
          <div className="main-scroll" style={{
            flex: 1, overflowY: "auto", overflowX: "hidden",
          }}>
            <div style={{
              padding: isMobile ? "16px 14px 24px" : isTablet ? "20px 18px 28px" : "22px 22px 28px 26px",
              display: "flex", flexDirection: "column", gap: 14,
              minHeight: "100%",
            }}>

              {/* ─── Header ─── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {isMobile && (
                    <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
                      <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round"><path d="M3 5h12M3 9h12M3 13h12"/></svg>
                    </button>
                  )}
                  <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#1A1A1A", letterSpacing: -0.5 }}>Dashboard</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Search — hide text on very small screens */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 12px", borderRadius: 8,
                    border: "1px solid #DEDBD5", background: "#fff",
                    fontSize: 12.5, color: "#B0B0B0", cursor: "pointer",
                    minWidth: isMobile ? "unset" : 160,
                  }}>
                    <svg width="14" height="14" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="4.5"/><path d="M13 13l-3-3"/></svg>
                    {!isMobile && <>Search...</>}
                    {!isMobile && (
                      <span style={{ marginLeft: "auto", fontSize: 10.5, padding: "1px 5px", borderRadius: 4, border: "1px solid #DDD", color: "#BBB", fontWeight: 500 }}>⌘F</span>
                    )}
                  </div>
                  <button style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #DEDBD5", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#999"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg>
                  </button>
                </div>
              </div>

              {/* ─── Stat + Calendar row on desktop ─── */}
              {isDesktop ? (
                /* Desktop: main content left, calendar right */
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Left column */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <StatCard title="Total Booking" value={12120} subtitle="Total Booking last 365 days" change="+10%" positive delay={0} />
                      <StatCard title="Check In" value={6190} subtitle="Check In last 365 days" change="+16%" positive delay={100} />
                      <StatCard title="Check Out" value={4896} subtitle="Check Out last 365 days" change="-15%" positive={false} delay={200} />
                    </div>
                    <OccupancyChart isMobile={false} />
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <RevenueOverview isMobile={false} />
                      <RecentArrivals isMobile={false} />
                    </div>
                  </div>
                  {/* Right: Calendar */}
                  <CalendarPanel isMobile={false} />
                </div>
              ) : (
                /* Tablet & Mobile: everything stacked */
                <>
                  <div style={statLayout}>
                    <StatCard title="Total Booking" value={12120} subtitle="Total Booking last 365 days" change="+10%" positive delay={0} />
                    <StatCard title="Check In" value={6190} subtitle="Check In last 365 days" change="+16%" positive delay={100} />
                    <StatCard title="Check Out" value={4896} subtitle="Check Out last 365 days" change="-15%" positive={false} delay={200} />
                  </div>
                  <OccupancyChart isMobile={isMobile} />
                  <div style={bottomRowStyle}>
                    <RevenueOverview isMobile={isMobile} />
                    <RecentArrivals isMobile={isMobile} />
                  </div>
                  <CalendarPanel isMobile={true} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
