// ==========================================
// 1. FIREBASE CONFIGURATION & IMPORTS
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, writeBatch, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Your specific Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4vJNC8QZsVVwM4Rcr2h7HcYDq--Oj1MY",
    authDomain: "sohamcreationandpublication.firebaseapp.com",
    projectId: "sohamcreationandpublication",
    storageBucket: "sohamcreationandpublication.firebasestorage.app",
    messagingSenderId: "173644617844",
    appId: "1:173644617844:web:3e1cc7d29388530d791921",
    measurementId: "G-5X30PL126R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Global cache for search functionality
let inventoryCache = [];

// ==========================================
[span_0](start_span)// 2. BOOK INVENTORY DATA (From Uploaded Images)[span_0](end_span)
// ==========================================
const pdfBooksData = [
    // --- अध्यात्मिक (Spiritual) ---
    { title: "Soliv Sukh", price: 250, category: "Spiritual" },
    { title: "Atmaram-Amrutanubhav", price: 150, category: "Spiritual" },
    { title: "Samarth Ek Patrakar", price: 125, category: "Biography" },
    { title: "Samarth Ramdasanchi Vyavasthapan Drushti", price: 150, category: "Management" },
    { title: "Vishwache Aart", price: 200, category: "Biography" },
    { title: "Shriramkrishna", price: 300, category: "Biography" },
    { title: "Majha Atmavikas Majhya Hati", price: 250, category: "Self-Help" },
    { title: "Ramayan: Mahatva Ani Vyakti Vishesh (Marathi)", price: 150, category: "Religious" },
    { title: "Ramayan: Mahatva Ani Vyakti Vishesh (Hindi)", price: 200, category: "Religious" },
    { title: "Ramayan: Mahatva Ani Vyakti Vishesh (English)", price: 200, category: "Religious" },
    { title: "Savitri Darshan", price: 100, category: "Poetry" },
    { title: "Maharishi Valmiki (Marathi)", price: 80, category: "Biography" },
    { title: "Maharishi Valmiki (Hindi)", price: 100, category: "Biography" },
    { title: "Maharishi Valmiki (English)", price: 100, category: "Biography" },
    { title: "Samarth Krupechi Vachane", price: 150, category: "Spiritual" },
    { title: "Saptachakravedh", price: 100, category: "Spiritual" },
    { title: "Acharya Panchapradeep", price: 200, category: "Religious" },

    // --- कादंबरी (Novel) ---
    { title: "Bhaskarayana", price: 350, category: "Novel" },
    { title: "Ojaswi", price: 200, category: "Novel" },
    { title: "Kalyatri", price: 250, category: "Novel" },
    { title: "Trima Kasi (Marathi)", price: 350, category: "Novel" },
    { title: "Trima Kasi (English)", price: 350, category: "Novel" },
    { title: "Shikhandi", price: 200, category: "Novel" },
    { title: "Garbhit Hunkar", price: 500, category: "Novel" },
    { title: "Daityasutra", price: 350, category: "Horror/Novel" },
    { title: "Baykochi Ekasathi Navryachi Shashti", price: 250, category: "Humor" },

    // --- कथासंग्रह (Stories) ---
    { title: "Naivedya", price: 150, category: "Stories" },
    { title: "Bindhast", price: 300, category: "Stories" },
    { title: "Urle Urat Kahi", price: 200, category: "Stories" },

    // --- ललित लेख (Articles) ---
    { title: "Ajunahi Chandrat Aahe", price: 200, category: "Articles" },
    { title: "Chandane Shabdafulanche", price: 200, category: "Articles" },
    { title: "Anandanidhan", price: 200, category: "Articles" },

    // --- प्रवासवर्णन (Travelogue) ---
    { title: "Road to Holland (Marathi)", price: 300, category: "Travel" },
    { title: "Road to Holland (English)", price: 300, category: "Travel" },
    { title: "Road to Holland Particha Pravas", price: 300, category: "Travel" },
    { title: "Road to Dusseldorf", price: 350, category: "Travel" },

    // --- बालकाथासंग्रह (Children's Stories) ---
    { title: "Lal Dinank", price: 150, category: "Children" },
    { title: "Guni Mule", price: 75, category: "Children" },
    { title: "Vidnyan Balkatha", price: 75, category: "Children" },
    { title: "Shastradnyanchya Katha", price: 80, category: "Children" },
    { title: "Tenali Ram Ani Birbalachya Goshti", price: 80, category: "Children" },
    { title: "Mantryanni Ghetli Shala", price: 80, category: "Children" },
    { title: "Raja Maharajanchya Goshti", price: 80, category: "Children" },
    { title: "Promise Pariche", price: 100, category: "Children" },
    { title: "Chingi Ani Jaduche Phulpakhru", price: 100, category: "Children" },
    { title: "English Balkatha Sangrah", price: 80, category: "Children" },

    // --- कुमारसांठी पुस्तके (Young Adult) ---
    { title: "Pakshigatha", price: 150, category: "Nature" },
    { title: "Dhagdhagatya Samidha", price: 250, category: "History" },
    { title: "Nisargachi Navalai Part 1", price: 300, category: "Nature" },
    { title: "Nisargachi Navalai Part 2", price: 250, category: "Nature" },
    { title: "Subhashit Saurabh", price: 150, category: "Literature" },
    { title: "Subhashit Parimal", price: 150, category: "Literature" },
    { title: "Ranjak Vidnyan", price: 150, category: "Science" },
    { title: "Ase Ghadle Shastra", price: 200, category: "Science" },
    { title: "The Students Syndrome", price: 125, category: "Science/Edu" },

    // --- काव्यविषयक (Poetry) ---
    { title: "Marathi Santanchya Hindi Bhaktirachana", price: 300, category: "Poetry" },
    { title: "Abhijat Kavyachi Olakh", price: 200, category: "Poetry" },
    { title: "Kavyanubhuti", price: 250, category: "Poetry" },
    { title: "Lavani", price: 200, category: "Art/Poetry" },

    // --- इतर (Other) ---
    { title: "1965 Cha Vijay", price: 100, category: "Defense" },
    { title: "Dharmanishtha Savarkar", price: 150, category: "Biography" },
    { title: "Savarkar Samjun Ghetana", price: 200, category: "Biography" },
    { title: "Shri Dnyaneshwaritil Pratima Srushti Ani Vidnyan", price: 200, category: "Spirituality/Science" },
    { title: "Mahabharatatil Aparichit Goshti", price: 200, category: "Mythology" },
    { title: "Guptaheranche Vishwa", price: 200, category: "Mystery" },
    { title: "Anandayatri Rabindranath", price: 300, category: "Biography" },
    { title: "Pustakatil Manasa", price: 200, category: "Literature" },
    { title: "Aarti (Shabdarth, Bhavarth, Tatvarth)", price: 100, category: "Religious" },

    // --- ऋतुपर्ण विशेषांक (Specials) ---
    { title: "Shriram Visheshank", price: 200, category: "Magazine" },
    { title: "Sant Vangmay Visheshank", price: 250, category: "Magazine" },
    { title: "Paryatan Ani Paryavaran Visheshank", price: 250, category: "Magazine" },
    { title: "Swarsaj Visheshank", price: 350, category: "Magazine" },
    { title: "Chhatrapati Shivaji Maharaj Visheshank", price: 300, category: "Magazine" },
    { title: "Hasyanand Visheshank", price: 250, category: "Magazine" },
    { title: "Katha Visheshank", price: 250, category: "Magazine" }
];

