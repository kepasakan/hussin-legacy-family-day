// NOTE: Ambil elemen input yang berkaitan
const namaEl = document.getElementById("nama");
const jenisEl = document.getElementById("jenis");
const referenceEl = document.getElementById("reference");

// NOTE: Fungsi update reference automatik
function updateReference() {
  const nama = namaEl.value;
  const jenis = jenisEl.value;

  if (nama && jenis) {
    referenceEl.value = `${nama}-${jenis}`;
  } else {
    referenceEl.value = "";
  }
}

// NOTE: Trigger update bila pilihan berubah
namaEl.addEventListener("change", updateReference);
jenisEl.addEventListener("change", updateReference);
