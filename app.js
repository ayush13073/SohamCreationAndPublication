// 1. Import SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, writeBatch, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// 2. YOUR CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyA4vJNC8QZsVVwM4Rcr2h7HcYDq--Oj1MY",
    authDomain: "sohamcreationandpublication.firebaseapp.com",
    projectId: "sohamcreationandpublication",
    storageBucket: "sohamcreationandpublication.firebasestorage.app",
    messagingSenderId: "173644617844",
    appId: "1:173644617844:web:3e1cc7d29388530d791921",
    measurementId: "G-5X30PL126R"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Global variable to store books so we can search them without reloading
let inventoryCache = [];

// --- 📚 COMPLETE BOOK DATA ---
const pdfBooksData = [
    { title: "Soliv Sukh", price: 250, category: "Spiritual" },
    { title: "Marathi Santancha Hindi Bhaktirachana", price: 300, category: "Spiritual" },
    { title: "Samarth Krupechi Vachane", price: 150, category: "Spiritual" },
    { title: "Samarth... Ek Patrakar", price: 125, category: "Biography" },
    { title: "Samarth Ramdasanchi Vyavasthapan Drushti", price: 150, category: "Management" },
    { title: "Savitri Darshan", price: 100, category: "Poetry" },
    { title: "Nitya Nava Dis Jagruticha", price: 365, category: "Spiritual" },
    { title: "Ramayan (Marathi)", price: 150, category: "Religious" },
    { title: "Maharishi Valmiki (Marathi)", price: 80, category: "Biography" },
    { title: "Shriramkrishna", price: 300, category: "Biography" },
    { title: "Vishwache Aart", price: 200, category: "Biography" },
    { title: "Shri Dnyaneshwaritil Pratima Srushti", price: 200, category: "Science" },
    { title: "Bhaskarayana", price: 350, category: "Novel" },
    { title: "Ojaswi", price: 200, category: "Novel" },
    { title: "Kalyatri", price: 250, category: "Novel" },
    { title: "Naivedya", price: 150, category: "Stories" },
    { title: "Bindhast", price: 350, category: "Stories" },
    { title: "Shikhandi", price: 200, category: "Novel" },
    { title: "Baykochi Ekasathi", price: 250, category: "Humor" },
    { title: "Vidnyan Balkatha", price: 75, category: "Children" },
    { title: "Guni Mule", price: 75, category: "Children" },
    { title: "Lal Dinank", price: 150, category: "Children" },
    { title: "Promise Pariche", price: 100, category: "Children" },
    { title: "Road to Holland", price: 300, category: "Travel" },
    { title: "Pakshigatha", price: 150, category: "Nature" },
    { title: "Nisargachi Navalai (Part 1)", price: 300, category: "Nature" },
    { title: "Dhagdhagatya Samidha", price: 250, category: "History" },
    { title: "Ase Ghadle Shastra", price: 200, category: "Science" },
    { title: "Ranjak Vidnyan", price: 150, category: "Science" },
    { title: "Subhashit Parimal", price: 100, category: "Literature" },
    { title: "Urle Urat Kahi", price: 200, category: "Stories" },
    { title: "Anandanidhan", price: 200, category: "Articles" },
    { title: "Chandane Shabdafulanche", price: 200, category: "Articles" },
    { title: "Dharmanishtha Savarkar", price: 150, category: "Biography" },
    { title: "1965 Cha Vijay", price: 200, category: "Defense" },
    { title: "Guptaheranche Vishwa", price: 200, category: "Mystery" },
    { title: "Mahabharatatil Aparichit Goshti", price: 200, category: "Mythology" },
    { title: "Kavyanubhuti", price: 250, category: "Poetry" },
    { title: "Anandayatri Rabindranath", price: 300, category: "Biography" },
    { title: "Value Seventeen CR", price: 400, category: "Mystery" },
    { title: "Aarti", price: 100, category: "Religious" },
    { title: "Chingi Ani Jaduche Phulpakhru", price: 100, category: "Children" },
    { title: "Daityasutra", price: 350, category: "Horror" },
    { title: "Lavani", price: 200, category: "Art" },
    { title: "The Firsts", price: 125, category: "Novel" },
    { title: "Shrimant Yogi Chhatrapati Shivaji Maharaj", price: 300, category: "History" },
    { title: "Rutuparn (Diwali Issue)", price: 250, category: "Magazine" } 
];

