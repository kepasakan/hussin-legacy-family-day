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
    const infoBox = document.getElementById("bayaranInfo");
    if (infoBox) {
      infoBox.innerHTML = `...`;
    }

    if (data.status === "success") {
      document.getElementById("namaKeluarga").innerHTML = `Selamat datang, <strong>${data.nama}</strong>!`;
      document.getElementById("namaKey").innerHTML = `🔑 (key: <code>${data.key}</code>)`;
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


async function semakKutipanKeluargaIni() {
  const resultBox = document.getElementById("resultKutipan");
  resultBox.innerHTML = `
    <div class="spinner-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#fbb034" stroke-width="10" stroke-dasharray="164.9 56.9">
          <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 50 50;360 50 50"/>
        </circle>
      </svg>
      <span>Memuatkan maklumat kutipan...</span>
    </div>
  `;

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycby8lsWaj4hrHeGKs_MjDzDIj9uhlK7vBeocLOoqEMgnUg_00TxscAoVdfikDCcXg6l7WA/exec?key=${key}`);
    const data = await res.json();
    if (data.status !== "success") throw new Error("Gagal fetch");

    resultBox.innerHTML = `
      <div class="kutipan-column">
        <div class="info-box">
          <div class="info-title">Jumlah Bayaran</div>
          <div class="info-value">RM ${parseFloat(data.jumlah_bayaran).toFixed(2)}</div>
        </div>
        <div class="info-box">
          <div class="info-title">Jumlah Perlu Bayar</div>
          <div class="info-value">RM ${parseFloat(data.jumlah_perlu).toFixed(2)}</div>
        </div>
        <div class="info-box">
          <div class="info-title">Jumlah Tambahan</div>
          <div class="info-value">RM ${parseFloat(data.jumlah_tambahan).toFixed(2)}</div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("❌ Gagal load kutipan:", err);
    resultBox.innerHTML = `<p style="color:red">❌ Gagal load maklumat kutipan.</p>`;
  }
}

// ✅ Monthly Payment (with loading spinner)
async function semakBayaranBulan() {
  const resultBox = document.getElementById("resultBayaranTable");
  const loading = document.getElementById("loadingBayaran");
  resultBox.innerHTML = "";
  loading.style.display = "flex";

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbx7A5ZjxGoAkocbWdJR2a2ZHiemeUXqjrvdVK_FsTEFa2TQVxEqlUygtZZEmaZ_7ZORag/exec?key=${key}`);
    const data = await res.json();

    if (data.status !== "success") throw new Error("Gagal fetch");

    const bulanPenuh = [
      "JAN", "FEB", "MAC", "APR",
      "MEI", "JUN", "JUL", "OGS",
      "SEP", "OKT", "NOV", "DIS"
    ];
    const paid = (data.paid || []).map(b => b.slice(0, 3).toUpperCase());

    const gridWrapper = document.createElement("div");
    gridWrapper.className = "bayaran-grid";

    const currentMonthIndex = new Date().getMonth();
    const noPayBulan = ["JAN", "FEB", "MAC"];

    bulanPenuh.forEach((bulan, index) => {
      const item = document.createElement("div");
      const bulanText = document.createElement("div");
      bulanText.className = "bulan-text";
      bulanText.textContent = bulan;

      // ✅ Jika bulan tidak dikutip
      if (noPayBulan.includes(bulan)) {
        item.className = "grid-item";
        item.style.backgroundColor = "#111";
        item.style.color = "#666";
        item.style.cursor = "not-allowed";
        item.title = "Bulan ini tidak dikutip";
      }
      // ✅ Jika sudah bayar
      else if (paid.includes(bulan)) {
        item.className = "grid-item bayar";
      }
      // ✅ Jika bulan lepas & belum bayar
      else if (index < currentMonthIndex) {
        item.className = "grid-item belum";
      }
      // ✅ Jika belum sampai tarikhnya
      else {
        item.className = "grid-item belum-akan";
      }

      item.appendChild(bulanText);
      gridWrapper.appendChild(item);
    });

    resultBox.appendChild(gridWrapper);
  } catch (err) {
    console.error("❌ Gagal load bayaran bulan:", err);
    resultBox.innerHTML = "❌ Gagal load bayaran bulan.";
  } finally {
    loading.style.display = "none";
  }
}


window.onload = function () {
  loadDashboard();
  semakKutipanKeluargaIni();
  semakBayaranBulan();
};
