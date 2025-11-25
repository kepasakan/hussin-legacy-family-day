// ✅ Ambil elemen-elemen dari form HTML
const namaEl = document.getElementById("nama");
const jenisEl = document.getElementById("jenis");
const referenceEl = document.getElementById("reference");
const jumlahEl = document.getElementById("jumlah");
const resitEl = document.getElementById("resit");
const resultBox = document.getElementById("resultBox");
const bulanContainer = document.getElementById("bulanContainer");
const namaContainer = document.getElementById("namaContainer");
const loadingStatus = document.getElementById("loadingStatus");
const bulanLoading = document.getElementById("bulanLoading");

let selectedBulanBtn = null;
let selectedNamaBtn = null;

const bulanPenuh = [
  "JAN", "FEB", "MAC", "APR", "MEI", "JUN", "JUL", "OGS", "SEP", "OKT", "NOV", "DIS",
  "JAN26", "FEB26", "MAC26", "APR26", "MEI26", "JUN26", "JUL26", "OGS26", "SEP26", "OKT26", "NOV26", "DIS26"
];
const namaData = [
  { nama: "Keluarga Pakcik", key: "pakcik" },
  { nama: "Keluarga Pakjang", key: "pakjang" },
  { nama: "Keluarga Fahmi", key: "fahmi" },
  { nama: "Keluarga Hafiz", key: "hafiz" },
  { nama: "Keluarga Hanis", key: "hanis" },
  { nama: "Keluarga Wani", key: "wani" },
  { nama: "Keluarga Wan", key: "wan" },
  { nama: "Keluarga Ika", key: "ika" },
  { nama: "Keluarga Makteh", key: "makteh" },
  { nama: "Keluarga Yana", key: "yana" },
  { nama: "Keluarga Faiz", key: "faiz" },
  { nama: "Keluarga Paksu", key: "paksu" }
];

// ✅ Generate button nama keluarga
function renderNamaButtons() {
  namaContainer.innerHTML = "";

  namaData.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.nama;
    btn.type = "button";
    btn.className = "bulan-btn";

    btn.addEventListener("click", () => {
      if (selectedNamaBtn) selectedNamaBtn.classList.remove("selected-bulan");
      btn.classList.add("selected-bulan");
      selectedNamaBtn = btn;

      namaEl.value = item.key;
      jenisEl.value = "";
      referenceEl.value = "";
      if (selectedBulanBtn) selectedBulanBtn.classList.remove("selected-bulan");

      fetchBulanForKey(item.key);
    });

    namaContainer.appendChild(btn);
  });
}

// ✅ Generate butang bulan
function renderBulanButtons(paid = [], isAfterSelection = false) {
  bulanContainer.innerHTML = "";

  // ✅ Calculate index based on year (2025 vs 2026)
  const now = new Date();
  let currentMonthIndex = now.getMonth(); // 0-11 for current year
  const currentYear = now.getFullYear();

  if (currentYear === 2026) {
    currentMonthIndex += 12; // Shift for 2026 months
  } else if (currentYear > 2026) {
    currentMonthIndex = 999; // Future
  } else if (currentYear < 2025) {
    currentMonthIndex = -1; // Past
  }

  const currentMonthAbbrev = bulanPenuh[currentMonthIndex];

  bulanPenuh.forEach((bulan, index) => {
    const btn = document.createElement("button");
    btn.textContent = bulan;
    btn.type = "button";
    btn.className = "bulan-btn";

    const noPayBulan = ["JAN", "FEB", "MAC", "APR"];

    if (noPayBulan.includes(bulan)) {
      btn.disabled = true;
      btn.style.backgroundColor = "#111";
      btn.style.color = "#666";
      btn.style.cursor = "not-allowed";
      btn.title = "Bulan ini tidak dikutip";
    } else if (paid.includes(bulan)) {
      btn.disabled = true;
      btn.style.opacity = 0.3;
    }

    // Highlight the button for the current month only if its index is 4 (MEI) or above
    // Note: index 4 is MEI 2025.
    if (index === currentMonthIndex && index >= 4) {
      btn.style.border = "2px solid #FFD700";
      btn.style.boxShadow = "0 0 8px #FFD700";
      btn.title = "Pembayaran untuk bulan ini dibuka!";
    }

    btn.addEventListener("click", () => {
      if (!namaEl.value) {
        alert("⚠️ Sila pilih nama keluarga dahulu.");
        return;
      }

      if (selectedBulanBtn) selectedBulanBtn.classList.remove("selected-bulan");
      btn.classList.add("selected-bulan");
      selectedBulanBtn = btn;

      jenisEl.value = bulan;
      updateReferenceManual();
    });

    bulanContainer.appendChild(btn);
  });


  // ✅ Tambah butang TAMBAHAN (tidak akan disable walaupun pernah bayar)
  renderTambahanButton();
}

