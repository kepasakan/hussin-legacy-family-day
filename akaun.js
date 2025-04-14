// ✅ Ambil key dari URL (contoh: akaun.html?key=faiz)
const urlParams = new URLSearchParams(window.location.search);
const key = urlParams.get('key');

// ✅ API URL login yang kau buat tadi
const LOGIN_API = "https://script.google.com/macros/s/AKfycbwd7yyyEplzw6DwpP9hhQj8fgRxF2e2JR2oCxQymwzQel2bg_88k8sQVrgHot2eoTdaGQ/exec";

// ✅ Fetch nama keluarga & bayaran
async function loadDashboard() {
  if (!key) return;

  try {
    const res = await fetch(`${LOGIN_API}?key=${key}`);
    const data = await res.json();

    if (data.status === "success") {
      document.getElementById("namaKeluarga").textContent = `Selamat datang, ${data.nama}`;
      // Optional: kalau nak tunjuk juga status bayaran dummy
      document.getElementById("bayaranInfo").innerHTML = `
        🔒 Key anda: <code>${data.key}</code><br>
        💬 Status bayaran akan dimasukkan kemudian.
      `;
    } else {
      document.getElementById("namaKeluarga").textContent = "❌ Akaun tidak dijumpai.";
    }
  } catch (err) {
    console.error("❌ Gagal load akaun:", err);
  }
}

// ✅ Function bila user submit kehadiran
document.getElementById("formKehadiran").addEventListener("submit", async function(e) {
  e.preventDefault();

  const kehadiran = document.getElementById("kehadiranSelect").value;
  const resultDiv = document.getElementById("kehadiranResult");

  if (!kehadiran) {
    resultDiv.textContent = "⚠️ Sila pilih kehadiran dahulu.";
    return;
  }

  try {
    // Replace this URL with your kehadiran Google Apps Script
    const response = await fetch("https://script.google.com/macros/s/AKfycbyHYbfwty1HZEny75Sj8qZycLjryUI_6v4ccG9CaFgadDEDbeJeBDZj1hXbPzjO7txE/exec", {
      method: "POST",
      body: JSON.stringify({ key, kehadiran }),
      headers: { "Content-Type": "application/json" },
    });
    
    const result = await response.json();
    if (result.status === "success") {
      resultDiv.textContent = "✅ Kehadiran berjaya dihantar!";
    } else {
      resultDiv.textContent = "❌ Gagal hantar kehadiran.";
    }

  } catch (error) {
    console.error("❌ Error:", error);
    resultDiv.textContent = "❌ Masalah semasa hantar data.";
  }
});

// Auto-run bila page dibuka
window.onload = loadDashboard;
