import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { showAlert, escapeHtml } from "./ui.js";
import "./auth.js";

const form = document.getElementById("volunteerForm");
const tbody = document.getElementById("volunteerTableBody");
const volunteersRef = ref(db, "volunteers");
let unsubscribe = null;

// READ: updates automatically whenever data changes, no refresh needed
onAuthStateChanged(auth, (user) => {
  if (user) {
    unsubscribe = onValue(
      volunteersRef,
      (snapshot) => renderTable(snapshot),
      (error) =>
        showAlert("Failed to load volunteers: " + error.message, "danger"),
    );
  } else if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    tbody.innerHTML = "";
  }
});

function renderTable(snapshot) {
  if (!snapshot.exists()) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No volunteers yet.</td></tr>`;
    return;
  }
  let rows = "";
  snapshot.forEach((child) => {
    const id = child.key;
    const v = child.val();
    const badge = v.status === "Active" ? "badge-active" : "badge-inactive";
    rows += `
      <tr>
        <td>${escapeHtml(v.fullName)}</td>
        <td>${escapeHtml(v.email)}</td>
        <td>${escapeHtml(v.phone)}</td>
        <td>${escapeHtml(v.availability)}</td>
        <td>${escapeHtml(v.role)}</td>
        <td><span class="badge ${badge}">${escapeHtml(v.status)}</span></td>
        <td>
          <button class="btn btn-sm btn-warning edit-btn" data-id="${id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${id}">Delete</button>
        </td>
      </tr>`;
  });
  tbody.innerHTML = rows;
}

// CREATE
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  form.classList.add("was-validated");
  if (!form.checkValidity()) {
    showAlert("Please fix the errors in the form.", "danger");
    return;
  }

  const volunteer = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    availability: document.getElementById("availability").value,
    role: document.getElementById("role").value,
    status: document.getElementById("status").value,
    createdAt: Date.now(),
  };

  try {
    await push(volunteersRef, volunteer); // push() generates a unique Volunteer ID
    showAlert("Volunteer registered successfully.");
    form.reset();
    form.classList.remove("was-validated");
  } catch (err) {
    showAlert("Failed to save volunteer: " + err.message, "danger");
  }
});
