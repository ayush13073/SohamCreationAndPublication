import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore();

// Hardcoded book list (sorted alphabetically by name)
const booksData = [
    { id: "1965 Cha Vijay", name: "1965 Cha Vijay (१९६५ चा विजय)", price: 100, category: "Defense" },
    { id: "Aarti Shabdarth Bhavarth", name: "Aarti - Shabdarth, Bhavarth (आरती)", price: 100, category: "Religious" },
    { id: "Abhijat Kavyachi Olakh", name: "Abhijat Kavyachi Olakh (अभिजात काव्याची ओळख)", price: 200, category: "Poetry" },
    { id: "Acharya Panchapradeep", name: "Acharya Panchapradeep (आचार्य पंचप्रदीप)", price: 200, category: "Religious" },
    { id: "Ajunahi Chandrat Aahe", name: "Ajunahi Chandrat Aahe (अजूनही चांदरात आहे)", price: 200, category: "Articles" },
    { id: "Anandayatri Rabindranath", name: "Anandayatri Rabindranath (आनंदयात्री रवींद्रनाथ)", price: 300, category: "Biography" },
    { id: "Anandanidhan", name: "Anandanidhan (आनंदनिधान)", price: 200, category: "Articles" },
    { id: "Ase Ghadle Shastra", name: "Ase Ghadle Shastra (असे घडले शास्त्रज्ञ)", price: 200, category: "Science" },
    { id: "Atmaram-Amrutanubhav", name: "Atmaram-Amrutanubhav (आत्माराम-अमृतानुभव)", price: 150, category: "Spiritual" },
    { id: "Baykochi Ekasathi Navryachi Shashti", name: "Baykochi Ekasathi Navryachi Shashti (बायकोची एकसष्टी...)", price: 250, category: "Humor" },
    { id: "Bhaskarayana", name: "Bhaskarayana (भास्करायण)", price: 350, category: "Novel" },
    { id: "Bindhast", name: "Bindhast (बिनधास्त)", price: 300, category: "Stories" },
    { id: "Chandane Shabdafulanche", name: "Chandane Shabdafulanche (चांदणे शब्दफुलांचे)", price: 200, category: "Articles" },
    { id: "Chhatrapati Shivaji Maharaj Visheshank", name: "Chhatrapati Shivaji Maharaj Visheshank", price: 300, category: "Magazine" },
    { id: "Chingi Ani Jaduche Phulpakhru", name: "Chingi Ani Jaduche Phulpakhru", price: 100, category: "Children" },
    { id: "Daityasutra", name: "Daityasutra (दैत्यसूत्र)", price: 350, category: "Horror" },
    { id: "Dhagdhagatya Samidha", name: "Dhagdhagatya Samidha (धगधगत्या समिधा)", price: 250, category: "History" },
    { id: "Dharmanishtha Savarkar", name: "Dharmanishtha Savarkar (धर्मनिष्ठ सावरकर)", price: 150, category: "Biography" },
    { id: "English Balkatha Sangrah", name: "English Balkatha Sangrah", price: 80, category: "Children" },
    { id: "Garbhit Hunkar", name: "Garbhit Hunkar (गर्भित हुंकार)", price: 500, category: "Novel" },
    { id: "Guni Mule", name: "Guni Mule (गुणी मुले)", price: 75, category: "Children" },
    { id: "Guptaheranche Vishwa", name: "Guptaheranche Vishwa (गुप्तहेरांचे विश्व)", price: 200, category: "Mystery" },
    { id: "Hasyanand Visheshank", name: "Hasyanand Visheshank (हास्यानंद)", price: 250, category: "Magazine" },
    { id: "Kalyatri", name: "Kalyatri (कालयात्री)", price: 250, category: "Novel" },
    { id: "Katha Visheshank", name: "Katha Visheshank (कथा विशेषांक)", price: 250, category: "Magazine" },
    { id: "Kavyanubhuti", name: "Kavyanubhuti (काव्यानुभूती)", price: 250, category: "Poetry" },
    { id: "Lal Dinank", name: "Lal Dinank (लाल दिनांक)", price: 150, category: "Children" },
    { id: "Lavani", name: "Lavani (लावणी)", price: 200, category: "Art" },
    { id: "Mahabharatatil Aparichit Goshti", name: "Mahabharatatil Aparichit Goshti", price: 200, category: "Mythology" },
    { id: "Maharishi Valmiki English", name: "Maharishi Valmiki - English", price: 100, category: "Biography" },
    { id: "Maharishi Valmiki Hindi", name: "Maharishi Valmiki - Hindi", price: 100, category: "Biography" },
    { id: "Maharishi Valmiki Marathi", name: "Maharishi Valmiki - Marathi (महर्षी वाल्मिकी)", price: 80, category: "Biography" },
    { id: "Majha Atmavikas Majhya Hati", name: "Majha Atmavikas Majhya Hati (माझा आत्मविकास माझ्या हाती)", price: 250, category: "Self-Help" },
    { id: "Mantryanni Ghetli Shala", name: "Mantryanni Ghetli Shala (मंत्र्यांनी घेतली शाळा)", price: 80, category: "Children" },
    { id: "Marathi Santanchya Hindi Bhaktirachana", name: "Marathi Santanchya Hindi Bhaktirachana", price: 300, category: "Poetry" },
    { id: "Naivedya", name: "Naivedya (नैवेद्य)", price: 150, category: "Stories" },
    { id: "Nisargachi Navalai Part1", name: "Nisargachi Navalai Part 1 (निसर्गाची नवलाई १)", price: 300, category: "Nature" },
    { id: "Nisargachi Navalai Part2", name: "Nisargachi Navalai Part 2 (निसर्गाची नवलाई २)", price: 250, category: "Nature" },
    { id: "Ojaswi", name: "Ojaswi (ओजस्वी)", price: 200, category: "Novel" },
    { id: "Pakshigatha", name: "Pakshigatha (पक्षिगाथा)", price: 150, category: "Nature" },
    { id: "Paryatan Ani Paryavaran Visheshank", name: "Paryatan Ani Paryavaran Visheshank", price: 250, category: "Magazine" },
    { id: "Promise Pariche", name: "Promise Pariche (प्रॉमिस परीचे)", price: 100, category: "Children" },
    { id: "Pustakatil Manasa", name: "Pustakatil Manasa (पुस्तकातील माणसं)", price: 200, category: "Literature" },
    { id: "Raja Maharajanchya Goshti", name: "Raja Maharajanchya Goshti", price: 80, category: "Children" },
    { id: "Ramayan Mahatva Ani Vyakti Vishesh English", name: "Ramayan: Mahatva Ani Vyakti Vishesh - English", price: 200, category: "Religious" },
    { id: "Ramayan Mahatva Ani Vyakti Vishesh Hindi", name: "Ramayan: Mahatva Ani Vyakti Vishesh - Hindi", price: 200, category: "Religious" },
    { id: "Ramayan Mahatva Ani Vyakti Vishesh Marathi", name: "Ramayan: Mahatva Ani Vyakti Vishesh - Marathi (रामायण)", price: 150, category: "Religious" },
    { id: "Ranjak Vidnyan", name: "Ranjak Vidnyan (रंजक विज्ञान)", price: 150, category: "Science" },
    { id: "Road to Dusseldorf", name: "Road to Dusseldorf (रोड टू ड्युसेलडॉर्फ)", price: 350, category: "Travel" },
    { id: "Road to Holland English", name: "Road to Holland - English", price: 300, category: "Travel" },
    { id: "Road to Holland Marathi", name: "Road to Holland - Marathi (रोड टू हॉलंड)", price: 300, category: "Travel" },
    { id: "Road to Holland Particha Pravas", name: "Road to Holland Particha Pravas (परतीचा प्रवास)", price: 300, category: "Travel" },
    { id: "Samarth Ek Patrakar", name: "Samarth Ek Patrakar (समर्थ एक पत्रकार)", price: 125, category: "Biography" },
    { id: "Samarth Krupechi Vachane", name: "Samarth Krupechi Vachane (समर्थ कृपेचि वचने)", price: 150, category: "Spiritual" },
    { id: "Samarth Ramdasanchi Vyavasthapan Drushti", name: "Samarth Ramdasanchi Vyavasthapan Drushti (समर्थ रामदासांची व्यवस्थापन दृष्टी)", price: 150, category: "Management" },
    { id: "Sant Vangmay Visheshank", name: "Sant Vangmay Visheshank (संत वाङ्मय)", price: 250, category: "Magazine" },
    { id: "Saptachakravedh", name: "Saptachakravedh (सप्तचक्रवेध)", price: 100, category: "Spiritual" },
    { id: "Savarkar Samjun Ghetana", name: "Savarkar Samjun Ghetana (सावरकर समजून घेताना)", price: 200, category: "Biography" },
    { id: "Savitri Darshan", name: "Savitri Darshan (सावित्री दर्शन)", price: 100, category: "Poetry" },
    { id: "Shastradnyanchya Katha", name: "Shastradnyanchya Katha (शास्त्रज्ञांच्या कथा)", price: 80, category: "Children" },
    { id: "Shikhandi", name: "Shikhandi (शिखंडी)", price: 200, category: "Novel" },
    { id: "Shri Dnyaneshwaritil Pratima Srushti", name: "Shri Dnyaneshwaritil Pratima Srushti", price: 200, category: "Spirituality" },
    { id: "Shriram Visheshank", name: "Shriram Visheshank (श्रीराम विशेषांक)", price: 200, category: "Magazine" },
    { id: "Shriramkrishna", name: "Shriramkrishna (श्रीरामकृष्ण)", price: 300, category: "Biography" },
    { id: "Soliv Sukh", name: "Soliv Sukh (सोलीव सुख)", price: 250, category: "Spiritual" },
    { id: "Subhashit Parimal", name: "Subhashit Parimal (सुभाषित परिमल)", price: 150, category: "Literature" },
    { id: "Subhashit Saurabh", name: "Subhashit Saurabh (सुभाषित सौरभ)", price: 150, category: "Literature" },
    { id: "Swarsaj Visheshank", name: "Swarsaj Visheshank (स्वरसाज)", price: 350, category: "Magazine" },
    { id: "Tenali Ram Ani Birbalachya Goshti", name: "Tenali Ram Ani Birbalachya Goshti", price: 80, category: "Children" },
    { id: "The Students Syndrome", name: "The Students Syndrome", price: 125, category: "Edu" },
    { id: "Trima Kasi English", name: "Trima Kasi - English", price: 350, category: "Novel" },
    { id: "Trima Kasi Marathi", name: "Trima Kasi - Marathi (त्रिमा कासी)", price: 350, category: "Novel" },
    { id: "Urle Urat Kahi", name: "Urle Urat Kahi (उरले उरात काही)", price: 200, category: "Stories" },
    { id: "Vidnyan Balkatha", name: "Vidnyan Balkatha (विज्ञान बालकथा)", price: 75, category: "Children" },
    { id: "Vishwache Aart", name: "Vishwache Aart (विश्वाचे आर्त)", price: 200, category: "Biography" }
];
booksData.sort((a, b) => a.name.localeCompare(b.name));

