// ✅ Ambil key dari URL (contoh: akaun.html?key=faiz)
const urlParams = new URLSearchParams(window.location.search);
const key = urlParams.get('key');

// ✅ API URL login yang kau buat tadi
const LOGIN_API = "https://script.google.com/macros/s/AKfycbwd7yyyEplzw6DwpP9hhQj8fgRxF2e2JR2oCxQymwzQel2bg_88k8sQVrgHot2eoTdaGQ/exec";

// ✅ API URL untuk kehadiran (guna doGet)
const KEHADIRAN_API = "https://script.google.com/macros/s/AKfycbyHYbfwty1HZEny75Sj8qZycLjryUI_6v4ccG9CaFgadDEDbeJeBDZj1hXbPzjO7txE/exec";


// ✅ Fetch nama keluarga & bayaran
async function loadDashboard() {
  if (!key) return;

  try {
    const res = await fetch(`${LOGIN_API}?key=${key}`);
    const data = await res.json();

    if (data.status === "success") {
      document.getElementById("namaKeluarga").innerHTML = `Selamat datang, <strong>${data.nama}</strong>!`;
      document.getElementById("namaKey").innerHTML = `🔑 (key: <code>${data.key}</code>)`;
      document.getElementById("bayaranInfo").innerHTML = `
        🔒 Key anda: <code>${data.key}</code><br>
      `;
    } else {
      document.getElementById("namaKeluarga").textContent = "❌ Akaun tidak dijumpai.";
    }
  } catch (err) {
    console.error("❌ Gagal load akaun:", err);
  }
}

// ✅ Function bila user submit kehadiran (guna GET untuk elak CORS)
document.getElementById("formKehadiran").addEventListener("submit", async function(e) {
  e.preventDefault();

  const kehadiran = document.getElementById("kehadiranSelect").value;
  const resultDiv = document.getElementById("kehadiranResult");
  const loadingDiv = document.getElementById("kehadiranLoading");

  if (!kehadiran) {
    resultDiv.textContent = "⚠️ Sila pilih kehadiran dahulu.";
    return;
  }

  // ✅ Tunjuk loading
  resultDiv.textContent = "";
  loadingDiv.style.display = "inline-block";

  try {
    const url = `${KEHADIRAN_API}?key=${encodeURIComponent(key)}&kehadiran=${encodeURIComponent(kehadiran)}`;
    const response = await fetch(url);
    const result = await response.json();

    loadingDiv.style.display = "none"; // ✅ Sembunyi spinner

    if (result.status === "success") {
      resultDiv.textContent = "✅ Kehadiran berjaya dihantar!";
    } else {
      resultDiv.textContent = "❌ Gagal hantar kehadiran.";
    }

  } catch (error) {
    loadingDiv.style.display = "none"; // ✅ Sembunyi spinner walaupun error
    console.error("❌ Error:", error);
    resultDiv.textContent = "❌ Masalah semasa hantar data.";
  }
});


// ✅ SEMAK STATUS KUTIPAN untuk akaun ini (guna key)
async function semakKutipanKeluargaIni() {
  const loadingDiv = document.getElementById("loadingSemak");
  const resultDiv = document.getElementById("resultKutipan");

  if (!key) return;

  resultDiv.innerHTML = "";
  loadingDiv.style.display = "block";

  const url = `https://script.google.com/macros/s/AKfycbw5899UUEP5g3so6vn_DkMA7s2ou2EHNd_UY0pmFYge23Ka1jdMxHsI9qWAsbBSAP6cHA/exec?key=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
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
    console.error("❌ Error:", error);
  }
}

window.onload = function () {
  loadDashboard();
  semakKutipanKeluargaIni(); // ✅ Panggil semakan automatik
};
