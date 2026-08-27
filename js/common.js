/* ============================================================
   Shared UI helpers — icons, badges, toast, modal, appbar
   Namespace: window.UI
   ============================================================ */
(function () {
  /* ---- Inline SVG icons (Lucide-style, stroke) ---- */
  const P = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const ICONS = {
    scale: `<svg viewBox="0 0 24 24" ${P}><path d="M12 3v18M7 21h10M5 7h14l-2-3H7L5 7Z"/><path d="M5 7 2 14a3 3 0 0 0 6 0L5 7Zm14 0-3 7a3 3 0 0 0 6 0l-3-7Z"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" ${P}><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
    check: `<svg viewBox="0 0 24 24" ${P}><path d="m20 6-11 11-5-5"/></svg>`,
    checkCircle: `<svg viewBox="0 0 24 24" ${P}><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" ${P}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" ${P}><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" ${P}><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    xCircle: `<svg viewBox="0 0 24 24" ${P}><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>`,
    search: `<svg viewBox="0 0 24 24" ${P}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" ${P}><path d="M12 5v14M5 12h14"/></svg>`,
    file: `<svg viewBox="0 0 24 24" ${P}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/></svg>`,
    users: `<svg viewBox="0 0 24 24" ${P}><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M21 20a6 6 0 0 0-4-5.6"/></svg>`,
    layout: `<svg viewBox="0 0 24 24" ${P}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
    map: `<svg viewBox="0 0 24 24" ${P}><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
    rupee: `<svg viewBox="0 0 24 24" ${P}><path d="M6 4h12M6 8h12M9 4c4 0 6 2 6 5s-2 5-6 5H8l7 6"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" ${P}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" ${P}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" ${P}><path d="M3 3v18h18M8 14v4M13 9v9M18 5v13"/></svg>`,
    box: `<svg viewBox="0 0 24 24" ${P}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>`,
    print: `<svg viewBox="0 0 24 24" ${P}><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/></svg>`,
    inbox: `<svg viewBox="0 0 24 24" ${P}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5 5h14l3 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5 5Z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" ${P}><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  };

  function icon(name) { return ICONS[name] || ""; }

  /* ---- formatting ---- */
  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  function fmtRupee(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function initials(name) {
    return (name || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  /* ---- status badge ---- */
  const STATUS_META = {
    verified: { cls: "badge-ok", label: "Verified", icon: "check" },
    due: { cls: "badge-warn", label: "Due Soon", icon: "clock" },
    expired: { cls: "badge-danger", label: "Expired", icon: "alert" },
    pending: { cls: "badge-neutral", label: "Not Verified", icon: "clock" },
  };
  function statusBadge(status) {
    const m = STATUS_META[status] || STATUS_META.pending;
    return `<span class="badge ${m.cls}"><span class="dot"></span>${m.label}</span>`;
  }
  const APP_STATUS = {
    Pending: "badge-neutral", Assigned: "badge-info", Scheduled: "badge-info",
    Verified: "badge-ok", Rejected: "badge-danger",
  };
  function appBadge(status) {
    return `<span class="badge ${APP_STATUS[status] || "badge-neutral"}"><span class="dot"></span>${status}</span>`;
  }

  /* ---- toast ---- */
  function toast(msg, kind) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const el = document.createElement("div");
    el.className = "toast " + (kind || "");
    const ic = kind === "danger" ? ICONS.xCircle : kind === "ok" ? ICONS.checkCircle : ICONS.checkCircle;
    el.innerHTML = `<span class="t-ico">${ic}</span><span>${msg}</span>`;
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; el.style.transition = "all .3s"; }, 2600);
    setTimeout(() => el.remove(), 3000);
  }

  /* ---- modal ---- */
  function modal({ title, subtitle, body, footer, wide }) {
    let overlay = document.getElementById("lm-modal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "lm-modal";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    }
    overlay.innerHTML = `
      <div class="modal" style="${wide ? "max-width:720px" : ""}" role="dialog" aria-modal="true" aria-label="${title || "Dialog"}">
        <div class="modal-head">
          <div><h3>${title || ""}</h3>${subtitle ? `<p>${subtitle}</p>` : ""}</div>
          <button class="icon-btn" data-close aria-label="Close">${ICONS.x}</button>
        </div>
        <div class="modal-body">${body || ""}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ""}
      </div>`;
    overlay.classList.add("open");
    overlay.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
    return overlay;
  }
  function closeModal() {
    const o = document.getElementById("lm-modal");
    if (o) o.classList.remove("open");
  }

  /* ---- appbar ---- */
  const PORTALS = [
    { role: "public", href: "index.html", label: "Home" },
    { role: "public", href: "verify.html", label: "Public Check" },
    { role: "trader", href: "trader.html", label: "Trader" },
    { role: "inspector", href: "inspector.html", label: "Inspector" },
    { role: "admin", href: "admin.html", label: "Admin" },
  ];
  function appbar(active, user) {
    const nav = PORTALS.map(
      (p) => `<a href="${p.href}" class="${active === p.href ? "active" : ""}">${p.label}</a>`
    ).join("");
    const userChip = user
      ? `<div class="user-chip"><span>${user.name}</span><span class="avatar">${initials(user.name)}</span></div>`
      : "";
    return `
      <header class="appbar">
        <a class="brand" href="index.html">
          <span class="seal">${ICONS.scale}</span>
          <span class="brand-text">
            <b>Legal Metrology &mdash; Verify</b>
            <span>Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
          </span>
        </a>
        <div class="spacer"></div>
        <nav class="appbar-nav" aria-label="Portals">${nav}</nav>
        ${userChip}
      </header>`;
  }

  function mountAppbar(active, user) {
    const holder = document.getElementById("appbar");
    if (holder) holder.innerHTML = appbar(active, user);
  }

  window.UI = {
    icon, fmtDate, fmtRupee, initials, statusBadge, appBadge,
    toast, modal, closeModal, mountAppbar, ICONS, STATUS_META,
  };
})();
