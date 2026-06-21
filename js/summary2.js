const MONTHLY_API = "https://script.google.com/macros/s/AKfycbx7A5ZjxGoAkocbWdJR2a2ZHiemeUXqjrvdVK_FsTEFa2TQVxEqlUygtZZEmaZ_7ZORag/exec";
const KUTIPAN_API = "https://script.google.com/macros/s/AKfycby8lsWaj4hrHeGKs_MjDzDIj9uhlK7vBeocLOoqEMgnUg_00TxscAoVdfikDCcXg6l7WA/exec";

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

// All 24 months
const bulanPenuh = [
  "JAN",   "FEB",   "MAC",   "APR",
  "MEI",   "JUN",   "JUL",   "OGS",   "SEP",   "OKT",   "NOV",   "DIS",
  "JAN26", "FEB26", "MAC26", "APR26",
  "MEI26", "JUN26", "JUL26", "OGS26", "SEP26", "OKT26", "NOV26", "DIS26"
];

// Only collection months (skip JAN–APR 2025), 20 total
const collectionMonths = bulanPenuh.slice(4);

// Display labels (strip "26" suffix for cleaner header)
const monthDisplayLabels = collectionMonths.map(b => b.replace("26", ""));

function getCurrentMonthIndex() {
  const now = new Date();
  let idx = now.getMonth();
  const yr = now.getFullYear();
  if (yr === 2026)     idx += 12;
  else if (yr > 2026)  idx = 23;
  else if (yr < 2025)  idx = 3;
  return Math.min(idx, 23);
}

