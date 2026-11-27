import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref, push, onValue, update, remove
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { showAlert, escapeHtml } from "./ui.js";
import "./auth.js";

const form = document.getElementById("volunteerForm");
const tbody = document.getElementById("volunteerTableBody");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const volunteerIdInput = document.getElementById("volunteerId");
const volunteersRef = ref(db, "volunteers");

let unsubscribe = null;
let volunteersCache = {};    
let pendingDeleteId = null;    

const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));

//read
onAuthStateChanged(auth, user => {
  if (user) {
    unsubscribe = onValue(
      volunteersRef,
      snapshot => renderTable(snapshot),
      error => showAlert("Failed to load volunteers: " + error.message, "danger")
    );
  } else if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    volunteersCache = {};
    tbody.innerHTML = "";
    resetForm();
  }
});

function renderTable(snapshot) {
  volunteersCache = snapshot.exists() ? snapshot.val() : {};

  if (!snapshot.exists()) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No volunteers yet.</td></tr>`;
    return;
  }
  let rows = "";
  snapshot.forEach(child => {
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
//Validation
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_REGEX = /^[0-9+\s-]{8,15}$/;

function validateVolunteer(data, editingId) {
  if (data.fullName.length < 2) return "Full name must be at least 2 characters.";
  if (!EMAIL_REGEX.test(data.email)) return "Please enter a valid email address (e.g. name@example.com).";
  if (!PHONE_REGEX.test(data.phone)) return "Phone number must be 8-15 digits (digits, +, spaces and - allowed).";

  // Prevent duplicate emails (ignore the record being edited)
  const duplicate = Object.entries(volunteersCache).some(
    ([id, v]) => id !== editingId && v.email.toLowerCase() === data.email.toLowerCase()
  );
  if (duplicate) return "A volunteer with this email is already registered.";

  return null;
}
//create and update
form.addEventListener("submit", async e => {
  e.preventDefault();
  form.classList.add("was-validated");
  if (!form.checkValidity()) {
    showAlert("Please fix the errors in the form.", "danger");
    return;
  }

  const data = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    availability: document.getElementById("availability").value,
    role: document.getElementById("role").value,
    status: document.getElementById("status").value
  };

  const editingId = volunteerIdInput.value;
    const validationError = validateVolunteer(data, editingId);
  if (validationError) {
    showAlert(validationError, "danger");
    return;
  }

  try {
    if (editingId) {
      //update
      await update(ref(db, `volunteers/${editingId}`), { ...data, updatedAt: Date.now() });
      showAlert("Volunteer updated successfully.");
    } else {
      //create
      await push(volunteersRef, { ...data, createdAt: Date.now() });
      showAlert("Volunteer registered successfully.");
    }
    resetForm();
  } catch (err) {
    showAlert("Failed to save volunteer: " + err.message, "danger");
  }
});


tbody.addEventListener("click", e => {
  const editBtn = e.target.closest(".edit-btn");
  const deleteBtn = e.target.closest(".delete-btn");

  if (editBtn) startEdit(editBtn.dataset.id);
  if (deleteBtn) askDelete(deleteBtn.dataset.id);
});

function startEdit(id) {
  const v = volunteersCache[id];
  if (!v) return;

  volunteerIdInput.value = id;
  document.getElementById("fullName").value = v.fullName;
  document.getElementById("email").value = v.email;
  document.getElementById("phone").value = v.phone;
  document.getElementById("availability").value = v.availability;
  document.getElementById("role").value = v.role;
  document.getElementById("status").value = v.status;

  formTitle.textContent = "Edit Volunteer";
  submitBtn.textContent = "Update";
  cancelBtn.classList.remove("d-none");
  form.scrollIntoView({ behavior: "smooth" });
}

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  form.classList.remove("was-validated");
  volunteerIdInput.value = "";
  formTitle.textContent = "Register Volunteer";
  submitBtn.textContent = "Register";
  cancelBtn.classList.add("d-none");
}

//Delete
function askDelete(id) {
  const v = volunteersCache[id];
  if (!v) return;
  pendingDeleteId = id;
  document.getElementById("deleteName").textContent = v.fullName;
  deleteModal.show();
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  try {
    await remove(ref(db, `volunteers/${pendingDeleteId}`));
    showAlert("Volunteer deleted successfully.");
    if (volunteerIdInput.value === pendingDeleteId) resetForm();
  } catch (err) {
    showAlert("Failed to delete volunteer: " + err.message, "danger");
  } finally {
    pendingDeleteId = null;
    deleteModal.hide();
  }
});