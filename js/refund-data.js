// =====================================================================
// 💸 DATA REFUND — Hussin Legacy Family Day 2026 (DIBATALKAN)
// =====================================================================
// Jumlah setiap keluarga bayar ditarik TERUS dari Google Sheets (live),
// jadi fail ini HANYA rekod duit yang dah dipulangkan oleh bendahari.
//
// Bila dah transfer kepada satu keluarga:
//   1. Simpan screenshot resit transfer dalam folder  asset/refund/
//      (contoh: asset/refund/paksu.jpg)
//   2. Tambah satu baris dalam senarai keluarga tu, contoh:
//
//        paksu: [
//          { jumlah: 550, tarikh: "2026-11-20", resit: "paksu.jpg" },
//        ],
//
//      - jumlah : RM yang dipindahkan (nombor sahaja)
//      - tarikh : tarikh transfer, format "YYYY-MM-DD"
//      - resit  : nama fail dalam asset/refund/  ATAU  link Google Drive
//      - nota   : (pilihan) contoh "Transfer ke akaun isteri"
//
//      Kalau transfer dua kali (contoh separuh-separuh), tambah dua baris.
//   3. Commit & push. Page refund & laman utama akan update sendiri.
// =====================================================================

const REFUND_DATA = {
  pakcik:  [],
  pakjang: [],
  fahmi:   [],
  hafiz:   [],
  hanis:   [],
  wani:    [],
  wan:     [],
  ika:     [],
  makteh:  [],
  yana:    [],
  faiz:    [],
  paksu:   [],
};
