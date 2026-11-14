// Family Day 2026 telah dibatalkan — countdown dibuang, diganti status refund.

function toggleMenu() {
  const menu = document.getElementById("hamburgerMenu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// 💸 Ringkasan pemulangan wang (jumlah dipulangkan dari js/refund-data.js)
async function paparRingkasanRefund() {
  const valEl  = document.getElementById("refundRingkas");
  const fillEl = document.getElementById("refundRingkasFill");
  if (!valEl) return;

  const formatRM = n => "RM " + (Number(n) || 0).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const dipulangkan = (typeof REFUND_DATA !== "undefined")
    ? Object.values(REFUND_DATA).flat().reduce((s, p) => s + (Number(p && p.jumlah) || 0), 0)
    : 0;

  try {
    const res  = await fetch("https://script.google.com/macros/s/AKfycbyAYkTIVoWtirHtKWUDJOlkDXH0WkSNzuiwesrwtmCNCY3M_dLiZ8oDqQCeOpX628C1KA/exec");
    const data = await res.json();
    const jumlah = Number(data.total_jumlah) || 0;
    const sudah  = Math.min(dipulangkan, jumlah);
    const pct    = jumlah > 0 ? Math.round((sudah / jumlah) * 100) : 0;

    valEl.innerHTML = `<strong>${formatRM(sudah)}</strong> / ${formatRM(jumlah)}`;
    if (fillEl) fillEl.style.width = pct + "%";
  } catch (err) {
    console.error("❌ Gagal dapatkan ringkasan refund:", err);
    valEl.textContent = `${formatRM(dipulangkan)} dipulangkan`;
  }
}

window.addEventListener("load", paparRingkasanRefund);
