// 🎉 Countdown Family Day
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


// 📊 Kutipan Data dari Sheet2
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

// ✅ Status Kehadiran dari Tab 'kehadiran-dashboard'
async function paparkanStatusKehadiran() {
  const tableBody = document.querySelector("#kehadiranTable tbody");
  const loading = document.getElementById("kehadiranLoading");

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbyzIGPIqBizA05PhBPSIW5sVQgE1uiklRL5sbiGXc_WWBtCEhzPQ_D7Kz6NvMUu-pyIAA/exec");
    const data = await res.json();
    loading.style.display = "none";

    data.forEach(item => {
      const row = document.createElement("tr");

      const statusLower = item.status.toLowerCase();
      let statusClass = "";
      if (statusLower === "hadir") statusClass = "hadir-box";
      else if (statusLower === "tidak hadir") statusClass = "tidak-box";

      row.innerHTML = `
        <td>${item.nama}</td>
        <td class="${statusClass}">${item.status}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    loading.textContent = "❌ Gagal ambil data kehadiran.";
    console.error("Error fetch kehadiran:", error);
  }
}


// ✅ Auto run semua bila page buka
window.onload = function () {
  kiraKutipanAutomatik();
  paparkanStatusKehadiran();
};
