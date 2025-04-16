// ✅ Ambil elemen-elemen dari form HTML
const namaEl = document.getElementById("nama");         // dropdown nama keluarga
const jenisEl = document.getElementById("jenis");       // dropdown jenis bayaran (bulan/tambahan)
const referenceEl = document.getElementById("reference"); // input reference auto generate
const jumlahEl = document.getElementById("jumlah");     // jumlah bayaran
const resitEl = document.getElementById("resit");       // upload gambar resit
const resultBox = document.getElementById("resultBox"); // paparan status upload

// ✅ Auto-generate "reference" bila user pilih nama + jenis
function updateReference() {
  const nama = namaEl.value;
  const jenis = jenisEl.value;
  referenceEl.value = nama && jenis ? `${nama}-${jenis}` : "";
}

// ✅ Trigger auto-generate bila user tukar dropdown
namaEl.addEventListener("change", updateReference);
jenisEl.addEventListener("change", updateReference);

// ✅ Bila user tekan butang "Hantar"
document.getElementById("paymentForm").addEventListener("submit", async function (e) {
  e.preventDefault(); // prevent default reload behavior

  // ✅ Ambil semua nilai dari form
  const nama = namaEl.value;
  const jenis = jenisEl.value;
  const jumlah = jumlahEl.value;
  const reference = referenceEl.value;
  const resitFile = resitEl.files[0];

  const receipt = resitFile ? resitFile.name : "";

  // ✅ Validation – pastikan semua wajib isi
  if (!nama || !jenis || !jumlah || !receipt || !reference) {
    alert("⚠️ Sila lengkapkan semua maklumat sebelum hantar.");
    return;
  }

  try {
    // ✅ Upload gambar ke Telegram dahulu
    const botToken = "7740099280:AAGy5g6SME7yeuxXUgSSnSUwma6uJyH-g94";
    const chatId = "-1002518767864"; // channel username with @

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
      alert("❌ Gagal upload resit ke Telegram: " + tgJson.description);
      return;
    }

    // ✅ Upload data ke Google Sheet (guna doGet)
    const endpoint = "https://script.google.com/macros/s/AKfycbyI-DJk0Q8z1erH2XQFcaCb9uyR1NBrOJHteWse8gPQG6UT8h7h53gA9xEjn96iaNDi/exec";
    const url = `${endpoint}?nama=${encodeURIComponent(nama)}&jenis=${encodeURIComponent(jenis)}&jumlah=${encodeURIComponent(jumlah)}&receipt=${encodeURIComponent(receipt)}&reference=${encodeURIComponent(reference)}`;

    const res = await fetch(url);
    const text = await res.text();

    if (text.includes("✅")) {
      alert("✅ Bayaran berjaya dihantar!");
      document.getElementById("paymentForm").reset();
      referenceEl.value = "";
    } else {
      alert("❌ Gagal hantar data ke Sheet: " + text);
    }

  } catch (err) {
    console.error("❌ Ralat:", err);
    alert("❌ Ralat semasa proses penghantaran.");
  }
});
