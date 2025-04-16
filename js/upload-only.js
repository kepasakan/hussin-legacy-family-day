// ✅ Import SDK Firebase dan Storage
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getStorage, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// ✅ Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBgiILukwhHV1kjNZ4SAVllLsCRVPWhgKg",
  authDomain: "familyday2025-4265c.firebaseapp.com",
  projectId: "familyday2025-4265c",
  storageBucket: "familyday2025-4265c.appspot.com",
  messagingSenderId: "102980793748",
  appId: "1:102980793748:web:2ab10f95f42022b6628b81"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ✅ Fungsi untuk upload gambar
window.uploadImage = function () {
  const fileInput = document.getElementById("uploadFile");
  const status = document.getElementById("status");

  if (!fileInput.files.length) {
    status.innerHTML = "❌ Sila pilih fail terlebih dahulu.";
    return;
  }

  const file = fileInput.files[0];
  const storageRef = ref(storage, `resit/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  status.innerHTML = "⏳ Sedang muat naik...";

  uploadTask.on(
    "state_changed",
    null,
    (error) => {
      status.innerHTML = `❌ Gagal muat naik: ${error.message}`;
    },
    () => {
      status.innerHTML = "✅ Selesai upload! Gambar disimpan dalam Firebase Storage.";
    }
  );
};
