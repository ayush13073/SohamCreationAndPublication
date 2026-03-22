import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

export function updateNavbar(user) {
  const authLinks = document.getElementById('auth-links');
  const guestLinks = document.getElementById('guest-links');
  const dataEntryNav = document.getElementById('data-entry-nav');
  const logoutBtn = document.getElementById('logout-btn');
  if (user) {
    if (authLinks) authLinks.classList.remove('hidden');
    if (guestLinks) guestLinks.classList.add('hidden');
    if (dataEntryNav) dataEntryNav.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  } else {
    if (authLinks) authLinks.classList.add('hidden');
    if (guestLinks) guestLinks.classList.remove('hidden');
    if (dataEntryNav) dataEntryNav.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
  }
}

export function initAuth() {
  onAuthStateChanged(auth, (user) => {
    updateNavbar(user);
    // Redirect if on protected page and not logged in
    if (window.location.pathname.includes('data-entry.html') && !user) {
      window.location.href = 'login.html';
    }
  });
}

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function register(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  await signOut(auth);
  window.location.href = 'index.html';
}