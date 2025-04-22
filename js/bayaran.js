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

const bulanPenuh = ["JAN", "FEB", "MAC", "APR", "MEI", "JUN", "JUL", "OGS", "SEP", "OKT", "NOV", "DIS"];
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
  const currentMonthIndex = new Date().getMonth();

  bulanPenuh.forEach((bulan, index) => {
    const btn = document.createElement("button");
    btn.textContent = bulan;
    btn.type = "button";
    btn.className = "bulan-btn";

    if (paid.includes(bulan)) {
      btn.disabled = true;
      btn.style.opacity = 0.3;
    }

    if (index === 0 && isAfterSelection && paid.includes("JAN")) {
      btn.disabled = true;
      btn.style.opacity = 0.3;
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
}

// ✅ Fetch bulan berdasarkan nama (key)
async function fetchBulanForKey(key) {
  bulanContainer.innerHTML = "";
  bulanLoading.style.display = "flex";

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbx7A5ZjxGoAkocbWdJR2a2ZHiemeUXqjrvdVK_FsTEFa2TQVxEqlUygtZZEmaZ_7ZORag/exec?key=${key}`);
    const data = await res.json();
    if (data.status !== "success") throw new Error("Fetch gagal");

    const paid = (data.paid || []).map(b => b.slice(0, 3).toUpperCase());
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
    formData.append("photo", resitFile);
    formData.append("caption", `Resit dari ${nama} untuk ${jenis} (RM${jumlah})\nRef: ${reference}`);

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: formData
    });

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


// ✅ Init
renderBulanButtons();
renderNamaButtons();
