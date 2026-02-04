
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { LicenseUser } from "../types";

// KONFIGURASI FIREBASE ANDA
// Ganti nilai-nilai di bawah ini dengan konfigurasi dari Firebase Console Anda.
// Masuk ke: Firebase Console > Project Settings > General > Your Apps > SDK Setup/Configuration
const firebaseConfig = {
  apiKey: "ISI_API_KEY_FIREBASE_ANDA",
  authDomain: "aeterna-node.firebaseapp.com",
  projectId: "aeterna-node",
  storageBucket: "aeterna-node.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inisialisasi Firebase (Safe init agar tidak error jika config belum diisi)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Nama Collection di Firestore
const COLLECTION_NAME = "aeterna_config";
const DOC_ID = "license_matrix";

export const FirebaseService = {
  // Simpan database user ke Cloud
  async saveLicenses(users: LicenseUser[]) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, DOC_ID), {
        users: users,
        lastUpdated: new Date().toISOString()
      });
      console.log("🔥 Firebase Sync: Data Berhasil Disimpan.");
      return true;
    } catch (error) {
      console.error("🔥 Firebase Sync Error:", error);
      // Fallback: Jika gagal (misal permission denied atau config salah), return false
      return false;
    }
  },

  // Subscribe ke perubahan data secara Real-time
  subscribeToLicenses(callback: (users: LicenseUser[]) => void) {
    try {
      const unsubscribe = onSnapshot(doc(db, COLLECTION_NAME, DOC_ID), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data && data.users) {
            console.log("🔥 Firebase Sync: Data Baru Diterima.");
            callback(data.users as LicenseUser[]);
          }
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("🔥 Firebase Subscribe Error:", error);
      return () => {}; // Return fungsi kosong jika error
    }
  }
};
