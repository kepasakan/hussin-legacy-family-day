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

      row.innerHTML = `
        <td>${item.nama}</td>
        <td>${item.bayaran}</td>
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
  
