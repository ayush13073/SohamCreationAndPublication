import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit, startAfter, deleteDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let lastDoc = null;
let hasMore = true;
let isLoading = false;

export async function loadRecords() {
    const container = document.getElementById('records-list');
    if (!container) return;
    container.innerHTML = '<tr><td colspan="8" class="text-center py-4">Loading...</td></tr>';
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');

    lastDoc = null;
    hasMore = true;
    isLoading = false;

    try {
        const q = query(collection(db, "sales"), orderBy("timestamp", "desc"), limit(20));
        const snap = await getDocs(q);
        const entries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (entries.length === 0) {
            container.innerHTML = '<tr><td colspan="8" class="text-center py-4">No sales yet.</td></tr>';
            hasMore = false;
            return;
        }
        lastDoc = snap.docs[snap.docs.length - 1];
        hasMore = snap.docs.length === 20;
        renderEntries(entries);
        if (hasMore) loadMoreBtn.classList.remove('hidden');
        else loadMoreBtn.classList.add('hidden');
    } catch (err) {
        console.error(err);
        container.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
    }
}

async function loadMore() {
    if (isLoading || !hasMore || !lastDoc) return;
    isLoading = true;
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.disabled = true;

    try {
        const q = query(collection(db, "sales"), orderBy("timestamp", "desc"), startAfter(lastDoc), limit(20));
        const snap = await getDocs(q);
        const entries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (entries.length === 0) {
            hasMore = false;
            if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
            return;
        }
        lastDoc = snap.docs[snap.docs.length - 1];
        hasMore = snap.docs.length === 20;
        renderEntries(entries, true);
        if (hasMore) loadMoreBtn.classList.remove('hidden');
        else loadMoreBtn.classList.add('hidden');
    } catch (err) {
        console.error(err);
        alert("Error loading more records.");
    } finally {
        isLoading = false;
        if (loadMoreBtn) loadMoreBtn.disabled = false;
    }
}

function renderEntries(entries, append = false) {
    const container = document.getElementById('records-list');
    let html = '';
    entries.forEach(entry => {
        const subtotal = entry.pricePerUnit * entry.quantity;
        const date = entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString() : 'Unknown';
        html += `
            <tr class="border-b hover:bg-gray-50">
                <td class="py-2 px-2">${escapeHtml(entry.bookTitle)}</td>
                <td class="py-2 px-2 text-center">${entry.quantity}</td>
                <td class="py-2 px-2 text-right">₹${entry.pricePerUnit.toFixed(2)}</td>
                <td class="py-2 px-2 text-right">₹${subtotal.toFixed(2)}</td>
                <td class="py-2 px-2 text-right">₹${(entry.discountAmount || 0).toFixed(2)}</td>
                <td class="py-2 px-2 text-right font-semibold">₹${entry.finalAmount.toFixed(2)}</td>
                <td class="py-2 px-2">${date}</td>
                <td class="py-2 px-2 text-center">
                    <button class="delete-btn text-red-600 hover:text-red-800" data-id="${entry.id}">Delete</button>
                </td>
            </tr>
        `;
    });
    if (append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }
    // Attach delete handlers
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.removeEventListener('click', handleDelete);
        btn.addEventListener('click', handleDelete);
    });
}

async function handleDelete(e) {
    const id = e.currentTarget.getAttribute('data-id');
    if (confirm('Delete this record?')) {
        try {
            await deleteDoc(doc(db, "sales", id));
            alert("Deleted.");
            loadRecords(); // refresh
        } catch (err) {
            console.error(err);
            alert("Error deleting.");
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Attach load more button event after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMore);
});