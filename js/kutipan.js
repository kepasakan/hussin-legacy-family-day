// Fetch total jumlah dari Sheet2
fetch("https://script.google.com/macros/s/AKfycbyAYkTIVoWtirHtKWUDJOlkDXH0WkSNzuiwesrwtmCNCY3M_dLiZ8oDqQCeOpX628C1KA/exec")
  .then(res => res.json())
  .then(data => {
    const totalBox = document.getElementById("totalKutipan");
    if (totalBox) {
      totalBox.textContent = `RM ${data.total_jumlah.toFixed(2)}`;
    }
  })
  .catch(err => {
    console.error("❌ Gagal fetch jumlah kutipan:", err);
    const totalBox = document.getElementById("totalKutipan");
    if (totalBox) {
      totalBox.textContent = "Gagal dapatkan data";
    }
  });

// Fetch data bayaran dari bayaran-dashboard
fetch("https://script.google.com/macros/s/AKfycbyBj2Pwn_jVIhHrlJNqp9pw62CV804tD5SgMlxXIHYqE6DoStfXuzEQiKtyW5Wk3ecU7A/exec")
  .then(res => res.json())
  .then(data => {
    const tableBody = document.getElementById("kutipan-table-body");
    tableBody.innerHTML = ""; // clear placeholder

    const reversed = data.data.reverse();
    reversed.forEach(item => {
      const row = document.createElement("tr");

      // Format tarikh ISO kepada dd/mm/yyyy
      const rawDate = new Date(item.tarikh);
      const formattedDate = rawDate.toLocaleDateString("en-GB"); // output: 15/04/2025


      const resitLink = item.receipt?.startsWith("http")
        ? `<a href="${item.receipt}" target="_blank" style="color:white; text-decoration:underline;">📎 Lihat</a>`
        : "-";

      // Helper function for excel date
      const formatBayaran = (val) => {
        // If number and looks like a date serial (e.g. > 40000 which is year ~2009)
        if (!isNaN(val) && parseFloat(val) > 40000) {
          const date = new Date((val - 25569) * 86400 * 1000);
          // Format: JAN 26
          return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }).toUpperCase().replace(" ", "");
        }
        return val;
      };

      const displayBayaran = formatBayaran(item.bayaran);

      row.innerHTML = `
        <td>${item.nama}</td>
        <td>${displayBayaran}</td>
        <td>RM ${item.jumlah}</td>
        <td>${resitLink}</td>
        <td>${formattedDate}</td>
      `;

      tableBody.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Gagal fetch kutipan:", err);
    document.getElementById("kutipan-table-body").innerHTML = `
      <tr><td colspan="5" style="text-align:center;">Gagal dapatkan data</td></tr>`;
  });

// Kutipan Digunakan

const totalKutipanEl = document.getElementById("totalKutipan");
const jumlahDigunakanEl = document.getElementById("jumlahDigunakan");
const bakiKutipanEl = document.getElementById("bakiKutipan");

let totalKutipan = 0;
let totalDigunakan = 0;

fetch("https://script.google.com/macros/s/AKfycbyAYkTIVoWtirHtKWUDJOlkDXH0WkSNzuiwesrwtmCNCY3M_dLiZ8oDqQCeOpX628C1KA/exec")
  .then(res => res.json())
  .then(data => {
    totalKutipan = data.total_jumlah;
    totalKutipanEl.textContent = `RM ${totalKutipan.toFixed(2)}`;
    updateBakiKutipan(); // panggil lepas fetch pertama
  });


fetch("https://script.google.com/macros/s/AKfycbz4OZOoQOsvhWKvAeGtkDGSfBeZk-EMTe1F5XcStzTLp52M-_rKUZLGbCyQTb_1cF5FBA/exec")
  .then(res => res.json())
  .then(data => {
    const tableBody = document.getElementById("digunakan-table-body");
    tableBody.innerHTML = "";

    const reversed = Array.isArray(data.data) ? data.data.reverse() : [];

    reversed.forEach(item => {
      const resitLink = item.resit?.startsWith("http")
        ? `<a href="${item.resit}" target="_blank" style="color: white;">📎 Lihat</a>`
        : "-";


      const tarikhFormatted = new Date(item.tarikh).toLocaleDateString("ms-MY");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.pembelian}</td>
        <td>${item.pembeli}</td>
        <td>RM ${Number(item.jumlah).toFixed(2)}</td>
        <td>${resitLink}</td>
        <td>${tarikhFormatted}</td>
      `;
      tableBody.appendChild(row);
    });

    totalDigunakan = data.total_digunakan;
    jumlahDigunakanEl.textContent = `RM ${totalDigunakan.toFixed(2)}`;
    updateBakiKutipan();
  })
  .catch(err => {
    console.error("❌ Gagal fetch penggunaan:", err);
    document.getElementById("digunakan-table-body").innerHTML = `
      <tr><td colspan="5" style="text-align:center;">Gagal dapatkan data</td></tr>`;
  });

// Last Update Sah Date & Time

fetch('https://script.google.com/macros/s/AKfycbyHNah09hhUGBjwXzx22Ho8JxHpGYgJjUGog86hLHIw1-vwZ2UzxWakp4qVTQb4hYanSA/exec')
  .then(res => res.json())
  .then(data => {
    const el = document.getElementById("lastVerified");
    if (data.status === "success" && data.date && data.time) {
      el.textContent = `✔️ Disemak & disahkan pada ${data.date}, jam ${data.time}`;
    } else {
      el.textContent = "❌ Gagal dapatkan tarikh semakan terkini.";
    }
  })
  .catch(() => {
    const el = document.getElementById("lastVerified");
    el.textContent = "❌ Gagal sambung ke server semakan.";
  });


function updateBakiKutipan() {
  if (totalKutipan >= 0 && totalDigunakan >= 0) {
    const baki = totalKutipan - totalDigunakan;
    bakiKutipanEl.textContent = `RM ${baki.toFixed(2)}`;
  }
}

