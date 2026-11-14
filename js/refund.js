// =====================================================================
// 💸 PAGE REFUND — gaya "Langkah Status" (Bayaran diterima → Duit dipulangkan)
// =====================================================================
// Rekod bayaran & resit asal : API bayaran-dashboard (sama macam laman utama)
// Rekod pemulangan           : js/refund-data.js (REFUND_DATA)
//
// refund.html            → semua keluarga (kad boleh ditekan)
// refund.html?key=paksu  → satu keluarga sahaja (link untuk WhatsApp)
// =====================================================================

const BAYARAN_API = "https://script.google.com/macros/s/AKfycbyBj2Pwn_jVIhHrlJNqp9pw62CV804tD5SgMlxXIHYqE6DoStfXuzEQiKtyW5Wk3ecU7A/exec";
const REFUND_RESIT_DIR = "../asset/refund/";
const PAYMENTS_PREVIEW = 4; // bilangan bayaran ditunjuk sebelum "Lihat semua"

const namaData = [
  { nama: "Pakcik",  key: "pakcik"  },
  { nama: "Pakjang", key: "pakjang" },
  { nama: "Fahmi",   key: "fahmi"   },
  { nama: "Hafiz",   key: "hafiz"   },
  { nama: "Hanis",   key: "hanis"   },
  { nama: "Wani",    key: "wani"    },
  { nama: "Wan",     key: "wan"     },
  { nama: "Ika",     key: "ika"     },
  { nama: "Makteh",  key: "makteh"  },
  { nama: "Yana",    key: "yana"    },
  { nama: "Faiz",    key: "faiz"    },
  { nama: "Paksu",   key: "paksu"   }
];

const BULAN = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Julai", "Ogos", "Sep", "Okt", "Nov", "Dis"];
const BULAN_PENDEK = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
const BULAN_KOD = ["JAN", "FEB", "MAC", "APR", "MEI", "JUN", "JUL", "OGS", "SEP", "OKT", "NOV", "DIS"];

const focusKey = (new URLSearchParams(window.location.search).get("key") || "").trim().toLowerCase();

// ---------- Helpers ----------

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

// RM 550  /  RM 2,110  /  RM 12.50
function rm(n) {
  n = Number(n) || 0;
  const dec = Number.isInteger(n) ? 0 : 2;
  return "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// Tarikh → "27 Apr 2025" (waktu Malaysia)
function tarikh(value) {
  if (!value) return "-";
  const str = String(value).trim();
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/); // dari refund-data.js
  if (ymd) return `${Number(ymd[3])} ${BULAN_PENDEK[Number(ymd[2]) - 1]} ${ymd[1]}`;
  const d = new Date(str);
  if (isNaN(d)) return escapeHtml(str);
  const my = new Date(d.getTime() + 8 * 3600 * 1000);
  return `${my.getUTCDate()} ${BULAN_PENDEK[my.getUTCMonth()]} ${my.getUTCFullYear()}`;
}

