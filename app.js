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
// 2. BOOK INVENTORY DATA (All 75 Books)
// ==========================================
const pdfBooksData = [
    // --- अध्यात्मिक (Spiritual) ---
    { title: "Soliv Sukh (सोलीव सुख)", price: 250, category: "Spiritual" },
    { title: "Atmaram-Amrutanubhav (आत्माराम-अमृतानुभव)", price: 150, category: "Spiritual" },
    { title: "Samarth Ek Patrakar (समर्थ एक पत्रकार)", price: 125, category: "Biography" },
    { title: "Samarth Ramdasanchi Vyavasthapan Drushti (समर्थ रामदासांची व्यवस्थापन दृष्टी)", price: 150, category: "Management" },
    { title: "Vishwache Aart (विश्वाचे आर्त)", price: 200, category: "Biography" },
    { title: "Shriramkrishna (श्रीरामकृष्ण)", price: 300, category: "Biography" },
    { title: "Majha Atmavikas Majhya Hati (माझा आत्मविकास माझ्या हाती)", price: 250, category: "Self-Help" },
    { title: "Ramayan: Mahatva Ani Vyakti Vishesh - Marathi (रामायण)", price: 150, category: "Religious" },
    { title: "Ramayan: Mahatva Ani Vyakti Vishesh - Hindi", price: 200, category: "Religious" },
    { title: "Ramayan: Mahatva Ani Vyakti Vishesh - English", price: 200, category: "Religious" },
    { title: "Savitri Darshan (सावित्री दर्शन)", price: 100, category: "Poetry" },
    { title: "Maharishi Valmiki - Marathi (महर्षी वाल्मिकी)", price: 80, category: "Biography" },
    { title: "Maharishi Valmiki - Hindi", price: 100, category: "Biography" },
    { title: "Maharishi Valmiki - English", price: 100, category: "Biography" },
    { title: "Samarth Krupechi Vachane (समर्थ कृपेचि वचने)", price: 150, category: "Spiritual" },
    { title: "Saptachakravedh (सप्तचक्रवेध)", price: 100, category: "Spiritual" },
    { title: "Acharya Panchapradeep (आचार्य पंचप्रदीप)", price: 200, category: "Religious" },

    // --- कादंबरी (Novel) ---
    { title: "Bhaskarayana (भास्करायण)", price: 350, category: "Novel" },
    { title: "Ojaswi (ओजस्वी)", price: 200, category: "Novel" },
    { title: "Kalyatri (कालयात्री)", price: 250, category: "Novel" },
    { title: "Trima Kasi - Marathi (त्रिमा कासी)", price: 350, category: "Novel" },
    { title: "Trima Kasi - English", price: 350, category: "Novel" },
    { title: "Shikhandi (शिखंडी)", price: 200, category: "Novel" },
    { title: "Garbhit Hunkar (गर्भित हुंकार)", price: 500, category: "Novel" },
    { title: "Daityasutra (दैत्यसूत्र)", price: 350, category: "Horror" },
    { title: "Baykochi Ekasathi Navryachi Shashti (बायकोची एकसष्टी...)", price: 250, category: "Humor" },

    // --- कथासंग्रह (Stories) ---
    { title: "Naivedya (नैवेद्य)", price: 150, category: "Stories" },
    { title: "Bindhast (बिनधास्त)", price: 300, category: "Stories" },
    { title: "Urle Urat Kahi (उरले उरात काही)", price: 200, category: "Stories" },

    // --- ललित लेख (Articles) ---
    { title: "Ajunahi Chandrat Aahe (अजूनही चांदरात आहे)", price: 200, category: "Articles" },
    { title: "Chandane Shabdafulanche (चांदणे शब्दफुलांचे)", price: 200, category: "Articles" },
    { title: "Anandanidhan (आनंदनिधान)", price: 200, category: "Articles" },

    // --- प्रवासवर्णन (Travelogue) ---
    { title: "Road to Holland - Marathi (रोड टू हॉलंड)", price: 300, category: "Travel" },
    { title: "Road to Holland - English", price: 300, category: "Travel" },
    { title: "Road to Holland Particha Pravas (परतीचा प्रवास)", price: 300, category: "Travel" },
    { title: "Road to Dusseldorf (रोड टू ड्युसेलडॉर्फ)", price: 350, category: "Travel" },

    // --- बालकाथासंग्रह (Children's Stories) ---
    { title: "Lal Dinank (लाल दिनांक)", price: 150, category: "Children" },
    { title: "Guni Mule (गुणी मुले)", price: 75, category: "Children" },
    { title: "Vidnyan Balkatha (विज्ञान बालकथा)", price: 75, category: "Children" },
    { title: "Shastradnyanchya Katha (शास्त्रज्ञांच्या कथा)", price: 80, category: "Children" },
    { title: "Tenali Ram Ani Birbalachya Goshti", price: 80, category: "Children" },
    { title: "Mantryanni Ghetli Shala (मंत्र्यांनी घेतली शाळा)", price: 80, category: "Children" },
    { title: "Raja Maharajanchya Goshti", price: 80, category: "Children" },
    { title: "Promise Pariche (प्रॉमिस परीचे)", price: 100, category: "Children" },
    { title: "Chingi Ani Jaduche Phulpakhru", price: 100, category: "Children" },
    { title: "English Balkatha Sangrah", price: 80, category: "Children" },

    // --- कुमारसांठी पुस्तके (Young Adult) ---
    { title: "Pakshigatha (पक्षिगाथा)", price: 150, category: "Nature" },
    { title: "Dhagdhagatya Samidha (धगधगत्या समिधा)", price: 250, category: "History" },
    { title: "Nisargachi Navalai Part 1 (निसर्गाची नवलाई १)", price: 300, category: "Nature" },
    { title: "Nisargachi Navalai Part 2 (निसर्गाची नवलाई २)", price: 250, category: "Nature" },
    { title: "Subhashit Saurabh (सुभाषित सौरभ)", price: 150, category: "Literature" },
    { title: "Subhashit Parimal (सुभाषित परिमल)", price: 150, category: "Literature" },
    { title: "Ranjak Vidnyan (रंजक विज्ञान)", price: 150, category: "Science" },
    { title: "Ase Ghadle Shastra (असे घडले शास्त्रज्ञ)", price: 200, category: "Science" },
    { title: "The Students Syndrome", price: 125, category: "Edu" },

    // --- काव्यविषयक (Poetry) ---
    { title: "Marathi Santanchya Hindi Bhaktirachana", price: 300, category: "Poetry" },
    { title: "Abhijat Kavyachi Olakh (अभिजात काव्याची ओळख)", price: 200, category: "Poetry" },
    { title: "Kavyanubhuti (काव्यानुभूती)", price: 250, category: "Poetry" },
    { title: "Lavani (लावणी)", price: 200, category: "Art" },

    // --- इतर (Other) ---
    { title: "1965 Cha Vijay (१९६५ चा विजय)", price: 100, category: "Defense" },
    { title: "Dharmanishtha Savarkar (धर्मनिष्ठ सावरकर)", price: 150, category: "Biography" },
    { title: "Savarkar Samjun Ghetana (सावरकर समजून घेताना)", price: 200, category: "Biography" },
    { title: "Shri Dnyaneshwaritil Pratima Srushti", price: 200, category: "Spirituality" },
    { title: "Mahabharatatil Aparichit Goshti", price: 200, category: "Mythology" },
    { title: "Guptaheranche Vishwa (गुप्तहेरांचे विश्व)", price: 200, category: "Mystery" },
    { title: "Anandayatri Rabindranath (आनंदयात्री रवींद्रनाथ)", price: 300, category: "Biography" },
    { title: "Pustakatil Manasa (पुस्तकातील माणसं)", price: 200, category: "Literature" },
    { title: "Aarti - Shabdarth, Bhavarth (आरती)", price: 100, category: "Religious" },

    // --- ऋतुपर्ण विशेषांक (Magazines) ---
    { title: "Shriram Visheshank (श्रीराम विशेषांक)", price: 200, category: "Magazine" },
    { title: "Sant Vangmay Visheshank (संत वाङ्मय)", price: 250, category: "Magazine" },
    { title: "Paryatan Ani Paryavaran Visheshank", price: 250, category: "Magazine" },
    { title: "Swarsaj Visheshank (स्वरसाज)", price: 350, category: "Magazine" },
    { title: "Chhatrapati Shivaji Maharaj Visheshank", price: 300, category: "Magazine" },
    { title: "Hasyanand Visheshank (हास्यानंद)", price: 250, category: "Magazine" },
    { title: "Katha Visheshank (कथा विशेषांक)", price: 250, category: "Magazine" }
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
        alert("Success! All 75 books uploaded to database.");
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
                // We show price here so YOU know what to charge, 
                // but it won't be saved in the public visual log.
                document.getElementById("bookPrice").innerText = "₹" + price;
                document.getElementById("bookCategory").innerText = cat;
                document.getElementById("previewImg").src = `https://placehold.co/100x150?text=${title.substring(0,3)}`;
                
                updateTotal();
            }
        });
    }

    // E. Total Calculation (For your reference only)
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
            // We still save the price to the database for YOUR records,
            // but we won't display it in the app's list.
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

    // MODIFIED: Removes the money part from the visible list
    function addRecentSaleToList(sale) {
        const list = document.getElementById("recentSalesList");
        const li = document.createElement("li");
        // Shows only Title and Quantity
        li.innerHTML = `
            <span>${sale.bookTitle}</span>
            <span class="amount" style="color:#64748b;">x${sale.quantity}</span> 
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
        
        // MODIFIED: Hide the Revenue Box
        // This ensures the "Total Revenue" box on the analytics page is invisible
        const revElement = document.getElementById("totalRevenue");
        if(revElement) {
            // Find the parent container (stat-box) and hide it
            revElement.parentElement.style.display = "none"; 
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