// DOM elements
const bookSelect = document.getElementById('bookSelect');
const quantityInput = document.getElementById('quantity');
const sellingPriceInput = document.getElementById('sellingPrice');
const ageGroupSelect = document.getElementById('ageGroup');
const saleDateInput = document.getElementById('saleDate');
const saleTimeInput = document.getElementById('saleTime');
const discountTypeRadios = document.querySelectorAll('input[name="discountType"]');
const discountValueInput = document.getElementById('discountValue');
const couponCodeInput = document.getElementById('couponCode');
const summaryDiv = document.getElementById('summaryContent');
const finalTotalSpan = document.getElementById('finalTotal');
const priceWarning = document.getElementById('priceWarning');

// Populate book dropdown
function populateBooks() {
    booksData.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = `${book.name} - ₹${book.price}`;
        option.dataset.price = book.price;
        option.dataset.category = book.category;
        bookSelect.appendChild(option);
    });
}
populateBooks();

// Helper: get selected book
function getSelectedBook() {
    const selected = bookSelect.options[bookSelect.selectedIndex];
    if (!selected.value) return null;
    return {
        id: selected.value,
        name: selected.textContent.split(' - ')[0],
        price: parseFloat(selected.dataset.price),
        category: selected.dataset.category
    };
}

// Real-time update of bill summary
function updateSummary() {
    const book = getSelectedBook();
    if (!book) {
        summaryDiv.innerHTML = '<p class="text-gray-500">Select a book to see details...</p>';
        finalTotalSpan.textContent = '';
        return;
    }

    let quantity = parseInt(quantityInput.value) || 1;
    if (quantity < 1) quantity = 1;
    const mrp = book.price;
    let enteredPrice = sellingPriceInput.value ? parseFloat(sellingPriceInput.value) : null;
    let pricePerUnit = enteredPrice;
    if (enteredPrice && enteredPrice > mrp) {
        priceWarning.classList.remove('hidden');
        pricePerUnit = mrp;  // cap at MRP
    } else {
        priceWarning.classList.add('hidden');
        if (!enteredPrice) pricePerUnit = mrp;
    }

    const subtotal = pricePerUnit * quantity;

    // Discount calculation
    let discountAmount = 0;
    const discountType = document.querySelector('input[name="discountType"]:checked').value;
    let discountValue = parseFloat(discountValueInput.value) || 0;
    if (discountType === 'percent') {
        discountAmount = subtotal * (discountValue / 100);
    } else {
        discountAmount = discountValue;
    }
    if (discountAmount < 0) discountAmount = 0;

    let afterDiscount = subtotal - discountAmount;

    // Coupon SAVE100
    let couponDeduction = 0;
    const coupon = couponCodeInput.value.trim().toUpperCase();
    if (coupon === 'SAVE100') {
        couponDeduction = 100;
        if (couponDeduction > afterDiscount) couponDeduction = afterDiscount;
    }
    const finalTotal = afterDiscount - couponDeduction;
    if (finalTotal < 0) finalTotal = 0;

    // Build summary HTML
    let summaryHtml = `
        <div class="bill-line flex justify-between">
            <span>${book.name}</span>
            <span>₹${pricePerUnit.toFixed(2)} × ${quantity}</span>
        </div>
        <div class="bill-line flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹${subtotal.toFixed(2)}</span>
        </div>
    `;
    if (discountAmount > 0) {
        summaryHtml += `
            <div class="bill-line flex justify-between text-green-700">
                <span>Discount (${discountType === 'percent' ? discountValue + '%' : '₹' + discountValue})</span>
                <span>- ₹${discountAmount.toFixed(2)}</span>
            </div>
        `;
    }
    if (couponDeduction > 0) {
        summaryHtml += `
            <div class="bill-line flex justify-between text-blue-600">
                <span>Coupon SAVE100</span>
                <span>- ₹${couponDeduction.toFixed(2)}</span>
            </div>
        `;
    }
    summaryHtml += `
        <div class="total-line flex justify-between text-lg font-bold">
            <span>Total Payable</span>
            <span>₹${finalTotal.toFixed(2)}</span>
        </div>
    `;
    if (enteredPrice && enteredPrice > mrp) {
        summaryHtml += `<div class="text-xs text-yellow-600 mt-2">* Price capped at MRP (₹${mrp})</div>`;
    }
    summaryDiv.innerHTML = summaryHtml;
    finalTotalSpan.textContent = `₹${finalTotal.toFixed(2)}`;
}

