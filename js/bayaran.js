// ✅ Ambil elemen-elemen dari form HTML
const namaEl = document.getElementById("nama");
const jenisEl = document.getElementById("jenis");
const referenceEl = document.getElementById("reference");
const jumlahEl = document.getElementById("jumlah");
const resitEl = document.getElementById("resit");
const resultBox = document.getElementById("resultBox");

const loadingStatus = document.getElementById("loadingStatus");

// ✅ Auto-generate "reference" bila user pilih nama + jenis
function updateReference() {
  const nama = namaEl.value;
  const jenis = jenisEl.value;
  referenceEl.value = nama && jenis ? `${nama}-${jenis}` : "";
}

namaEl.addEventListener("change", updateReference);
jenisEl.addEventListener("change", updateReference);

// ✅ Bila user tekan butang "Hantar"
document.getElementById("paymentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // ✅ Tunjuk loading
  loadingStatus.style.display = "block";

  const nama = namaEl.value;
  const jenis = jenisEl.value;
  const jumlah = jumlahEl.value;
  const reference = referenceEl.value;
  const resitFile = resitEl.files[0];

  const receipt = resitFile ? resitFile.name : "";

  if (!nama || !jenis || !jumlah || !receipt || !reference) {
    alert("⚠️ Sila lengkapkan semua maklumat sebelum hantar.");
    loadingStatus.style.display = "none"; // Sembunyi semula
    return;
  }

  try {
    // ✅ Step 1: Upload ke Telegram
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
      window.location.href = "bayaran_gagal.html"; // ❌ redirect ke halaman gagal
      return;
    }

    // ✅ Step 2: Hantar ke Google Sheet (via doGet)
    const endpoint = "https://script.google.com/macros/s/AKfycbyI-DJk0Q8z1erH2XQFcaCb9uyR1NBrOJHteWse8gPQG6UT8h7h53gA9xEjn96iaNDi/exec";
    const url = `${endpoint}?nama=${encodeURIComponent(nama)}&jenis=${encodeURIComponent(jenis)}&jumlah=${encodeURIComponent(jumlah)}&receipt=${encodeURIComponent(receipt)}&reference=${encodeURIComponent(reference)}`;

    const res = await fetch(url);
    const text = await res.text();

    if (text.includes("✅")) {
      window.location.href = "bayaran_berjaya.html"; // ✅ redirect ke halaman berjaya
    } else {
      window.location.href = "bayaran_gagal.html"; // ❌ jika gagal masuk ke Google Sheet
    }

  } catch (err) {
    console.error("❌ Error:", err);
    window.location.href = "bayaran_gagal.html"; // ❌ Error semasa proses
  } finally {
    loadingStatus.style.display = "none"; // Sembunyi semula (fallback)
  }
});