// "MEI" → "Mei 2025", "JAN26" → "Jan 2026", "tambahan" → "Tambahan (ikhlas)"
function labelBayaran(raw) {
  // Sheets kadang-kadang tukar "JAN26" jadi tarikh (serial Excel atau ISO)
  const asNumber = Number(raw);
  let date = null;
  if (!isNaN(asNumber) && asNumber > 40000) date = new Date((asNumber - 25569) * 86400 * 1000);
  else if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}T/.test(raw)) date = new Date(new Date(raw).getTime() + 8 * 3600 * 1000);
  if (date && !isNaN(date)) return `${BULAN[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

  const code = String(raw ?? "").trim().toUpperCase();
  if (code === "TAMBAHAN") return "Tambahan (ikhlas)";
  const m = code.match(/^([A-Z]{3})(26)?$/);
  const idx = m ? BULAN_KOD.indexOf(m[1]) : -1;
  if (idx >= 0) return `${BULAN[idx]} ${m[2] ? "2026" : "2025"}`;
  return code || "-";
}

function safeUrl(url) {
  const s = String(url || "").trim();
  return /^https:\/\//i.test(s) ? s : null;
}

// resit refund: link Drive (https://...) atau nama fail dalam asset/refund/
function resolveRefundResit(resit) {
  if (!resit) return null;
  const url = safeUrl(resit);
  if (url) return { href: url, isImage: false };
  const file = String(resit).trim().replace(/^.*[\\/]/, "");
  if (!file) return null;
  return { href: REFUND_RESIT_DIR + encodeURIComponent(file), isImage: /\.(jpe?g|png|webp|gif)$/i.test(file) };
}

function getRefunds(key) {
  const list = (typeof REFUND_DATA !== "undefined" && Array.isArray(REFUND_DATA[key])) ? REFUND_DATA[key] : [];
  return list
    .filter(p => p && Number(p.jumlah) > 0)
    .sort((a, b) => String(a.tarikh || "").localeCompare(String(b.tarikh || "")));
}

// ---------- Main ----------

async function loadRefund() {
  const loading  = document.getElementById("loading");
  const errorBox = document.getElementById("errorBox");
  const app      = document.getElementById("app");

  loading.style.display = "flex";
  errorBox.hidden = true;
  app.innerHTML = focusKey ? backLink("refund.html", "← Semua keluarga") : backLink("../index.html", "← Laman Utama");

  let records;
  try {
    const res  = await fetch(BAYARAN_API);
    const data = await res.json();
    if (data.status !== "success" || !Array.isArray(data.data)) throw new Error("Respons tidak sah");
    records = data.data;
  } catch (err) {
    console.error("❌ Gagal fetch rekod bayaran:", err);
    loading.style.display = "none";
    errorBox.hidden = false;
    return;
  }

  const byKey = {};
  records.forEach(r => {
    const key = String(r.nama || "").trim().toLowerCase();
    if (key) (byKey[key] = byKey[key] || []).push(r);
  });

  const families = namaData.map(fam => {
    const payments = (byKey[fam.key] || []).slice().sort((a, b) => new Date(a.tarikh) - new Date(b.tarikh));
    const dibayar     = payments.reduce((s, p) => s + (Number(p.jumlah) || 0), 0);
    const refunds     = getRefunds(fam.key);
    const dipulangkan = refunds.reduce((s, p) => s + Number(p.jumlah), 0);
    const baki        = Math.max(dibayar - dipulangkan, 0);
    let status = "belum";
    if (dibayar > 0 && dipulangkan >= dibayar - 0.005) status = "selesai";
    else if (dipulangkan > 0) status = "sebahagian";
    const withDate     = refunds.filter(r => r.tarikh);
    const tarikhPulang = withDate.length ? withDate[withDate.length - 1].tarikh : null;
    return { ...fam, payments, dibayar, refunds, dipulangkan, baki, status, tarikhPulang };
  });

  loading.style.display = "none";

  if (focusKey) renderSingle(families.find(f => f.key === focusKey));
  else renderAll(families);
}

function backLink(href, text) {
  return `<a href="${href}" class="back">${text}</a>`;
}

const INTRO = `<p class="intro">Family Day dibatalkan. Semua bayaran dipulangkan <strong>100%</strong>.</p>`;

// ---------- Paparan semua keluarga ----------

function step(cls, icon, title, sub) {
  return `<div class="step ${cls}"><div class="dot">${icon}</div><div class="st-t">${title}</div><div class="st-s">${sub}</div></div>`;
}

function stepper(f) {
  let step2, line;
  if (f.status === "selesai") {
    step2 = step("done", "✓", "Duit dipulangkan", f.tarikhPulang ? tarikh(f.tarikhPulang) : "Selesai");
    line = "done";
  } else if (f.status === "sebahagian") {
    step2 = step("half", "½", "Sebahagian dipulangkan", `${rm(f.dipulangkan)} dah`);
    line = "half";
  } else {
    step2 = step("wait", "…", "Duit dipulangkan", "Dalam proses");
    line = "wait";
  }
  return `<div class="steps">
    ${step("done", "✓", "Bayaran diterima", `${f.payments.length} bayaran`)}
    <div class="line ${line}"></div>
    ${step2}
  </div>`;
}

function renderAll(families) {
  const app = document.getElementById("app");
  const withPayments = families.filter(f => f.dibayar > 0);
  const noPayments   = families.filter(f => f.dibayar <= 0);

  const perlu   = withPayments.reduce((s, f) => s + f.dibayar, 0);
  const sudah   = withPayments.reduce((s, f) => s + Math.min(f.dipulangkan, f.dibayar), 0);
  const selesai = withPayments.filter(f => f.status === "selesai").length;
  const pct     = perlu > 0 ? Math.round((sudah / perlu) * 100) : 0;

  app.innerHTML = `
    ${backLink("../index.html", "← Laman Utama")}
    <h1>Refund Family Day</h1>
    ${INTRO}

    <div class="summary">
      <div class="ring" style="background:conic-gradient(var(--green) ${pct}%, var(--track) 0)"><span>${pct}%</span></div>
      <div>
        <div class="sum-t">${rm(sudah)} dah dipulangkan</div>
        <div class="sum-s">daripada ${rm(perlu)} · ${selesai}/${withPayments.length} keluarga selesai</div>
      </div>
    </div>

    <div class="cards">
      ${withPayments.map(f => `
        <a class="card" href="?key=${encodeURIComponent(f.key)}">
          <div class="c-head">
            <span class="c-name">${escapeHtml(f.nama)}</span>
            <span class="c-amt">${rm(f.dibayar)}</span>
          </div>
          ${stepper(f)}
        </a>`).join("")}
    </div>

    <p class="hint">Tekan kad keluarga untuk lihat resit bayaran & resit pemulangan.</p>
    ${noPayments.length ? `<p class="footnote">Tiada rekod bayaran (tiada refund): ${noPayments.map(f => escapeHtml(f.nama)).join(", ")}.</p>` : ""}
  `;
}

// ---------- Paparan satu keluarga ----------

function renderSingle(f) {
  const app = document.getElementById("app");
  document.getElementById("wrap").classList.add("narrow");

  if (!f) {
    app.innerHTML = `${backLink("refund.html", "← Semua keluarga")}
      <p class="empty-note">Link ini tidak sah. Tekan "Semua keluarga" untuk semak.</p>`;
    return;
  }
  if (f.dibayar <= 0) {
    app.innerHTML = `${backLink("refund.html", "← Semua keluarga")}
      <p class="empty-note">Tiada rekod bayaran untuk Keluarga ${escapeHtml(f.nama)}, jadi tiada wang perlu dipulangkan.</p>`;
    return;
  }

  // Langkah 1: senarai bayaran
  const payRows = f.payments.map((p, i) => {
    const url = safeUrl(p.receipt);
    return `<div class="pay${i >= PAYMENTS_PREVIEW ? " extra" : ""}">
      <span class="p-l">${escapeHtml(labelBayaran(p.bayaran))}</span>
      <span class="p-d">${tarikh(p.tarikh)}</span>
      <span class="p-a">${rm(p.jumlah)}</span>
      ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">Resit</a>` : `<span class="p-none">—</span>`}
    </div>`;
  }).join("");
  const hasMore = f.payments.length > PAYMENTS_PREVIEW;
  const first = f.payments[0], last = f.payments[f.payments.length - 1];
  const range = first === last ? tarikh(first.tarikh) : `${tarikh(first.tarikh)} – ${tarikh(last.tarikh)}`;

  // Langkah 2: pemulangan
  let dot2, title2, sub2;
  if (f.status === "selesai") {
    dot2 = `<span class="tl-dot done">✓</span>`;
    title2 = "Duit dipulangkan";
    sub2 = f.tarikhPulang ? `${rm(f.dipulangkan)} · ${tarikh(f.tarikhPulang)}` : rm(f.dipulangkan);
  } else if (f.status === "sebahagian") {
    dot2 = `<span class="tl-dot half">½</span>`;
    title2 = "Sebahagian dipulangkan";
    sub2 = `${rm(f.dipulangkan)} daripada ${rm(f.dibayar)} · baki ${rm(f.baki)}`;
  } else {
    dot2 = `<span class="tl-dot wait">…</span>`;
    title2 = "Duit dipulangkan";
    sub2 = `Dalam proses. Bukti transfer akan dipaparkan di sini.`;
  }

  const showEntryMeta = f.refunds.length > 1;
  const refundHtml = f.refunds.map(r => {
    const resit = resolveRefundResit(r.resit);
    let proof = "";
    if (resit && resit.isImage) {
      proof = `<a class="receipt" href="${escapeHtml(resit.href)}" target="_blank" rel="noopener">
                 <img src="${escapeHtml(resit.href)}" alt="Resit pemulangan Keluarga ${escapeHtml(f.nama)}" loading="lazy">
                 <span>Tekan untuk besarkan</span>
               </a>`;
    } else if (resit) {
      proof = `<a class="receipt-link" href="${escapeHtml(resit.href)}" target="_blank" rel="noopener">📎 Lihat resit pemindahan</a>`;
    }
    const meta = showEntryMeta
      ? `<div class="r-meta"><strong>${rm(r.jumlah)}</strong>${r.tarikh ? ` · ${tarikh(r.tarikh)}` : ""}</div>`
      : "";
    const nota = r.nota ? `<div class="r-nota">${escapeHtml(r.nota)}</div>` : "";
    return meta || nota || proof ? `<div class="refund">${meta}${nota}${proof}</div>` : "";
  }).join("");

  app.innerHTML = `
    ${backLink("refund.html", "← Semua keluarga")}
    ${INTRO}

    <div class="hero">
      <div class="h-n">Keluarga ${escapeHtml(f.nama)} · duit anda</div>
      <div class="h-a">${rm(f.dibayar)}</div>
    </div>

    <div class="tl tl-${f.status}">
      <div class="tl-item first">
        <span class="tl-dot done">✓</span>
        <div class="tl-t">Bayaran diterima</div>
        <div class="tl-s">${f.payments.length} bayaran · ${range}</div>
        <div class="pays${hasMore ? " collapsed" : ""}" id="pays">
          ${payRows}
          ${hasMore ? `<button type="button" class="pays-more" id="paysMore">Lihat semua ${f.payments.length} bayaran ▾</button>` : ""}
        </div>
      </div>

      <div class="tl-item">
        ${dot2}
        <div class="tl-t">${title2}</div>
        <div class="tl-s">${sub2}</div>
        ${refundHtml}
      </div>
    </div>

    <div class="copy-wrap"><button type="button" class="copy-link" id="copyLink">🔗 Salin link keluarga ini</button></div>
  `;

  const more = document.getElementById("paysMore");
  if (more) {
    more.addEventListener("click", () => {
      document.getElementById("pays").classList.remove("collapsed");
      more.remove();
    });
  }
  const copyBtn = document.getElementById("copyLink");
  copyBtn.addEventListener("click", () => copyFamilyLink(f.key, copyBtn));
}

function copyFamilyLink(key, btn) {
  const url = new URL(window.location.href);
  url.search = `?key=${encodeURIComponent(key)}`;
  url.hash = "";
  const link = url.toString();
  const done = () => {
    const original = btn.textContent;
    btn.textContent = "✔️ Link disalin!";
    setTimeout(() => { btn.textContent = original; }, 1500);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(link).then(done).catch(() => window.prompt("Salin link ini:", link));
  } else {
    window.prompt("Salin link ini:", link);
  }
}

loadRefund();