// Event listeners for real-time updates
bookSelect.addEventListener('change', updateSummary);
quantityInput.addEventListener('input', updateSummary);
sellingPriceInput.addEventListener('input', updateSummary);
discountTypeRadios.forEach(radio => radio.addEventListener('change', updateSummary));
discountValueInput.addEventListener('input', updateSummary);
couponCodeInput.addEventListener('input', updateSummary);

// Set default date to a date between Dec 13–21, 2025, and time to 12:00 PM
function setDefaultDateTime() {
    const startDate = new Date(2025, 11, 13); // Dec 13, 2025
    const endDate = new Date(2025, 11, 21);   // Dec 21, 2025
    const today = new Date();
    let defaultDate = today;
    if (today < startDate) defaultDate = startDate;
    if (today > endDate) defaultDate = endDate;
    const year = defaultDate.getFullYear();
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
    const day = String(defaultDate.getDate()).padStart(2, '0');
    saleDateInput.value = `${year}-${month}-${day}`;
    // Set default time to 12:00 (noon)
    saleTimeInput.value = "12:00";
}
setDefaultDateTime();

// Form submission
const form = document.getElementById('sale-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const book = getSelectedBook();
    if (!book) {
        alert("Please select a book");
        return;
    }

    const quantity = parseInt(quantityInput.value) || 1;
    const mrp = book.price;
    let enteredPrice = sellingPriceInput.value ? parseFloat(sellingPriceInput.value) : null;
    let pricePerUnit = enteredPrice;
    if (enteredPrice && enteredPrice > mrp) {
        pricePerUnit = mrp;
    }
    if (!enteredPrice) pricePerUnit = mrp;

    const subtotal = pricePerUnit * quantity;
    const discountType = document.querySelector('input[name="discountType"]:checked').value;
    let discountValue = parseFloat(discountValueInput.value) || 0;
    let discountAmount = 0;
    if (discountType === 'percent') {
        discountAmount = subtotal * (discountValue / 100);
    } else {
        discountAmount = discountValue;
    }
    if (discountAmount < 0) discountAmount = 0;

    let afterDiscount = subtotal - discountAmount;
    const coupon = couponCodeInput.value.trim().toUpperCase();
    let couponDeduction = 0;
    if (coupon === 'SAVE100') {
        couponDeduction = 100;
        if (couponDeduction > afterDiscount) couponDeduction = afterDiscount;
    }
    const finalTotal = afterDiscount - couponDeduction;

    const saleDateTime = new Date(`${saleDateInput.value}T${saleTimeInput.value}`);
    if (isNaN(saleDateTime)) {
        alert("Please select a valid date and time");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in");
        window.location.href = 'login.html';
        return;
    }

    try {
        await addDoc(collection(db, "sales"), {
            bookId: book.id,
            bookTitle: book.name,
            category: book.category,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            mrp: mrp,
            discountAmount: discountAmount,
            discountType: discountType,
            discountValue: discountValue,
            couponCode: coupon === 'SAVE100' ? coupon : null,
            couponDeduction: couponDeduction,
            finalAmount: finalTotal,
            ageGroup: ageGroupSelect.value,
            timestamp: Timestamp.fromDate(saleDateTime),
            createdAt: Timestamp.now(),
            userId: user.uid,
            entryType: 'individual'
        });
        alert("Sale recorded successfully!");
        // Reset form
        form.reset();
        quantityInput.value = 1;
        sellingPriceInput.value = '';
        discountValueInput.value = 0;
        couponCodeInput.value = '';
        discountTypeRadios[0].checked = true;
        setDefaultDateTime();  // reset date
        ageGroupSelect.value = '21-28';
        bookSelect.selectedIndex = 0;
        updateSummary();
    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
});

// Auth state & navbar
const guestLinks = document.getElementById('guest-links');
const authLinks = document.getElementById('auth-links');
const dataEntryNav = document.getElementById('data-entry-nav');
const logoutBtn = document.getElementById('logout-btn');

function updateNavbar(user) {
    if (user) {
        guestLinks.classList.add('hidden');
        authLinks.classList.remove('hidden');
        dataEntryNav.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        guestLinks.classList.remove('hidden');
        authLinks.classList.add('hidden');
        dataEntryNav.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}

onAuthStateChanged(auth, (user) => {
    updateNavbar(user);
    if (!user) window.location.href = 'login.html';
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
    window.location.href = 'index.html';
});