// ==========================================
// 3. SHARED FUNCTIONS (Available Globally)
// ==========================================

// Function to bulk upload books (Seeding the Database)
window.uploadAllBooks = async () => {
    const btn = document.querySelector('.btn-warning');
    if (btn) {
        btn.innerText = "Uploading... please wait";
        btn.disabled = true;
    }

    try {
        const batch = writeBatch(db);
        const booksRef = collection(db, "books");

        pdfBooksData.forEach(book => {
            const newRef = doc(booksRef); // Create auto-ID document
            batch.set(newRef, book);
        });

        await batch.commit();
        alert("Success! All books uploaded to database.");
        location.reload(); 
    } catch (error) {
        console.error("Error uploading: ", error);
        alert("Error: " + error.message);
        if (btn) btn.disabled = false;
    }
}

// ==========================================
// 4. HOME PAGE LOGIC (index.html)
// ==========================================
if (!document.getElementById("analyticsPage")) {

    // A. Initialize Inventory & Cache
    async function initInventory() {
        const select = document.getElementById("bookSelect");
        if (!select) return;

        const snapshot = await getDocs(collection(db, "books"));
        
        if (snapshot.empty) {
            document.getElementById("setupArea").style.display = "block";
            select.innerHTML = "<option>No books found</option>";
            return;
        }

        // Store in global cache for searching
        inventoryCache = [];
        snapshot.forEach(doc => {
            inventoryCache.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Initial Render
        renderDropdown(inventoryCache);
    }

    // B. Render Dropdown Options
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
            // Store data in DOM for easy access
            opt.dataset.price = book.price;
            opt.dataset.category = book.category;
            select.appendChild(opt);
        });
    }

    // C. Search Listener
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = inventoryCache.filter(b => 
                b.title.toLowerCase().includes(term) || 
                b.category.toLowerCase().includes(term)
            );
            renderDropdown(filtered);
        });
    }

    // D. Selection Listener (Updates UI)
    const bookSelect = document.getElementById("bookSelect");
    if (bookSelect) {
        bookSelect.addEventListener("change", (e) => {
            const opt = e.target.options[e.target.selectedIndex];
            
            if (opt.value) {
                const price = opt.dataset.price;
                const cat = opt.dataset.category;
                const title = opt.innerText;

                document.getElementById("bookTitle").innerText = title;
                // Still showing price here so you know what to charge, 
                // but it won't show in the recorded list later.
                document.getElementById("bookPrice").innerText = "₹" + price;
                document.getElementById("bookCategory").innerText = cat;
                document.getElementById("previewImg").src = `https://placehold.co/100x150?text=${title.substring(0,3)}`;
                
                updateTotal();
            }
        });
    }

    // E. Total Calculation
    const qtyInput = document.getElementById("qtyInput");
    if (qtyInput) qtyInput.addEventListener("input", updateTotal);

    function updateTotal() {
        const select = document.getElementById("bookSelect");
        const opt = select.options[select.selectedIndex];
        const val = document.getElementById("qtyInput").value;
        if (opt.value) {
            const total = parseInt(opt.dataset.price) * parseInt(val);
            document.getElementById("totalDisplay").value = "₹" + total;
        }
    }

    // F. Record Sale Function
    window.recordSale = async () => {
        const select = document.getElementById("bookSelect");
        const opt = select.options[select.selectedIndex];
        const qty = parseInt(document.getElementById("qtyInput").value);

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
            
            // Reset form
            document.getElementById("qtyInput").value = 1;
            document.getElementById("searchInput").value = ""; 
            updateTotal();

        } catch (e) {
            console.error("Error: ", e);
            alert("Error recording sale: " + e.message);
        }
    }

    // MODIFIED: Removes the money part from the list item
    function addRecentSaleToList(sale) {
        const list = document.getElementById("recentSalesList");
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${sale.bookTitle} (x${sale.quantity})</span>
            <span class="amount" style="display:none;">HIDDEN</span> 
        `;
        list.prepend(li);
    }

    // Run Init
    initInventory();
}

// ==========================================
// 5. ANALYTICS PAGE LOGIC (analytics.html)
// ==========================================
if (document.getElementById("analyticsPage")) {
    
    async function loadAnalytics() {
        const snapshot = await getDocs(collection(db, "sales"));
        
        let bookCounts = {};
        let genreCounts = {};
        let totalSold = 0;
        
        // Removed revenue calculation variable logic here

        snapshot.forEach(doc => {
            const data = doc.data();
            const qty = data.quantity || 1;
            
            // 1. Count by Book Title
            bookCounts[data.bookTitle] = (bookCounts[data.bookTitle] || 0) + qty;
            
            // 2. Count by Genre
            genreCounts[data.category] = (genreCounts[data.category] || 0) + qty;
            
            // 3. Totals (Units only)
            totalSold += qty;
        });

        // Update Text Summary
        document.getElementById("totalBooksSold").innerText = totalSold;
        
        // MODIFIED: Hide the Revenue Box logic
        const revElement = document.getElementById("totalRevenue");
        if(revElement) {
            revElement.parentElement.style.display = "none"; // Completely hides the box
        }

        // Prepare Data for Top Items Chart (Top 5)
        const sortedBooks = Object.entries(bookCounts)
            .sort((a, b) => b[1] - a[1]) // Sort desc
            .slice(0, 5); // Take top 5

        // Render Chart 1: Top Items
        new Chart(document.getElementById("topItemsChart"), {
            type: 'bar',
            data: {
                labels: sortedBooks.map(item => item[0]), 
                datasets: [{
                    label: 'Units Sold',
                    data: sortedBooks.map(item => item[1]),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Render Chart 2: Genre Distribution
        new Chart(document.getElementById("genreChart"), {
            type: 'doughnut',
            data: {
                labels: Object.keys(genreCounts),
                datasets: [{
                    data: Object.values(genreCounts),
                    backgroundColor: [
                        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
                    ]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Run Analytics Init
    loadAnalytics();
}
