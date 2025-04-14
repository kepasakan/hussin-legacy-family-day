// ======================================================
// 🎉 COUNTDOWN TARIKH FAMILY DAY (May 1, 2025 - 8:00 AM)
// ======================================================
const countDownDate = new Date("May 1, 2025 08:00:00").getTime();

const countdown = setInterval(function () {
  const now = new Date().getTime();
  const distance = countDownDate - now;

  if (distance < 0) {
    clearInterval(countdown);
    document.getElementById("countdown").innerHTML = "🎉 Family Day bermula!";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("countdown").innerHTML =
    `⏳ Tinggal ${days} hari ${hours} jam ${minutes} minit ${seconds} saat`;
}, 1000);


// ==================================================
// 📊 KIRA JUMLAH KUTIPAN DARI Sheet2
// ==================================================
async function kiraKutipanAutomatik() {
  const url = "https://script.google.com/macros/s/AKfycbyAYkTIVoWtirHtKWUDJOlkDXH0WkSNzuiwesrwtmCNCY3M_dLiZ8oDqQCeOpX628C1KA/exec";

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "success") {
      const target = 2000;
      const terkumpul = data.total_jumlah;
      const baki = target - terkumpul;
      const percent = Math.min(Math.round((terkumpul / target) * 100), 100);

      document.getElementById("jumlahTerkumpul").textContent = terkumpul;
      document.getElementById("bakiKutipan").textContent = baki <= 0 ? 0 : baki;

      const bar = document.getElementById("overallProgress");
      bar.style.width = percent + "%";
      bar.textContent = percent + "%";
    }
  } catch (err) {
    console.error("❌ Gagal tarik data kutipan:", err);
  }
}

// ==================================================
// 🍔 TOGGLE HAMBURGER MENU UNTUK MOBILE
// ==================================================
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("show");
}

// ✅ Auto load bila buka page
window.onload = function () {
  kiraKutipanAutomatik();
};
