import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { showAlert } from "./ui.js";

const authForm = document.getElementById("authForm");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const userInfo = document.getElementById("userInfo");

onAuthStateChanged(auth, (user) => {
  authSection.classList.toggle("d-none", !!user);
  appSection.classList.toggle("d-none", !user);
  userInfo.classList.toggle("d-none", !user);
  if (user) document.getElementById("userEmail").textContent = user.email;
});

function getCredentials() {
  authForm.classList.add("was-validated");
  if (!authForm.checkValidity()) return null;
  return [
    document.getElementById("authEmail").value.trim(),
    document.getElementById("authPassword").value,
  ];
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cred = getCredentials();
  if (!cred) return;
  try {
    await signInWithEmailAndPassword(auth, ...cred);
    showAlert("Logged in successfully.");
  } catch (err) {
    showAlert("Login failed: " + err.message, "danger");
  }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  const cred = getCredentials();
  if (!cred) return;
  try {
    await createUserWithEmailAndPassword(auth, ...cred);
    showAlert("Account created.");
  } catch (err) {
    showAlert("Sign up failed: " + err.message, "danger");
  }
});

document
  .getElementById("logoutBtn")
  .addEventListener("click", () => signOut(auth));
