// =====================================================================
// 💸 PAGE REFUND — rekod bayaran (live dari Sheets) + bukti pemulangan
// =====================================================================
// Rekod bayaran & resit asal : API bayaran-dashboard (sama macam laman utama)
// Rekod pemulangan           : js/refund-data.js (REFUND_DATA)
//
// refund.html            → semua keluarga
// refund.html?key=paksu  → satu keluarga sahaja (link untuk WhatsApp)
// =====================================================================

const BAYARAN_API = "https://script.google.com/macros/s/AKfycbyBj2Pwn_jVIhHrlJNqp9pw62CV804tD5SgMlxXIHYqE6DoStfXuzEQiKtyW5Wk3ecU7A/exec";
const REFUND_RESIT_DIR = "../asset/refund/";

const namaData = [
  { nama: "Keluarga Pakcik",  key: "pakcik"  },
  { nama: "Keluarga Pakjang", key: "pakjang" },
  { nama: "Keluarga Fahmi",   key: "fahmi"   },
  { nama: "Keluarga Hafiz",   key: "hafiz"   },
  { nama: "Keluarga Hanis",   key: "hanis"   },
  { nama: "Keluarga Wani",    key: "wani"    },
  { nama: "Keluarga Wan",     key: "wan"     },
  { nama: "Keluarga Ika",     key: "ika"     },
  { nama: "Keluarga Makteh",  key: "makteh"  },
  { nama: "Keluarga Yana",    key: "yana"    },
  { nama: "Keluarga Faiz",    key: "faiz"    },
  { nama: "Keluarga Paksu",   key: "paksu"   }
];

const BULAN_LABEL = {
  JAN: "Jan", FEB: "Feb", MAC: "Mac", APR: "Apr", MEI: "Mei", JUN: "Jun",
  JUL: "Julai", OGS: "Ogos", SEP: "Sep", OKT: "Okt", NOV: "Nov", DIS: "Dis"
};
const BULAN_KOD = Object.keys(BULAN_LABEL);

const focusKey = (new URLSearchParams(window.location.search).get("key") || "").trim().toLowerCase();

// ---------- Helpers ----------

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function formatRM(n) {
  return "RM " + (Number(n) || 0).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTarikh(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return escapeHtml(value);
  return d.toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur" });
}

// "MEI" → "Mei 2025", "JAN26" → "Jan 2026", "tambahan" → "Tambahan (ikhlas)"
function labelBayaran(raw) {
  // Sheets kadang-kadang tukar "JAN26" jadi tarikh (serial Excel atau ISO)
  const asNumber = Number(raw);
  let date = null;
  if (!isNaN(asNumber) && asNumber > 40000) {
    date = new Date((asNumber - 25569) * 86400 * 1000);
  } else if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    date = new Date(raw);
  }
  if (date && !isNaN(date)) {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", month: "numeric", year: "numeric" })
      .formatToParts(date);
    const month = Number(parts.find(p => p.type === "month").value);
    const year  = parts.find(p => p.type === "year").value;
    return `${BULAN_LABEL[BULAN_KOD[month - 1]]} ${year}`;
  }

  const code = String(raw ?? "").trim().toUpperCase();
  if (code === "TAMBAHAN") return "Tambahan (ikhlas)";
  const match = code.match(/^([A-Z]{3})(26)?$/);
  if (match && BULAN_LABEL[match[1]]) {
    return `${BULAN_LABEL[match[1]]} ${match[2] ? "2026" : "2025"}`;
  }
  return code || "-";
}

function safeUrl(url) {
  return /^https:\/\//i.test(String(url || "").trim()) ? String(url).trim() : null;
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
  const grid     = document.getElementById("familyGrid");

  loading.style.display = "flex";
  errorBox.hidden = true;
  grid.innerHTML = "";

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

  // Kumpul bayaran ikut keluarga
  const byKey = {};
  records.forEach(r => {
    const key = String(r.nama || "").trim().toLowerCase();
    if (!key) return;
    (byKey[key] = byKey[key] || []).push(r);
  });

  const families = namaData.map(fam => {
    const payments = (byKey[fam.key] || [])
      .slice()
      .sort((a, b) => new Date(a.tarikh) - new Date(b.tarikh));
    const dibayar     = payments.reduce((s, p) => s + (Number(p.jumlah) || 0), 0);
    const refunds     = getRefunds(fam.key);
    const dipulangkan = refunds.reduce((s, p) => s + Number(p.jumlah), 0);
    const baki        = Math.max(dibayar - dipulangkan, 0);
    let status = "belum";
    if (dibayar > 0 && dipulangkan >= dibayar - 0.005) status = "selesai";
    else if (dipulangkan > 0) status = "sebahagian";
    return { ...fam, payments, dibayar, refunds, dipulangkan, baki, status };
  });

  loading.style.display = "none";

  const withPayments = families.filter(f => f.dibayar > 0);
  const noPayments   = families.filter(f => f.dibayar <= 0);

  // ---- Paparan satu keluarga ----
  if (focusKey) {
    const fam = families.find(f => f.key === focusKey);
    const focusBar = document.getElementById("focusBar");
    focusBar.hidden = false;

    if (!fam) {
      document.getElementById("focusName").textContent = "keluarga tidak dijumpai";
      grid.innerHTML = `<p class="empty-note">Link ini tidak sah. Tekan "Lihat semua keluarga" untuk semak.</p>`;
      return;
    }

    document.getElementById("focusName").textContent = fam.nama;
    if (fam.dibayar <= 0) {
      grid.innerHTML = `<p class="empty-note">Tiada rekod bayaran untuk ${escapeHtml(fam.nama)}, jadi tiada wang perlu dipulangkan.</p>`;
      return;
    }
    grid.classList.add("single");
    grid.appendChild(buildCard(fam, true));
    return;
  }

  // ---- Paparan semua keluarga ----
  const perlu    = withPayments.reduce((s, f) => s + f.dibayar, 0);
  const sudah    = withPayments.reduce((s, f) => s + Math.min(f.dipulangkan, f.dibayar), 0);
  const baki     = Math.max(perlu - sudah, 0);
  const selesai  = withPayments.filter(f => f.status === "selesai").length;
  const pct      = perlu > 0 ? Math.round((sudah / perlu) * 100) : 0;

  document.getElementById("statPerlu").textContent   = formatRM(perlu);
  document.getElementById("statSudah").textContent   = formatRM(sudah);
  document.getElementById("statBaki").textContent    = formatRM(baki);
  document.getElementById("statSelesai").textContent = `${selesai}/${withPayments.length}`;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressLabel").textContent = `${pct}% dipulangkan`;
  document.getElementById("overview").hidden = false;

  withPayments.forEach(f => grid.appendChild(buildCard(f, false)));

  if (noPayments.length > 0) {
    const names = noPayments.map(f => f.nama.replace("Keluarga ", "")).join(", ");
    const note = document.getElementById("footnote");
    note.textContent = `Tiada rekod bayaran (tiada refund): ${names}.`;
    note.hidden = false;
  }
}

