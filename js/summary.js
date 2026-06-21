const MONTHLY_API  = "https://script.google.com/macros/s/AKfycbx7A5ZjxGoAkocbWdJR2a2ZHiemeUXqjrvdVK_FsTEFa2TQVxEqlUygtZZEmaZ_7ZORag/exec";
const KUTIPAN_API  = "https://script.google.com/macros/s/AKfycby8lsWaj4hrHeGKs_MjDzDIj9uhlK7vBeocLOoqEMgnUg_00TxscAoVdfikDCcXg6l7WA/exec";

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

const bulanPenuh = [
  "JAN",   "FEB",   "MAC",   "APR",
  "MEI",   "JUN",   "JUL",   "OGS",
  "SEP",   "OKT",   "NOV",   "DIS",
  "JAN26", "FEB26", "MAC26", "APR26",
  "MEI26", "JUN26", "JUL26", "OGS26",
  "SEP26", "OKT26", "NOV26", "DIS26"
];

// Months with no collection (first 4 slots = JAN–APR 2025)
const NOPAY = new Set(["JAN", "FEB", "MAC", "APR"]);

function getCurrentMonthIndex() {
  const now = new Date();
  let idx = now.getMonth(); // 0–11
  const yr = now.getFullYear();
  if (yr === 2026)      idx += 12;
  else if (yr > 2026)   idx = 23;
  else if (yr < 2025)   idx = 3; // before collection started
  return Math.min(idx, 23);
}

let allFamilyData = [];
let currentFilter = "semua";

async function loadAll() {
  const grid        = document.getElementById("familyGrid");
  const loading     = document.getElementById("globalLoading");
  const refreshBtn  = document.getElementById("refreshBtn");

  grid.innerHTML = "";
  loading.style.display = "flex";
  refreshBtn.disabled   = true;
  refreshBtn.textContent = "⏳ Memuatkan...";

  document.getElementById("statLengkap").textContent = "—";
  document.getElementById("statTunggak").textContent = "—";
  document.getElementById("statTotal").textContent   = "—";

  const currentIdx    = getCurrentMonthIndex();
  // All collection months from MEI-2025 up to & including current month
  const requiredMonths = bulanPenuh.slice(4, currentIdx + 1);

  const promises = namaData.map(async (family) => {
    try {
      // Fetch both APIs in parallel for each family
      const [monthlyRes, kutipanRes] = await Promise.all([
        fetch(`${MONTHLY_API}?key=${family.key}`),
        fetch(`${KUTIPAN_API}?key=${family.key}`)
      ]);
      const [monthlyData, kutipanData] = await Promise.all([
        monthlyRes.json(),
        kutipanRes.json()
      ]);

      if (monthlyData.status !== "success") throw new Error("Monthly API error");

      const paid = (monthlyData.paid || []).map(b => b.toUpperCase());

      // Tunggakan = past collection months (before current month) not in paid list
      const tunggakan = bulanPenuh
        .slice(4, currentIdx)
        .filter(b => !paid.includes(b));

      const paidRequiredCount = requiredMonths.filter(b => paid.includes(b)).length;
      const isLengkap         = tunggakan.length === 0;

      // Use actual amounts from kutipan API (includes tambahan), fall back to estimate
      const actualRM   = kutipanData.status === "success" ? parseFloat(kutipanData.jumlah_bayaran)  || 0 : paidRequiredCount * 50;
      const tambahan   = kutipanData.status === "success" ? parseFloat(kutipanData.jumlah_tambahan) || 0 : 0;

      return { ...family, paid, tunggakan, paidRequiredCount, requiredMonths, currentIdx, actualRM, tambahan, isLengkap, error: false };
    } catch {
      return { ...family, paid: [], tunggakan: [], paidRequiredCount: 0, requiredMonths, currentIdx, actualRM: 0, tambahan: 0, isLengkap: false, error: true };
    }
  });

  allFamilyData = await Promise.all(promises);

  loading.style.display  = "none";
  refreshBtn.disabled    = false;
  refreshBtn.textContent = "🔄 Muat Semula";

  const lengkapCount = allFamilyData.filter(f => f.isLengkap && !f.error).length;
  const tunggakCount = allFamilyData.filter(f => !f.isLengkap && !f.error).length;
  const totalRM      = allFamilyData.reduce((s, f) => s + f.actualRM + f.tambahan, 0);

  document.getElementById("statLengkap").textContent = `${lengkapCount}/12`;
  document.getElementById("statTunggak").textContent = tunggakCount;
  document.getElementById("statTotal").textContent   = `RM ${totalRM.toLocaleString()}`;

  // Update filter button labels with counts
  const btnSemua  = document.querySelector('[data-filter="semua"]');
  const btnTunggak = document.querySelector('[data-filter="tunggak"]');
  const btnLengkap = document.querySelector('[data-filter="lengkap"]');
  if (btnSemua)   btnSemua.textContent   = `Semua (${allFamilyData.length})`;
  if (btnTunggak) btnTunggak.textContent = `⚠️ Ada Tunggakan (${tunggakCount})`;
  if (btnLengkap) btnLengkap.textContent = `✅ Sudah Lengkap (${lengkapCount})`;

  renderCards();
}

