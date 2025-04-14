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
// 🔍 SEMAK STATUS KATA KUNCI (Sheet1)
// ==================================================
async function checkPayment() {
  const key = document.getElementById("accessKey").value.toLowerCase();
  const resultDiv = document.getElementById("result");
  const loadingDiv = document.getElementById("loading");

  resultDiv.innerHTML = "";
  loadingDiv.style.display = "block";

  const url = `https://script.google.com/macros/s/AKfycbw5899UUEP5g3so6vn_DkMA7s2ou2EHNd_UY0pmFYge23Ka1jdMxHsI9qWAsbBSAP6cHA/exec?key=${key}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const data = JSON.parse(text);
    loadingDiv.style.display = "none";

    if (data.status === "error") {
      resultDiv.innerHTML = "❌ Kata kunci tidak sah.";
      return;
    }

    const percent = Math.round((data.bayar / data.perlu) * 100);
    let barColor = "#f44336";
    if (percent === 100) barColor = "#4CAF50";
    else if (percent >= 50) barColor = "#FF9800";

    resultDiv.innerHTML = `
      <div style="font-size:1.2rem; color:#b71c1c;">🏡 <strong>${data.nama}</strong></div>
      💰 <span style="color:#f57c00;"><strong>Jumlah perlu bayar:</strong> RM${data.perlu}</span><br>
      ✅ <span style="color:#388e3c;"><strong>Sudah bayar:</strong> RM${data.bayar}</span><br>
      🧾 <strong>Baki:</strong> RM${data.perlu - data.bayar}
      <div class="progress-container">
        <div class="progress-bar" style="width:${percent}%; background-color:${barColor}; transition: width 1s ease-in-out;">${percent}%</div>
      </div>
    `;
  } catch (error) {
    loadingDiv.style.display = "none";
    resultDiv.innerHTML = "❌ Gagal semak data.";
    console.error("Error:", error);
  }
}

// ==================================================
// 📊 KIRA JUMLAH KUTIPAN DARI Sheet1 + Sheet2
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

// ✅ Auto load bila buka page
window.onload = function () {
  kiraKutipanAutomatik();
};
