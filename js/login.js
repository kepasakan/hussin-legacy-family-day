// ✅ Data hardcoded atau ambil dari Google Sheet kalau perlu
const users = [
  { key: "pakcik", nama: "Keluarga Pakcik" },
  { key: "pakjang", nama: "Keluarga Pakjang" },
  { key: "fahmi", nama: "Keluarga Fahmi" },
  { key: "hafiz", nama: "Keluarga Hafiz" },
  { key: "hanis", nama: "Keluarga Hanis" },
  { key: "wani", nama: "Keluarga Wani" },
  { key: "wan", nama: "Keluarga Wan" },
  { key: "ika", nama: "Keluarga Ika" },
  { key: "makteh", nama: "Keluarga Makteh" },
  { key: "yana", nama: "Keluarga Yana" },
  { key: "faiz", nama: "Keluarga Faiz" },
  { key: "paksu", nama: "Keluarga Paksu" },
  { key: "naim", nama: "testing" }
];

// ✅ Paparkan senarai button login secara automatik
window.onload = () => {
  const container = document.getElementById("loginList");
  users.forEach(user => {
    const btn = document.createElement("button");
    btn.innerText = user.nama;
    btn.className = "login-btn";
    btn.onclick = () => loginAuto(user.key);
    container.appendChild(btn);
  });
};

// ✅ Auto login bila klik nama keluarga
async function loginAuto(key) {
  const statusDiv = document.getElementById("loginStatus");
  statusDiv.innerHTML = "🔄 Log masuk sedang diproses...";

  try {
    const url = `https://script.google.com/macros/s/AKfycbwd7yyyEplzw6DwpP9hhQj8fgRxF2e2JR2oCxQymwzQel2bg_88k8sQVrgHot2eoTdaGQ/exec?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "success") {
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "akaun.html?key=" + key;
    } else {
      statusDiv.innerHTML = "❌ Gagal log masuk. Sila cuba semula.";
    }
  } catch (err) {
    console.error("Login Error:", err);
    statusDiv.innerHTML = "❌ Ralat sambungan.";
  }
}