const STATUS_BADGE = {
  belum:      `<span class="badge badge-belum">⏳ Belum dipulangkan</span>`,
  sebahagian: `<span class="badge badge-sebahagian">🔶 Sebahagian dipulangkan</span>`,
  selesai:    `<span class="badge badge-selesai">✅ Selesai dipulangkan</span>`
};

function buildCard(f, expanded) {
  const card = document.createElement("article");
  card.className = `fam-card status-${f.status}`;
  card.id = `fam-${f.key}`;

  const paymentRows = f.payments.map(p => {
    const resitUrl = safeUrl(p.receipt);
    const resit = resitUrl
      ? `<a class="pay-resit" href="${escapeHtml(resitUrl)}" target="_blank" rel="noopener">📎 Resit</a>`
      : `<span class="pay-resit none">Tiada resit</span>`;
    return `
      <li class="pay-row">
        <span class="pay-month">${escapeHtml(labelBayaran(p.bayaran))}</span>
        <span class="pay-date">${formatTarikh(p.tarikh)}</span>
        <span class="pay-amt">${formatRM(p.jumlah)}</span>
        ${resit}
      </li>`;
  }).join("");

  const refundHtml = f.refunds.length > 0
    ? `<ul class="refund-list">${f.refunds.map(r => {
        const resit = resolveRefundResit(r.resit);
        let proof = "";
        if (resit && resit.isImage) {
          proof = `<a class="refund-thumb" href="${escapeHtml(resit.href)}" target="_blank" rel="noopener">
                     <img src="${escapeHtml(resit.href)}" alt="Resit pemulangan ${escapeHtml(f.nama)}" loading="lazy">
                     <span>Tekan untuk besarkan</span>
                   </a>`;
        } else if (resit) {
          proof = `<a class="pay-resit" href="${escapeHtml(resit.href)}" target="_blank" rel="noopener">📎 Lihat resit pemindahan</a>`;
        }
        return `
          <li class="refund-item">
            <div class="refund-meta">
              <span class="refund-amt">${formatRM(r.jumlah)}</span>
              <span class="refund-date">Dipindahkan pada ${formatTarikh(r.tarikh)}</span>
              ${r.nota ? `<span class="refund-nota">${escapeHtml(r.nota)}</span>` : ""}
            </div>
            ${proof}
          </li>`;
      }).join("")}</ul>`
    : `<p class="refund-empty">Belum dipulangkan. Bukti pemindahan akan dipaparkan di sini sebaik sahaja wang dipindahkan.</p>`;

  card.innerHTML = `
    <header class="fam-head">
      <h3>${escapeHtml(f.nama)}</h3>
      ${STATUS_BADGE[f.status]}
    </header>

    <div class="fam-figures">
      <div class="fig"><span class="fig-label">Dibayar</span><span class="fig-val">${formatRM(f.dibayar)}</span></div>
      <div class="fig"><span class="fig-label">Dipulangkan</span><span class="fig-val fig-green">${formatRM(f.dipulangkan)}</span></div>
      <div class="fig"><span class="fig-label">Baki</span><span class="fig-val ${f.baki > 0 ? "fig-amber" : "fig-green"}">${formatRM(f.baki)}</span></div>
    </div>

    <section class="fam-section">
      <h4>💸 Bukti pemulangan</h4>
      ${refundHtml}
    </section>

    <details class="fam-section pay-details"${expanded ? " open" : ""}>
      <summary>🧾 Rekod bayaran & resit asal <span class="pay-count">${f.payments.length} bayaran</span></summary>
      <ul class="pay-list">${paymentRows}</ul>
    </details>

    <div class="fam-actions">
      <button type="button" class="copy-link">🔗 Salin link keluarga ini</button>
    </div>
  `;

  card.querySelector(".copy-link").addEventListener("click", e => copyFamilyLink(f.key, e.currentTarget));
  return card;
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
