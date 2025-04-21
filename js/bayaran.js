// ✅ Ambil elemen-elemen dari form HTML
const namaEl = document.getElementById("nama");
const jenisEl = document.getElementById("jenis");
const referenceEl = document.getElementById("reference");
const jumlahEl = document.getElementById("jumlah");
const resitEl = document.getElementById("resit");
const resultBox = document.getElementById("resultBox");
const bulanContainer = document.getElementById("bulanContainer");
const loadingStatus = document.getElementById("loadingStatus");
const bulanLoading = document.getElementById("bulanLoading");

let selectedBulanBtn = null;
const bulanPenuh = ["JAN", "FEB", "MAC", "APR", "MEI", "JUN", "JUL", "OGS", "SEP", "OKT", "NOV", "DIS"];

// ✅ Generate butang bulan berdasarkan senarai paid
function renderBulanButtons(paid = [], isAfterSelection = false) {
  bulanContainer.innerHTML = "";
  const currentMonthIndex = new Date().getMonth();

  bulanPenuh.forEach((bulan, index) => {
    const btn = document.createElement("button");
    btn.textContent = bulan;
    btn.type = "button";
    btn.className = "bulan-btn";

    const isPaid = paid.includes(bulan);
    const isFuture = index >= currentMonthIndex;
    const isBeforeNow = index < currentMonthIndex;

    // ✅ Disable jika telah dibayar
    if (isPaid) {
      btn.disabled = true;
      btn.style.opacity = 0.3;
    }

    // ✅ JAN hanya disable kalau memang sudah dibayar
    if (index === 0 && isPaid) {
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
}

// ✅ Auto-generate reference
function updateReferenceManual() {
  const nama = namaEl.value;
  const bulan = jenisEl.value;
  referenceEl.value = nama && bulan ? `${nama}-${bulan}` : "";
}

// ✅ Bila user tukar nama keluarga
namaEl.addEventListener("change", async () => {
  jenisEl.value = "";
  referenceEl.value = "";
  if (selectedBulanBtn) selectedBulanBtn.classList.remove("selected-bulan");

  const key = namaEl.value;
  if (!key) {
    bulanContainer.innerHTML = "";
    renderBulanButtons(); // render normal bila belum pilih family
    return;
  }

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
});

// ✅ Bila user tekan butang "Hantar"
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

// ✅ Init default button bila belum pilih apa-apa
renderBulanButtons();
