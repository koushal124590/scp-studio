// Firebase SDK initialization for SCP Studio
const firebaseConfig = {
  apiKey: "AIzaSyDwgirpaSCSblwsDyl85oicF3wGCyw31Q4",
  authDomain: "scp-studio-da6c8.firebaseapp.com",
  projectId: "scp-studio-da6c8",
  storageBucket: "scp-studio-da6c8.firebasestorage.app",
  messagingSenderId: "449331101955",
  appId: "1:449331101955:web:60402c29f6cb443ed5e936"
};

// Export config for global window or module consumption
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}
