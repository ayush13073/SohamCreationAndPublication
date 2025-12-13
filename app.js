import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, writeBatch, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyA4vJNC8QZsVVwM4Rcr2h7HcYDq--Oj1MY",
    authDomain: "sohamcreationandpublication.firebaseapp.com",
    projectId: "sohamcreationandpublication",
    storageBucket: "sohamcreationandpublication.firebasestorage.app",
    messagingSenderId: "173644617844",
    appId: "1:173644617844:web:3e1cc7d29388530d791921",
    measurementId: "G-5X30PL126R"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

let inventoryCache = [];

// --- 📚 BOOK DATA (Shortened for brevity, full list is in your previous code) ---
// Note: Ensure your full pdfBooksData array is here as before.
const pdfBooksData = [
    { title: "Soliv Sukh", price: 250, category: "Spiritual" },
    { title: "Marathi Santancha Hindi Bhaktirachana", price: 300, category: "Spiritual" },
    { title: "Samarth Krupechi Vachane", price: 150, category: "Spiritual" },
    { title: "Bhaskarayana", price: 350, category: "Novel" },
    { title: "Road to Holland", price: 300, category: "Travel" },
    { title: "Pakshigatha", price: 150, category: "Nature" },
    { title: "1965 Cha Vijay", price: 200, category: "Defense" },
    { title: "Rutuparn (Diwali Issue)", price: 250, category: "Magazine" }
    // ... (Keep the rest of your list here)
];

// --- 🌐 SHARED FUNCTIONS (Work on both pages) ---

// 1. Upload Books
window.uploadAllBooks = async () => {
    const btn = document.querySelector('.btn-warning');
    if(btn) { btn.innerText = "Uploading..."; btn.disabled = true; }
    try {
        const batch = writeBatch(db);
        pdfBooksData.forEach(book => {
            batch.set(doc(collection(db, "books")), book);
        });
        await batch.commit();
        alert("Inventory Uploaded!");
        location.reload();
    } catch (e) { alert("Error: " + e.message); }
}

// --- 🏠 HOME PAGE LOGIC (Only runs on index.html) ---
if (!document.getElementById("analyticsPage")) {
    
    // Initialize Inventory
    async function initInventory() {
        const select = document.getElementById("bookSelect");
        if(!select) return; // Safety check

        const snapshot = await getDocs(collection(db, "books"));
        if (snapshot.empty) {
            document.getElementById("setupArea").style.display = "block";
            return;
        }

        inventoryCache = [];
        snapshot.forEach(doc => inventoryCache.push({ id: doc.id, ...doc.data() }));
        renderDropdown(inventoryCache);
    }

    function renderDropdown(books) {
        const select = document.getElementById("bookSelect");
        select.innerHTML = '<option value="">-- Select Book --</option>';
        books.forEach(book => {
            const opt = document.createElement("option");
            opt.value = book.id;
            opt.innerText = book.title;
            opt.dataset.price = book.price;
            opt.dataset.category = book.category;
            select.appendChild(opt);
        });
    }

    // Search Logic
    const searchInput = document.getElementById("searchInput");
    if(searchInput){
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = inventoryCache.filter(b => 
                b.title.toLowerCase().includes(term) || b.category.toLowerCase().includes(term)
            );
            renderDropdown(filtered);
        });
    }

    // Selection Logic
    const bookSelect = document.getElementById("bookSelect");
    if(bookSelect) {
        bookSelect.addEventListener("change", (e) => {
            const opt = e.target.options[e.target.selectedIndex];
            if (opt.value) {
                document.getElementById("bookTitle").innerText = opt.innerText;
                document.getElementById("bookPrice").innerText = "₹" + opt.dataset.price;
                document.getElementById("bookCategory").innerText = opt.dataset.category;
                document.getElementById("previewImg").src = `https://placehold.co/100x150?text=${opt.innerText.substring(0,3)}`;
                updateTotal();
            }
        });
    }

    // Calculation Logic
    const qtyInput = document.getElementById("qtyInput");
    if(qtyInput) qtyInput.addEventListener("input", updateTotal);

    function updateTotal() {
        const select = document.getElementById("bookSelect");
        const opt = select.options[select.selectedIndex];
        const val = document.getElementById("qtyInput").value;
        if(opt.value) {
            document.getElementById("totalDisplay").value = "₹" + (parseInt(opt.dataset.price) * parseInt(val));
        }
    }

    // Record Sale Logic
    window.recordSale = async () => {
        const select = document.getElementById("bookSelect");
        const opt = select.options[select.selectedIndex];
        const qty = parseInt(document.getElementById("qtyInput").value);

        if (!opt.value) { alert("Select a book"); return; }

        try {
            await addDoc(collection(db, "sales"), {
                bookId: opt.value,
                bookTitle: opt.innerText,
                category: opt.dataset.category,
                price: parseInt(opt.dataset.price),
                quantity: qty,
                totalAmount: parseInt(opt.dataset.price) * qty,
                timestamp: new Date()
            });
            alert("Sale Saved!");
            location.reload(); 
        } catch (e) { alert(e.message); }
    }

    // Run Home Init
    initInventory();
}

// --- 📊 ANALYTICS PAGE LOGIC (Only runs on analytics.html) ---
if (document.getElementById("analyticsPage")) {
    
    async function loadAnalytics() {
        const snapshot = await getDocs(collection(db, "sales"));
        
        let bookCounts = {};
        let genreCounts = {};
        let totalSold = 0;
        let revenue = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const qty = data.quantity || 1;
            
            // 1. Count Books
            bookCounts[data.bookTitle] = (bookCounts[data.bookTitle] || 0) + qty;
            
            // 2. Count Genres
            genreCounts[data.category] = (genreCounts[data.category] || 0) + qty;
            
            // 3. Totals
            totalSold += qty;
            revenue += (data.totalAmount || 0);
        });

        // Update Text Stats
        document.getElementById("totalBooksSold").innerText = totalSold;
        document.getElementById("totalRevenue").innerText = "₹" + revenue;

        // Prepare Chart Data: Top 5 Books
        const sortedBooks = Object.entries(bookCounts)
            .sort((a, b) => b[1] - a[1]) // Sort highest to lowest
            .slice(0, 5); // Take top 5

        // Render Top Items Chart
        new Chart(document.getElementById("topItemsChart"), {
            type: 'bar',
            data: {
                labels: sortedBooks.map(item => item[0]), // Book Titles
                datasets: [{
                    label: 'Units Sold',
                    data: sortedBooks.map(item => item[1]), // Quantities
                    backgroundColor: '#3b82f6',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Render Genre Chart
        new Chart(document.getElementById("genreChart"), {
            type: 'doughnut',
            data: {
                labels: Object.keys(genreCounts),
                datasets: [{
                    data: Object.values(genreCounts),
                    backgroundColor: [
                        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'
                    ]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Run Analytics Init
    loadAnalytics();
}
