const users = [
  { key: "pakcik", nama: "PAKCIK" },
  { key: "pakjang", nama: "PAKJANG" },
  { key: "fahmi", nama: "FAHMI" },
  { key: "hafiz", nama: "HAFIZ" },
  { key: "hanis", nama: "HANIS" },
  { key: "wani", nama: "WANI" },
  { key: "wan", nama: "WAN" },
  { key: "ika", nama: "IKA" },
  { key: "makteh", nama: "MAKTEH" },
  { key: "yana", nama: "YANA" },
  { key: "faiz", nama: "FAIZ" },
  { key: "paksu", nama: "PAKSU" }
];

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

async function loginAuto(key) {
  const statusDiv = document.getElementById("loginStatus");
  statusDiv.innerHTML = `<span class="spinner"></span> Log masuk sedang diproses...`;

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
