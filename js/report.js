import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function processData(sales) {
    // Basic aggregations
    const topBooksQty = {};        // bookTitle -> quantity
    const topBooksRevenue = {};     // bookTitle -> revenue
    const categoryQuantities = {};
    const dailySales = {};          // date -> total amount
    const ageGroups = {};
    let discountedCount = 0, nonDiscountedCount = 0;
    let couponUsedCount = 0, couponNotUsedCount = 0;
    const priceList = [];           // for price histogram
    const discountList = [];        // discount amount per sale
    const quantityPerTrans = [];    // quantity per sale
    const hourlySales = Array(24).fill(0);
    const weeklySales = Array(7).fill(0);
    const monthlySales = {};        // YYYY-MM -> total amount
    const cumulative = [];          // {date, cumAmount}
    const userPurchaseCount = {};   // userId -> count
    let bulkCount = 0, individualCount = 0;
    const priceQtyPairs = [];       // {x: pricePerUnit, y: quantity}
    const discountFinalPairs = [];  // {x: discountAmount, y: finalAmount}
    const hourDayMatrix = Array(24).fill().map(() => Array(7).fill(0)); // hour x day

    for (const sale of sales) {
        const title = sale.bookTitle;
        const qty = sale.quantity || 1;
        const amount = sale.finalAmount || 0;
        const revenue = amount;
        const category = sale.category || 'Other';
        const age = sale.ageGroup || 'Unknown';
        const discountAmount = sale.discountAmount || 0;
        const coupon = sale.couponCode;
        const pricePerUnit = sale.pricePerUnit || 0;
        const entryType = sale.entryType || 'individual';
        const userId = sale.userId || 'anonymous';
        const date = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp);
        const dateStr = date.toISOString().slice(0,10);
        const hour = date.getHours();
        const day = date.getDay();
        const month = date.toISOString().slice(0,7);

        // topBooksQty
        topBooksQty[title] = (topBooksQty[title] || 0) + qty;
        // topBooksRevenue
        topBooksRevenue[title] = (topBooksRevenue[title] || 0) + revenue;
        // category
        categoryQuantities[category] = (categoryQuantities[category] || 0) + qty;
        // daily sales
        dailySales[dateStr] = (dailySales[dateStr] || 0) + revenue;
        // age groups
        ageGroups[age] = (ageGroups[age] || 0) + qty;
        // discount usage
        if (discountAmount > 0) discountedCount++;
        else nonDiscountedCount++;
        // coupon usage
        if (coupon) couponUsedCount++;
        else couponNotUsedCount++;
        // price list (for histogram)
        if (pricePerUnit > 0) priceList.push(pricePerUnit);
        // discount list
        if (discountAmount > 0) discountList.push(discountAmount);
        // quantity per transaction
        quantityPerTrans.push(qty);
        // hourly sales
        hourlySales[hour] += revenue;
        // weekly sales
        weeklySales[day] += revenue;
        // monthly sales
        monthlySales[month] = (monthlySales[month] || 0) + revenue;
        // cumulative
        cumulative.push({ date: date, amount: revenue });
        // user purchases
        userPurchaseCount[userId] = (userPurchaseCount[userId] || 0) + 1;
        // entry type
        if (entryType === 'bulk') bulkCount++;
        else individualCount++;
        // price vs quantity
        priceQtyPairs.push({ x: pricePerUnit, y: qty });
        // discount vs final amount
        discountFinalPairs.push({ x: discountAmount, y: revenue });
        // hour-day matrix
        hourDayMatrix[hour][day] += revenue;
    }

    // Sort top books by quantity (already topBooksQty)
    const topBooksQtyArray = Object.entries(topBooksQty)
        .sort((a,b) => b[1] - a[1])
        .slice(0,10)
        .map(([label, value]) => ({ label: escapeHtml(label), value }));
    const topBooksRevenueArray = Object.entries(topBooksRevenue)
        .sort((a,b) => b[1] - a[1])
        .slice(0,10)
        .map(([label, value]) => ({ label: escapeHtml(label), value }));

    const categoryArray = Object.entries(categoryQuantities)
        .map(([label, value]) => ({ label: escapeHtml(label), value }));

    const dailyArray = Object.entries(dailySales)
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([label, value]) => ({ label, value }));

    const ageArray = Object.entries(ageGroups)
        .map(([label, value]) => ({ label: escapeHtml(label), value }));

    // Histograms
    function createHistogram(values, binSize) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const bins = {};
        for (let v of values) {
            const bin = Math.floor(v / binSize) * binSize;
            bins[bin] = (bins[bin] || 0) + 1;
        }
        return Object.entries(bins)
            .sort((a,b) => parseFloat(a[0]) - parseFloat(b[0]))
            .map(([label, count]) => ({ label: `${label}-${parseFloat(label)+binSize}`, value: count }));
    }
    const priceHistogram = priceList.length ? createHistogram(priceList, 50) : [];
    const discountHistogram = discountList.length ? createHistogram(discountList, 50) : [];
    const quantityHistogram = createHistogram(quantityPerTrans, 1); // bin size 1

    // Cumulative sales
    const cumulativeSorted = cumulative.sort((a,b) => a.date - b.date);
    let cum = 0;
    const cumulativeArray = cumulativeSorted.map(item => {
        cum += item.amount;
        return { label: item.date.toISOString().slice(0,10), value: cum };
    });

    // Top customers (show user IDs truncated)
    const topCustomersArray = Object.entries(userPurchaseCount)
        .sort((a,b) => b[1] - a[1])
        .slice(0,10)
        .map(([label, value]) => ({ label: label.slice(0,8) + '...', value }));

    // Moving average on daily sales (3-day)
    const movingAverage = [];
    const dailyVals = dailyArray.map(d => d.value);
    for (let i = 0; i < dailyVals.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i-1); j <= Math.min(dailyVals.length-1, i+1); j++) {
            sum += dailyVals[j];
            count++;
        }
        movingAverage.push(sum / count);
    }

    // Pareto (cumulative percentage of top books by quantity)
    const totalQty = Object.values(topBooksQty).reduce((a,b) => a+b, 0);
    const sortedBooks = Object.entries(topBooksQty).sort((a,b) => b[1] - a[1]);
    let cumQty = 0;
    const paretoData = sortedBooks.map(([label, qty]) => {
        cumQty += qty;
        return { label: escapeHtml(label), qty, cumPercent: (cumQty / totalQty) * 100 };
    }).slice(0,15);

    // Monthly sales trend
    const monthlyArray = Object.entries(monthlySales)
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([label, value]) => ({ label, value }));

    // Hourly sales array for chart
    const hourlyArray = hourlySales.map((value, idx) => ({ label: idx, value }));
    // Weekly sales array
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyArray = weeklySales.map((value, idx) => ({ label: weekDays[idx], value }));

    // Heatmap: we'll create a grouped bar chart for hour vs day
    const hourDayLabels = Array.from({length:24}, (_,i) => i.toString());
    const datasets = [];
    for (let d = 0; d < 7; d++) {
        datasets.push({
            label: weekDays[d],
            data: hourDayMatrix.map(row => row[d]),
            backgroundColor: `hsl(${d * 45}, 70%, 50%)`,
        });
    }

    return {
        topBooksQty: topBooksQtyArray,
        topBooksRevenue: topBooksRevenueArray,
        categories: categoryArray,
        dailySales: dailyArray,
        ageGroups: ageArray,
        discountUsage: [discountedCount, nonDiscountedCount],
        couponUsage: [couponUsedCount, couponNotUsedCount],
        priceHistogram,
        discountHistogram,
        quantityHistogram,
        hourlySales: hourlyArray,
        weeklySales: weeklyArray,
        monthlySales: monthlyArray,
        cumulativeSales: cumulativeArray,
        topCustomers: topCustomersArray,
        entryType: [bulkCount, individualCount],
        priceQty: priceQtyPairs,
        discountFinal: discountFinalPairs,
        movingAverage: { labels: dailyArray.map(d => d.label), values: movingAverage },
        pareto: paretoData,
        hourDayDatasets: { labels: hourDayLabels, datasets }
    };
}