function filterCards(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderCards();
}

function renderCards() {
  const grid = document.getElementById("familyGrid");
  grid.innerHTML = "";

  let list = [...allFamilyData];
  if (currentFilter === "tunggak") list = list.filter(f => !f.isLengkap);
  if (currentFilter === "lengkap") list = list.filter(f => f.isLengkap);

  // Sort: best payers first (least tunggakan → most paid months → alphabetical)
  list.sort((a, b) =>
    a.tunggakan.length - b.tunggakan.length ||
    b.paidRequiredCount - a.paidRequiredCount ||
    a.nama.localeCompare(b.nama)
  );

  if (list.length === 0) {
    grid.innerHTML = `<p style="text-align:center;color:#666;grid-column:1/-1;padding:3rem 0;">Tiada rekod untuk ditunjukkan.</p>`;
    return;
  }

  list.forEach(family => grid.appendChild(buildCard(family)));
}

function buildCard(f) {
  const card = document.createElement("div");
  card.className = `family-card ${f.error ? "card-error" : f.isLengkap ? "card-lengkap" : "card-tunggak"}`;

  const pct = f.requiredMonths.length > 0
    ? Math.round((f.paidRequiredCount / f.requiredMonths.length) * 100)
    : 0;

  const badge = f.error
    ? `<span class="badge badge-error">❌ Ralat Muatkan</span>`
    : f.isLengkap
    ? `<span class="badge badge-lengkap">✅ Lengkap</span>`
    : `<span class="badge badge-tunggak">⚠️ ${f.tunggakan.length} Bulan Tunggak</span>`;

  // Mini dots — only show required months (collection months up to current)
  const dots = f.requiredMonths.map(bulan => {
    const isPaid    = f.paid.includes(bulan);
    const isCurrent = bulanPenuh.indexOf(bulan) === f.currentIdx;
    let dotClass;
    if (isPaid)         dotClass = "dot-paid";
    else if (isCurrent) dotClass = "dot-current";
    else                dotClass = "dot-overdue";
    return `<span class="mini-dot ${dotClass}" title="${bulan}: ${isPaid ? "✅ Dibayar" : isCurrent ? "🟡 Bulan semasa" : "❌ Tunggak"}"></span>`;
  }).join("");

  const tunggakanHtml = f.tunggakan.length > 0
    ? `<div class="tunggak-list">
        <span class="tunggak-label">Tunggak:</span>
        ${f.tunggakan.map(b => `<span class="tunggak-month">${b}</span>`).join("")}
      </div>`
    : `<div style="font-size:0.82rem;color:#4caf50;">✓ Semua bulan telah dibayar</div>`;

  card.innerHTML = `
    <div class="card-header">
      <span class="card-name">${f.nama}</span>
      ${badge}
    </div>
    <div class="card-progress">
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
      <span class="progress-label">${f.paidRequiredCount}/${f.requiredMonths.length} bulan</span>
    </div>
    <div class="card-rm">
      💰 RM ${(f.actualRM + f.tambahan).toLocaleString('ms-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})} dibayar
      ${f.tambahan > 0 ? `<span class="tambahan-badge">+RM ${f.tambahan.toFixed(2)} ikhlas</span>` : ""}
    </div>
    <div class="mini-dots-row" title="Hover pada kotak untuk lihat bulan">${dots}</div>
    ${tunggakanHtml}
    <a href="akaun.html?key=${f.key}" class="card-link">Lihat Akaun Penuh →</a>
  `;

  return card;
}

loadAll();