// --- ⚙️ LOGIC & FUNCTIONS ---

// 1. Upload Books (Bulk Seed)
window.uploadAllBooks = async () => {
    const btn = document.querySelector('.btn-warning');
    btn.innerText = "Uploading... please wait";
    btn.disabled = true;

    try {
        const batch = writeBatch(db);
        const booksRef = collection(db, "books");

        pdfBooksData.forEach(book => {
            const newRef = doc(booksRef); 
            batch.set(newRef, book);
        });

        await batch.commit();
        alert("Success! Database populated.");
        location.reload(); 
    } catch (error) {
        console.error("Error uploading: ", error);
        alert("Error: " + error.message);
        btn.disabled = false;
    }
}

// 2. Load Books into Global Cache & Dropdown
async function initInventory() {
    const select = document.getElementById("bookSelect");
    const snapshot = await getDocs(collection(db, "books"));

    if (snapshot.empty) {
        document.getElementById("setupArea").style.display = "block";
        select.innerHTML = "<option>No books found</option>";
        return;
    }

    // Save to global cache
    inventoryCache = [];
    snapshot.forEach(doc => {
        inventoryCache.push({
            id: doc.id,
            ...doc.data()
        });
    });

    // Initial render of all books
    renderDropdown(inventoryCache);
}

// 3. Render Dropdown (Used by Search)
function renderDropdown(books) {
    const select = document.getElementById("bookSelect");
    
    if (books.length === 0) {
        select.innerHTML = '<option value="">No matches found</option>';
        return;
    }

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

// 4. SEARCH FUNCTIONALITY (The new part)
document.getElementById("searchInput").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Filter the global cache
    const filteredBooks = inventoryCache.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.category.toLowerCase().includes(searchTerm)
    );

    renderDropdown(filteredBooks);
});

// 5. Update UI when book is selected
document.getElementById("bookSelect").addEventListener("change", (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    
    if (opt.value) {
        const price = opt.dataset.price;
        const cat = opt.dataset.category;
        const title = opt.innerText;

        document.getElementById("bookTitle").innerText = title;
        document.getElementById("bookPrice").innerText = "₹" + price;
        document.getElementById("bookCategory").innerText = cat;
        
        updateTotal();
        document.getElementById("previewImg").src = `https://placehold.co/100x150?text=${title.substring(0,3)}`;
    }
});

// 6. Calculate Total
const qtyInput = document.getElementById("qtyInput");
qtyInput.addEventListener("input", updateTotal);

function updateTotal() {
    const select = document.getElementById("bookSelect");
    const opt = select.options[select.selectedIndex];
    if(opt.value) {
        const total = parseInt(opt.dataset.price) * parseInt(qtyInput.value);
        document.getElementById("totalDisplay").value = "₹" + total;
    }
}

// 7. Record Sale
window.recordSale = async () => {
    const select = document.getElementById("bookSelect");
    const opt = select.options[select.selectedIndex];
    const qty = parseInt(qtyInput.value);

    if (!opt.value) { alert("Please select a book first"); return; }

    const statusMsg = document.getElementById("statusMessage");
    statusMsg.innerText = "Saving to database...";

    try {
        const saleData = {
            bookId: opt.value,
            bookTitle: opt.innerText,
            category: opt.dataset.category,
            price: parseInt(opt.dataset.price),
            quantity: qty,
            totalAmount: parseInt(opt.dataset.price) * qty,
            timestamp: new Date() 
        };

        await addDoc(collection(db, "sales"), saleData);
        
        statusMsg.innerText = "Sale recorded successfully! ✅";
        addRecentSaleToList(saleData);
        
        qtyInput.value = 1;
        updateTotal();
        document.getElementById("searchInput").value = ""; // Clear search on success

    } catch (e) {
        console.error("Error: ", e);
        alert("Error recording sale: " + e.message);
    }
}

function addRecentSaleToList(sale) {
    const list = document.getElementById("recentSalesList");
    const li = document.createElement("li");
    li.innerHTML = `
        <span>${sale.bookTitle} (x${sale.quantity})</span>
        <span class="amount">₹${sale.totalAmount}</span>
    `;
    list.prepend(li);
}

// Initialize
initInventory();
