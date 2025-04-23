// 📌 Auto-update chip color based on Google Sheet status

// ✅ Show animated loading spinner (style via CSS)
document.querySelectorAll('.chip').forEach(chip => {
    chip.classList.remove("hadir", "tak-hadir", "belum-pasti");
    chip.innerHTML = '<span class="spinner"></span>'; // 👈 Spinner loading
    chip.style.opacity = "0.6";
  });
  
  fetch("https://script.google.com/macros/s/AKfycbyzIGPIqBizA05PhBPSIW5sVQgE1uiklRL5sbiGXc_WWBtCEhzPQ_D7Kz6NvMUu-pyIAA/exec")
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        const key = item.key?.toLowerCase();
        const rawStatus = item.status;
        const status = (rawStatus || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
  
        const chip = document.querySelector(`.chip[data-key="${key}"]`);
        if (chip) {
          chip.classList.remove("hadir", "tak-hadir", "belum-pasti");
  
          if (status === "hadir") {
            chip.classList.add("hadir");
          } else if (status === "tidak hadir") {
            chip.classList.add("tak-hadir");
          } else {
            chip.classList.add("belum-pasti");
          }
  
          chip.textContent = key.toUpperCase();
          chip.style.opacity = "1";
        }
      });
    })
    .catch(err => console.error("❌ Error fetching kehadiran data:", err));
  
  
    