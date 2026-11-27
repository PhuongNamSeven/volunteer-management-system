import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { showAlert } from "./ui.js";

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const resetBtn = document.getElementById("resetBtn");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const userInfo = document.getElementById("userInfo");

// Friendly error messages 
const ERROR_MESSAGES = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your internet connection."
};

function authMessage(err) {
  return ERROR_MESSAGES[err.code] || "Something went wrong. Please try again.";
}

// Helpers 
function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  signupBtn.disabled = isLoading;
  resetBtn.disabled = isLoading;
}

function getCredentials() {
  authForm.classList.add("was-validated");
  if (!authForm.checkValidity()) return null;
  return [emailInput.value.trim(), passwordInput.value];
}

function clearAuthForm() {
  authForm.reset();
  authForm.classList.remove("was-validated");
}

//  Show / hide sections based on login state
onAuthStateChanged(auth, user => {
  authSection.classList.toggle("d-none", !!user);
  appSection.classList.toggle("d-none", !user);
  userInfo.classList.toggle("d-none", !user);

  if (user) {
    document.getElementById("userEmail").textContent = user.email;
    clearAuthForm();
  }
});

// Login 
authForm.addEventListener("submit", async e => {
  e.preventDefault();
  const cred = getCredentials();
  if (!cred) return;

  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, ...cred);
    showAlert("Logged in successfully.");
  } catch (err) {
    showAlert("Login failed: " + authMessage(err), "danger");
  } finally {
    setLoading(false);
  }
});

// Sign up 
signupBtn.addEventListener("click", async () => {
  const cred = getCredentials();
  if (!cred) return;

  setLoading(true);
  try {
    await createUserWithEmailAndPassword(auth, ...cred);
    showAlert("Account created. You are now logged in.");
  } catch (err) {
    showAlert("Sign up failed: " + authMessage(err), "danger");
  } finally {
    setLoading(false);
  }
});

// Forgot password
resetBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email || !emailInput.checkValidity()) {
    emailInput.classList.add("is-invalid");
    showAlert("Enter your email above first, then click Forgot password.", "warning");
    return;
  }
  emailInput.classList.remove("is-invalid");

  setLoading(true);
  try {
    await sendPasswordResetEmail(auth, email);
    showAlert("If an account exists for this email, a reset link has been sent.", "info");
  } catch (err) {
    showAlert("Could not send reset email: " + authMessage(err), "danger");
  } finally {
    setLoading(false);
  }
});

//logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    clearAuthForm();
    showAlert("You have been logged out.", "info");
  } catch (err) {
    showAlert("Logout failed: " + authMessage(err), "danger");
  }
});