async function loadAll() {
  const loading    = document.getElementById("globalLoading");
  const wrapper    = document.getElementById("tableWrapper");
  const refreshBtn = document.getElementById("refreshBtn");

  loading.style.display  = "flex";
  wrapper.style.display  = "none";
  refreshBtn.disabled    = true;
  refreshBtn.textContent = "⏳ Memuatkan...";

  ["statLengkap", "statTunggak", "statTotal"].forEach(id => {
    document.getElementById(id).textContent = "—";
  });

  const currentIdx     = getCurrentMonthIndex();
  const requiredMonths = bulanPenuh.slice(4, currentIdx + 1);

  // Fetch all 12 families in parallel (2 APIs each = 24 concurrent requests)
  const families = await Promise.all(namaData.map(async (fam) => {
    try {
      const [mr, kr] = await Promise.all([
        fetch(`${MONTHLY_API}?key=${fam.key}`),
        fetch(`${KUTIPAN_API}?key=${fam.key}`)
      ]);
      const [md, kd] = await Promise.all([mr.json(), kr.json()]);
      if (md.status !== "success") throw new Error();

      const paid     = (md.paid || []).map(b => b.toUpperCase());
      const tunggakan = bulanPenuh.slice(4, currentIdx).filter(b => !paid.includes(b));
      const paidCount = requiredMonths.filter(b => paid.includes(b)).length;
      const isLengkap = tunggakan.length === 0;
      const tambahan  = kd.status === "success" ? parseFloat(kd.jumlah_tambahan) || 0 : 0;
      const actualRM  = kd.status === "success"
        ? (parseFloat(kd.jumlah_bayaran) || 0) + tambahan
        : paidCount * 50;

      return { ...fam, paid, tunggakan, paidCount, requiredMonths, currentIdx, actualRM, tambahan, isLengkap, error: false };
    } catch {
      return { ...fam, paid: [], tunggakan: [], paidCount: 0, requiredMonths, currentIdx, actualRM: 0, tambahan: 0, isLengkap: false, error: true };
    }
  }));

  // Sort: best payers first
  families.sort((a, b) =>
    a.tunggakan.length - b.tunggakan.length ||
    b.paidCount - a.paidCount ||
    a.nama.localeCompare(b.nama)
  );

  loading.style.display  = "none";
  wrapper.style.display  = "block";
  refreshBtn.disabled    = false;
  refreshBtn.textContent = "🔄 Muat Semula";

  // Stats
  const lengkap = families.filter(f => f.isLengkap && !f.error).length;
  const tunggak = families.filter(f => !f.isLengkap && !f.error).length;
  const total   = families.reduce((s, f) => s + f.actualRM, 0);

  document.getElementById("statLengkap").textContent = `${lengkap}/12`;
  document.getElementById("statTunggak").textContent = tunggak;
  document.getElementById("statTotal").textContent   = `RM ${total.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  buildMonthHeaders(currentIdx);
  buildTableBody(families, currentIdx, requiredMonths);
  buildTableFoot(families, currentIdx);
}

function buildMonthHeaders(currentIdx) {
  const row = document.getElementById("monthHeaderRow");
  row.innerHTML = "";
  collectionMonths.forEach((bulan, colIdx) => {
    const fullIdx  = colIdx + 4;
    const isCurrent = fullIdx === currentIdx;
    const th = document.createElement("th");
    th.className = "col-month";
    th.textContent = monthDisplayLabels[colIdx];
    if (isCurrent) {
      th.style.color    = "#fbb034";
      th.style.background = "#1e1800";
    } else if (fullIdx > currentIdx) {
      th.style.color = "#2e2e2e";
    }
    row.appendChild(th);
  });
}

function buildTableBody(families, currentIdx, requiredMonths) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  families.forEach((f, rank) => {
    const tr = document.createElement("tr");
    tr.className = f.isLengkap ? "row-lengkap" : "row-tunggak";

    // # rank
    const rankTd = document.createElement("td");
    rankTd.className = "col-rank";
    rankTd.textContent = rank + 1;
    tr.appendChild(rankTd);

    // Family name
    const nameTd = document.createElement("td");
    nameTd.className = "col-family";
    nameTd.innerHTML = `<span class="family-name">${f.nama.replace("Keluarga ", "")}</span>`;
    tr.appendChild(nameTd);

    // Month cells
    collectionMonths.forEach((bulan, colIdx) => {
      const fullIdx   = colIdx + 4;
      const isPaid    = f.paid.includes(bulan);
      const isCurrent = fullIdx === currentIdx;
      const isPast    = fullIdx < currentIdx;

      const td = document.createElement("td");

      if (isPaid && isCurrent) {
        td.className = "cell-paid-current";
        td.innerHTML = `<span class="cell-icon">✓</span>`;
        td.title     = `${bulan} 2026: Dibayar ✅`;
      } else if (isPaid) {
        td.className = "cell-paid";
        td.innerHTML = `<span class="cell-icon">✓</span>`;
        td.title     = `${bulan}: Dibayar ✅`;
      } else if (isCurrent) {
        td.className = "cell-current";
        td.innerHTML = `<span class="cell-icon">◉</span>`;
        td.title     = `${bulan} 2026: Bulan Semasa (Belum Bayar)`;
      } else if (isPast) {
        td.className = "cell-tunggak";
        td.innerHTML = `<span class="cell-icon">✗</span>`;
        td.title     = `${bulan}: Belum Bayar ❌ (Tunggak)`;
      } else {
        td.className = "cell-future";
        td.innerHTML = `<span class="cell-icon">·</span>`;
        td.title     = `${bulan}: Belum Dibuka`;
      }

      tr.appendChild(td);
    });

    // Bulan bayar
    const bulanTd = document.createElement("td");
    bulanTd.className = "col-summary";
    const pct = requiredMonths.length > 0 ? Math.round((f.paidCount / requiredMonths.length) * 100) : 0;
    bulanTd.innerHTML = `<strong>${f.paidCount}</strong>/${requiredMonths.length}<br><small style="color:#555;font-size:0.65rem;">${pct}%</small>`;
    tr.appendChild(bulanTd);

    // Jumlah RM
    const rmTd = document.createElement("td");
    rmTd.className = "col-rm";
    rmTd.innerHTML = `RM ${f.actualRM.toFixed(2)}`;
    if (f.tambahan > 0) {
      rmTd.innerHTML += `<span class="tambahan-label">+RM ${f.tambahan.toFixed(2)} ikhlas</span>`;
    }
    tr.appendChild(rmTd);

    // Status
    const statusTd = document.createElement("td");
    statusTd.className = "col-status";
    if (f.error) {
      statusTd.innerHTML = `<span class="status-error">⚠ Ralat</span>`;
    } else if (f.isLengkap) {
      statusTd.innerHTML = `<span class="status-lengkap">✅ Lengkap</span>`;
    } else {
      statusTd.innerHTML = `<span class="status-tunggak">⚠️ ${f.tunggakan.length} Tggk</span>`;
    }
    tr.appendChild(statusTd);

    tbody.appendChild(tr);
  });
}

function buildTableFoot(families, currentIdx) {
  const tfoot = document.getElementById("tableFoot");
  tfoot.innerHTML = "";

  const tr = document.createElement("tr");

  // Rank cell
  const rankTd = document.createElement("td");
  rankTd.className = "col-rank";
  rankTd.textContent = "";
  tr.appendChild(rankTd);

  // Label
  const labelTd = document.createElement("td");
  labelTd.className = "col-family";
  labelTd.style.color = "#666";
  labelTd.style.fontSize = "0.72rem";
  labelTd.style.letterSpacing = "0.5px";
  labelTd.textContent = "JUMLAH BAYAR";
  tr.appendChild(labelTd);

  // Count per month
  collectionMonths.forEach((bulan, colIdx) => {
    const fullIdx = colIdx + 4;
    const count   = families.filter(f => f.paid.includes(bulan)).length;
    const total   = families.length;
    const td      = document.createElement("td");
    td.className  = "foot-count";
    td.title      = `${bulan}: ${count} drp ${total} keluarga bayar`;

    if (fullIdx > currentIdx) {
      td.className += " foot-fut";
      td.textContent = "—";
    } else if (fullIdx === currentIdx) {
      td.className += " foot-cur";
      td.textContent = `${count}/${total}`;
    } else if (count === total) {
      td.className += " foot-all";
      td.textContent = `${count}/${total}`;
    } else if (count >= Math.ceil(total * 0.67)) {
      td.className += " foot-most";
      td.textContent = `${count}/${total}`;
    } else if (count >= Math.ceil(total * 0.4)) {
      td.className += " foot-half";
      td.textContent = `${count}/${total}`;
    } else {
      td.className += " foot-few";
      td.textContent = `${count}/${total}`;
    }

    tr.appendChild(td);
  });

  // Summary cells
  const sumBulan = document.createElement("td");
  sumBulan.className = "col-summary";
  sumBulan.textContent = "";
  tr.appendChild(sumBulan);

  const sumRM = document.createElement("td");
  sumRM.className = "col-rm foot-total";
  const grandTotal = families.reduce((s, f) => s + f.actualRM, 0);
  sumRM.textContent = `RM ${grandTotal.toFixed(2)}`;
  tr.appendChild(sumRM);

  const sumStatus = document.createElement("td");
  sumStatus.className = "col-status";
  sumStatus.textContent = "";
  tr.appendChild(sumStatus);

  tfoot.appendChild(tr);
}

loadAll();