function createChart(container, title, type, labels, datasets, options = {}) {
    const card = document.createElement('div');
    card.className = 'bg-gray-50 p-4 rounded shadow';
    card.innerHTML = `<h3 class="font-semibold text-lg mb-2">${title}</h3><div class="chart-container"><canvas id="chart-${Date.now()}-${Math.random()}"></canvas></div>`;
    container.appendChild(card);
    const canvas = card.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type,
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            ...options
        }
    });
}

export async function loadReport() {
    const loadingDiv = document.getElementById('loading');
    const chartsContainer = document.getElementById('charts-container');

    try {
        const salesSnap = await getDocs(collection(db, "sales"));
        const sales = salesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (sales.length === 0) {
            loadingDiv.innerHTML = '<p class="text-red-500">No sales data available. Please add entries first.</p>';
            chartsContainer.classList.add('hidden');
            return;
        }

        const data = processData(sales);
        loadingDiv.classList.add('hidden');
        chartsContainer.classList.remove('hidden');

        const grid = chartsContainer.querySelector('.grid');
        grid.innerHTML = '';

        // --- Basic charts (original 8) ---
        // 1. Top 10 Books by Quantity
        createChart(grid, 'Top 10 Books by Quantity Sold', 'bar',
            data.topBooksQty.map(d => d.label),
            [{ label: 'Quantity', data: data.topBooksQty.map(d => d.value), backgroundColor: '#3b82f6' }],
            { indexAxis: 'y', scales: { x: { title: { display: true, text: 'Quantity' } } } }
        );

        // 2. Category Distribution
        createChart(grid, 'Sales by Category', 'pie',
            data.categories.map(d => d.label),
            [{ data: data.categories.map(d => d.value), backgroundColor: ['#ef4444','#f97316','#f59e0b','#10b981','#14b8a6','#06b6d4','#3b82f6','#8b5cf6','#d946ef','#ec489a'] }]
        );

        // 3. Daily Sales Trend
        createChart(grid, 'Daily Sales Trend', 'line',
            data.dailySales.map(d => d.label),
            [{ label: 'Revenue (₹)', data: data.dailySales.map(d => d.value), borderColor: '#10b981', fill: false }],
            { scales: { y: { beginAtZero: true, title: { display: true, text: 'Revenue (₹)' } } } }
        );

        // 4. Age Group Distribution
        createChart(grid, 'Sales by Age Group', 'bar',
            data.ageGroups.map(d => d.label),
            [{ label: 'Quantity Sold', data: data.ageGroups.map(d => d.value), backgroundColor: '#8b5cf6' }]
        );

        // 5. Discount Usage
        createChart(grid, 'Discount Usage', 'pie',
            ['With Discount', 'Without Discount'],
            [{ data: data.discountUsage, backgroundColor: ['#ef4444','#3b82f6'] }]
        );

        // 6. Coupon Usage
        createChart(grid, 'Coupon Usage', 'pie',
            ['Used Coupon', 'No Coupon'],
            [{ data: data.couponUsage, backgroundColor: ['#f59e0b','#6b7280'] }]
        );

        // 7. Top 5 Categories by Quantity (bar)
        const topCategories = [...data.categories].sort((a,b) => b.value - a.value).slice(0,5);
        createChart(grid, 'Top 5 Categories by Quantity', 'bar',
            topCategories.map(d => d.label),
            [{ label: 'Quantity', data: topCategories.map(d => d.value), backgroundColor: '#14b8a6' }]
        );

        // 8. Average Price per Category
        const categoryPriceSum = {};
        const categoryPriceCount = {};
        for (const sale of sales) {
            const cat = sale.category || 'Other';
            const price = sale.pricePerUnit || 0;
            categoryPriceSum[cat] = (categoryPriceSum[cat] || 0) + price;
            categoryPriceCount[cat] = (categoryPriceCount[cat] || 0) + 1;
        }
        const avgPriceByCat = Object.entries(categoryPriceSum)
            .map(([cat, sum]) => ({ label: escapeHtml(cat), value: sum / categoryPriceCount[cat] }))
            .sort((a,b) => b.value - a.value)
            .slice(0,8);
        createChart(grid, 'Average Price per Category (from sales)', 'bar',
            avgPriceByCat.map(d => d.label),
            [{ label: 'Avg Price (₹)', data: avgPriceByCat.map(d => d.value), backgroundColor: '#ec489a' }],
            { indexAxis: 'y' }
        );

        // --- 10 more analyses ---
        // 9. Top 10 Books by Revenue
        createChart(grid, 'Top 10 Books by Revenue', 'bar',
            data.topBooksRevenue.map(d => d.label),
            [{ label: 'Revenue (₹)', data: data.topBooksRevenue.map(d => d.value), backgroundColor: '#f97316' }],
            { indexAxis: 'y', scales: { x: { title: { display: true, text: 'Revenue (₹)' } } } }
        );

        // 10. Price Distribution (histogram)
        if (data.priceHistogram.length) {
            createChart(grid, 'Price Distribution (per unit)', 'bar',
                data.priceHistogram.map(d => d.label),
                [{ label: 'Number of Sales', data: data.priceHistogram.map(d => d.value), backgroundColor: '#a855f7' }],
                { scales: { x: { title: { display: true, text: 'Price Range (₹)' } }, y: { title: { display: true, text: 'Frequency' } } } }
            );
        }

        // 11. Discount Distribution (histogram)
        if (data.discountHistogram.length) {
            createChart(grid, 'Discount Amount Distribution', 'bar',
                data.discountHistogram.map(d => d.label),
                [{ label: 'Number of Sales', data: data.discountHistogram.map(d => d.value), backgroundColor: '#ec489a' }],
                { scales: { x: { title: { display: true, text: 'Discount Range (₹)' } }, y: { title: { display: true, text: 'Frequency' } } } }
            );
        }

        // 12. Quantity per Transaction (histogram)
        createChart(grid, 'Quantity per Transaction', 'bar',
            data.quantityHistogram.map(d => d.label),
            [{ label: 'Number of Transactions', data: data.quantityHistogram.map(d => d.value), backgroundColor: '#14b8a6' }],
            { scales: { x: { title: { display: true, text: 'Quantity' } }, y: { title: { display: true, text: 'Frequency' } } } }
        );

        // 13. Sales by Hour of Day
        createChart(grid, 'Sales by Hour of Day', 'bar',
            data.hourlySales.map(d => d.label),
            [{ label: 'Revenue (₹)', data: data.hourlySales.map(d => d.value), backgroundColor: '#3b82f6' }],
            { scales: { x: { title: { display: true, text: 'Hour' } }, y: { title: { display: true, text: 'Revenue (₹)' } } } }
        );

        // 14. Sales by Day of Week
        createChart(grid, 'Sales by Day of Week', 'bar',
            data.weeklySales.map(d => d.label),
            [{ label: 'Revenue (₹)', data: data.weeklySales.map(d => d.value), backgroundColor: '#f59e0b' }],
            { scales: { y: { title: { display: true, text: 'Revenue (₹)' } } } }
        );

        // 15. Monthly Sales Trend
        createChart(grid, 'Monthly Sales Trend', 'line',
            data.monthlySales.map(d => d.label),
            [{ label: 'Revenue (₹)', data: data.monthlySales.map(d => d.value), borderColor: '#10b981', fill: false }],
            { scales: { y: { beginAtZero: true, title: { display: true, text: 'Revenue (₹)' } } } }
        );

        // 16. Cumulative Sales Over Time
        createChart(grid, 'Cumulative Sales', 'line',
            data.cumulativeSales.map(d => d.label),
            [{ label: 'Cumulative Revenue (₹)', data: data.cumulativeSales.map(d => d.value), borderColor: '#8b5cf6', fill: true, backgroundColor: 'rgba(139, 92, 246, 0.1)' }],
            { scales: { y: { title: { display: true, text: 'Revenue (₹)' } } } }
        );

        // 17. Top Customers by Purchase Count
        if (data.topCustomers.length) {
            createChart(grid, 'Top Customers by Purchase Count', 'bar',
                data.topCustomers.map(d => d.label),
                [{ label: 'Number of Purchases', data: data.topCustomers.map(d => d.value), backgroundColor: '#ef4444' }],
                { indexAxis: 'y', scales: { x: { title: { display: true, text: 'Purchases' } } } }
            );
        }

        

        // --- 5 advanced analyses ---
        // 19. Price vs Quantity (scatter)
        createChart(grid, 'Price vs Quantity (Scatter)', 'scatter',
            [],
            [{ label: 'Transaction', data: data.priceQty, backgroundColor: '#f97316', pointRadius: 4 }],
            { scales: { x: { title: { display: true, text: 'Price per Unit (₹)' } }, y: { title: { display: true, text: 'Quantity' } } } }
        );

        // 20. Discount vs Final Amount (scatter)
        createChart(grid, 'Discount vs Final Amount', 'scatter',
            [],
            [{ label: 'Transaction', data: data.discountFinal, backgroundColor: '#14b8a6', pointRadius: 4 }],
            { scales: { x: { title: { display: true, text: 'Discount Amount (₹)' } }, y: { title: { display: true, text: 'Final Amount (₹)' } } } }
        );

        // 21. Daily Sales with Moving Average (3-day)
        if (data.movingAverage.labels.length) {
            createChart(grid, 'Daily Sales with 3-Day Moving Average', 'line',
                data.movingAverage.labels,
                [
                    { label: 'Daily Revenue', data: data.dailySales.map(d => d.value), borderColor: '#3b82f6', fill: false },
                    { label: 'Moving Average', data: data.movingAverage.values, borderColor: '#ef4444', borderDash: [5,5], fill: false }
                ],
                { scales: { y: { title: { display: true, text: 'Revenue (₹)' } } } }
            );
        }

        // 22. Heatmap: Hour vs Day of Week (grouped bar chart)
        createChart(grid, 'Sales Heatmap (Hour vs Day)', 'bar',
            data.hourDayDatasets.labels,
            data.hourDayDatasets.datasets,
            { scales: { y: { title: { display: true, text: 'Revenue (₹)' } }, x: { title: { display: true, text: 'Hour of Day' } } } }
        );

        // 23. Pareto (80/20) Analysis: Cumulative % of Quantity by Top Books
        const paretoLabels = data.pareto.map(p => p.label);
        const paretoQty = data.pareto.map(p => p.qty);
        const paretoCum = data.pareto.map(p => p.cumPercent);
        createChart(grid, 'Pareto Analysis: Top Books by Quantity', 'bar',
            paretoLabels,
            [
                { label: 'Quantity', data: paretoQty, backgroundColor: '#3b82f6', yAxisID: 'y' },
                { label: 'Cumulative %', data: paretoCum, type: 'line', borderColor: '#ef4444', fill: false, yAxisID: 'y1' }
            ],
            { scales: { y: { title: { display: true, text: 'Quantity' }, beginAtZero: true }, y1: { position: 'right', title: { display: true, text: 'Cumulative %' }, min: 0, max: 100 } } }
        );

    } catch (err) {
        console.error(err);
        loadingDiv.innerHTML = '<p class="text-red-500">Error loading data. Please try again later.</p>';
        chartsContainer.classList.add('hidden');
    }
}

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
});

logoutBtn?.addEventListener('click', () => {
    signOut(auth);
    window.location.href = 'index.html';
});

loadReport();