// ✅ Tambah butang TAMBAHAN
function renderTambahanButton() {
  const btn = document.createElement("button");
  btn.textContent = "TAMBAHAN";
  btn.type = "button";
  btn.className = "bulan-btn tambahan-btn";

  btn.style.backgroundColor = "#444";
  btn.style.marginTop = "0.5rem";

  btn.addEventListener("click", () => {
    if (!namaEl.value) {
      alert("⚠️ Sila pilih nama keluarga dahulu.");
      return;
    }

    if (selectedBulanBtn) selectedBulanBtn.classList.remove("selected-bulan");
    btn.classList.add("selected-bulan");
    selectedBulanBtn = btn;

    jenisEl.value = "TAMBAHAN";
    updateReferenceManual();
  });

  bulanContainer.appendChild(btn);
}

// ✅ Auto-generate reference
function updateReferenceManual() {
  const nama = namaEl.value;
  const bulan = jenisEl.value;

  referenceEl.value = nama && bulan ? `${nama}-${bulan}` : "";

  // ✅ Auto-set jumlah to 50 if bukan TAMBAHAN
  if (nama && bulan && bulan !== "TAMBAHAN") {
    jumlahEl.value = 50;
    jumlahEl.readOnly = true;
  } else {
    jumlahEl.value = "";
    jumlahEl.readOnly = false;
  }
}

// ✅ Fetch bulan berdasarkan nama (key)
async function fetchBulanForKey(key) {
  bulanContainer.innerHTML = "";
  bulanLoading.style.display = "flex";

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbx7A5ZjxGoAkocbWdJR2a2ZHiemeUXqjrvdVK_FsTEFa2TQVxEqlUygtZZEmaZ_7ZORag/exec?key=${key}`);
    const data = await res.json();
    if (data.status !== "success") throw new Error("Fetch gagal");

    // ✅ Allow full string matching for "JAN26" etc.
    const paid = (data.paid || []).map(b => b.toUpperCase());
    renderBulanButtons(paid, true);

  } catch (err) {
    console.error("❌ Gagal fetch bayaran bulan:", err);
    bulanContainer.innerHTML = "Gagal load butang bulan.";
  } finally {
    bulanLoading.style.display = "none";
  }
}

// ✅ Hantar borang
document.getElementById("paymentForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  loadingStatus.style.display = "block";

  const nama = namaEl.value;
  const jenis = jenisEl.value;
  const jumlah = jumlahEl.value;
  const reference = referenceEl.value;
  const resitFile = resitEl.files[0];
  const receipt = resitFile ? resitFile.name : "";

  if (!nama || !jenis || !jumlah || !receipt || !reference) {
    alert("⚠️ Sila lengkapkan semua maklumat sebelum hantar.");
    loadingStatus.style.display = "none";
    return;
  }

  try {
    const botToken = "7740099280:AAGy5g6SME7yeuxXUgSSnSUwma6uJyH-g94";
    const chatId = "-1002518767864";

    const formData = new FormData();
    formData.append("chat_id", chatId);

    // Detect PDF vs Image and append accordingly
    const isPdf = resitFile.type === "application/pdf";
    if (isPdf) {
      formData.append("document", resitFile);
    } else {
      formData.append("photo", resitFile);
    }
    formData.append("caption", `Resit dari ${nama} untuk ${jenis} (RM${jumlah})\nRef: ${reference}`);

    // Send either a document or a photo
    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/${isPdf ? "sendDocument" : "sendPhoto"}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const tgJson = await tgRes.json();
    if (!tgJson.ok) {
      console.error("❌ Telegram Error:", tgJson.description);
      window.location.href = "bayaran_gagal.html";
      return;
    }

    const endpoint = "https://script.google.com/macros/s/AKfycbyI-DJk0Q8z1erH2XQFcaCb9uyR1NBrOJHteWse8gPQG6UT8h7h53gA9xEjn96iaNDi/exec";
    const url = `${endpoint}?nama=${encodeURIComponent(nama)}&jenis=${encodeURIComponent(jenis)}&jumlah=${encodeURIComponent(jumlah)}&receipt=${encodeURIComponent(receipt)}&reference=${encodeURIComponent(reference)}`;

    const res = await fetch(url);
    const text = await res.text();

    if (text.includes("✅")) {
      window.location.href = "bayaran_berjaya.html";
    } else {
      window.location.href = "bayaran_gagal.html";
    }

  } catch (err) {
    console.error("❌ Error:", err);
    window.location.href = "bayaran_gagal.html";
  } finally {
    loadingStatus.style.display = "none";
  }
});

// ✅ Copy No Akaun Function
function copyAccount() {
  const text = "8888011899390";
  navigator.clipboard.writeText(text)
    .then(() => {
      alert("✔️ No akaun disalin: " + text);
    })
    .catch(() => {
      alert("❌ Gagal salin no akaun");
    });
}

function copyAccount() {
  const accountNumber = "8888011899390"; // without dash
  navigator.clipboard.writeText(accountNumber).then(() => {
    const copyText = document.getElementById("copyText");
    copyText.innerText = "✔️ Disalin!";

    setTimeout(() => {
      copyText.innerText = "Salin No Akaun";
    }, 1500);
  });
}




// ✅ Init
renderBulanButtons();
renderNamaButtons();
