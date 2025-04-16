async function loginUser(e) {
    e.preventDefault();
  
    const key = document.getElementById("username").value.toLowerCase();
    const pass = document.getElementById("password").value;
    const statusDiv = document.getElementById("loginStatus");
  
    statusDiv.innerHTML = "🔄 Semakan sedang dijalankan...";
  
    try {
      const url = `https://script.google.com/macros/s/AKfycbwd7yyyEplzw6DwpP9hhQj8fgRxF2e2JR2oCxQymwzQel2bg_88k8sQVrgHot2eoTdaGQ/exec?key=${key}&password=${pass}`;
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status === "success") {
        // Simpan data login dalam localStorage
        localStorage.setItem("user", JSON.stringify(data));
        // Redirect ke dashboard
        window.location.href = "akaun.html?key=" + data.key;
      } else {
        statusDiv.innerHTML = "❌ Kod atau kata laluan salah.";
      }
    } catch (err) {
      console.error("Login Error:", err);
      statusDiv.innerHTML = "❌ Ralat sistem. Cuba lagi.";
    }
  }
  