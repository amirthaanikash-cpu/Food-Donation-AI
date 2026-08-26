document.addEventListener("DOMContentLoaded", () => {

    console.log("Smart Food Donation Dashboard Loaded Successfully");

    // ==========================
    // Load Logged-in User
    // ==========================

    const name = localStorage.getItem("name") || "Guest";
    const role = localStorage.getItem("role") || "Donor";
const chatUserName = document.getElementById("chatUserName");

if(chatUserName){

    chatUserName.innerText = name;

}
    // Top Bar
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");

    if (userName) userName.innerText = name;
    if (userRole) {
        let displayRole = role.charAt(0).toUpperCase() + role.slice(1);
        if (role.toLowerCase() === "ngo") displayRole = "NGO";
        userRole.innerText = displayRole;
    }

    // Sidebar
    const sidebarUser = document.getElementById("sidebarUserName");
    if (sidebarUser) {
        sidebarUser.innerText = name;
    }

    // ==========================
    // Logout
    // ==========================
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "login.html";
        });
    }

    // ==========================================
    // SIDEBAR TAB SWITCHING WITH ROLE GUARDS
    // ==========================================
    const currentRole = (localStorage.getItem("role") || "donor").toLowerCase();

    const sections = {
        sidebarHome: { el: document.getElementById("dashboardHomeSection"), roles: ["donor", "ngo", "volunteer"] },
        sidebarDonate: { el: document.getElementById("donateSection"), roles: ["donor"] },
        sidebarMyDonations: { el: document.getElementById("myDonationsSection"), roles: ["donor"] },
        sidebarNGO: { el: document.getElementById("ngoSection"), roles: ["ngo"] },
        sidebarVolunteer: { el: document.getElementById("volunteerSection"), roles: ["volunteer"] },
        sidebarAI: { el: document.querySelector(".ai-assistant"), roles: ["donor", "ngo", "volunteer"] }
    };

    function switchTab(clickedId) {
        const target = sections[clickedId];
        if (!target) return;

        // Check Role Guard
        if (!target.roles.includes(currentRole)) {
            alert(`Access Denied! Only users with the following role(s) can access this module: ${target.roles.map(r => r.toUpperCase()).join(", ")}`);
            return;
        }

        // Deactivate all menu items
        document.querySelectorAll(".menu li").forEach(item => item.classList.remove("active"));
        
        // Activate clicked item
        const clickedItem = document.getElementById(clickedId);
        if (clickedItem) clickedItem.classList.add("active");

        // Hide all sections
        Object.values(sections).forEach(sec => {
            if (sec.el) sec.el.style.display = "none";
        });

        // Show clicked section
        if (target.el) {
            target.el.style.display = "block";
            
            // Special fix for Leaflet map display issues when shown
            if (clickedId === "sidebarDonate" && typeof pickupMap !== "undefined" && pickupMap) {
                setTimeout(() => {
                    pickupMap.invalidateSize();
                }, 200);
            }
        }
    }

    // Attach listeners to sidebar items
    Object.keys(sections).forEach(id => {
        const item = document.getElementById(id);
        if (item) {
            item.addEventListener("click", () => switchTab(id));
        }
    });

    // ==========================================
    // UPDATE DASHBOARD STATS WITH REAL DATA
    // ==========================================
    async function updateDashboardStats() {
        try {
            const response = await fetch("http://127.0.0.1:5000/donations");
            if (!response.ok) return;
            const result = await response.json();
            const allDonations = result.data || [];

            // 1. Total Donations
            const totalDonations = allDonations.length;
            const totalDonationsEl = document.getElementById("totalDonations");
            if (totalDonationsEl) {
                totalDonationsEl.innerText = totalDonations;
                totalDonationsEl.setAttribute("data-target", totalDonations);
            }

            // 2. Meals Saved (sum of quantity of all delivered donations)
            const deliveredDonations = allDonations.filter(d => d.status === "Delivered");
            const mealsSaved = deliveredDonations.reduce((sum, d) => sum + parseInt(d.quantity || 0), 0);
            const mealsSavedEl = document.getElementById("mealsSaved");
            if (mealsSavedEl) {
                mealsSavedEl.innerText = mealsSaved;
                mealsSavedEl.setAttribute("data-target", mealsSaved);
            }

            // 3. Connected NGOs (unique NGO names in accepted/picked/delivered donations)
            const activeNgos = new Set();
            allDonations.forEach(d => {
                if (d.ngo) activeNgos.add(d.ngo);
                if (d.recommended_ngo) activeNgos.add(d.recommended_ngo);
            });
            const connectedNgos = activeNgos.size || 5; // fallback to 5 base NGOs if none
            const connectedNgosEl = document.getElementById("connectedNgos");
            if (connectedNgosEl) {
                connectedNgosEl.innerText = connectedNgos;
                connectedNgosEl.setAttribute("data-target", connectedNgos);
            }

            // 4. AI Food Safety (average freshness percentage)
            const freshDonations = allDonations.filter(d => typeof d.freshness === "number");
            let avgFreshness = 95;
            if (freshDonations.length > 0) {
                const totalFreshness = freshDonations.reduce((sum, d) => sum + d.freshness, 0);
                avgFreshness = Math.round(totalFreshness / freshDonations.length);
            }
            const aiFoodSafetyEl = document.getElementById("aiFoodSafety");
            if (aiFoodSafetyEl) {
                aiFoodSafetyEl.innerText = `${avgFreshness}%`;
                aiFoodSafetyEl.setAttribute("data-target", avgFreshness);
            }
            
            // 5. Update Recent Donations Table
            updateRecentDonationsTable(allDonations);
        } catch (error) {
            console.error("Error updating dashboard stats:", error);
        }
    }

    function updateRecentDonationsTable(donations) {
        const tbody = document.querySelector(".recent-donations tbody");
        if (!tbody) return;
        
        const sorted = [...donations].reverse().slice(0, 5);
        tbody.innerHTML = "";
        
        sorted.forEach(d => {
            let statusClass = "pending";
            if (d.status === "Delivered") statusClass = "delivered";
            else if (d.status === "Picked" || d.status === "Accepted") statusClass = "progress";
            
            tbody.innerHTML += `
                <tr>
                    <td>${d.food_name}</td>
                    <td>${d.donor_email ? d.donor_email.split('@')[0] : "donor"}</td>
                    <td>${d.ngo || d.recommended_ngo || "-"}</td>
                    <td>${d.volunteer || "-"}</td>
                    <td>${d.address ? d.address.split(',')[0] : "Madurai"}</td>
                    <td>
                        <span class="status ${statusClass}">
                            ${d.status}
                        </span>
                    </td>
                </tr>
            `;
        });
    }

    // Expose to window so other scripts (like ngo.js, volunteer.js) can refresh stats in real time
    window.updateDashboardStats = updateDashboardStats;

    // Load live statistics on load
    updateDashboardStats();

    // Default: switch to sidebarHome tab on page load
    switchTab("sidebarHome");

});
/*=========================================
        PROFILE DROPDOWN
=========================================*/
const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");

if (profileBtn && profileMenu) {

    profileBtn.addEventListener("click", function (e) {

        e.stopPropagation();

        profileMenu.classList.toggle("show");

    });

    document.addEventListener("click", function () {

        profileMenu.classList.remove("show");

    });

    profileMenu.addEventListener("click", function (e) {

        e.stopPropagation();

    });

}
/*=========================================
        DONATION ANALYTICS CHART
=========================================*/

const chartCanvas = document.getElementById("donationChart");

if (chartCanvas) {

    new Chart(chartCanvas, {

        type: "line",

        data: {

            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul"
            ],

            datasets: [{

                label: "Meals Donated",

                data: [
                    120,
                    240,
                    180,
                    320,
                    420,
                    510,
                    650
                ],

                borderColor: "#16a34a",

                backgroundColor: "rgba(34,197,94,.15)",

                fill: true,

                tension: .4

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}
/*=========================================
        NOTIFICATION MENU
=========================================*/

const notificationBtn = document.getElementById("notificationBtn");
const notificationMenu = document.getElementById("notificationMenu");

if(notificationBtn && notificationMenu){

    notificationBtn.addEventListener("click", function(e){

        e.stopPropagation();

        notificationMenu.classList.toggle("show");

    });

    document.addEventListener("click", function(){

        notificationMenu.classList.remove("show");

    });

    notificationMenu.addEventListener("click", function(e){

        e.stopPropagation();

    });

}
document.addEventListener("DOMContentLoaded", () => {

    // Your existing code

});


// ==========================
// Dashboard Counter Animation
// ==========================

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const updateCounter = () => {

        const target = Number(counter.getAttribute("data-target"));
        const current = Number(counter.innerText);

        const increment = Math.ceil(target / 50);

        if (current < target) {

            counter.innerText = Math.min(current + increment, target);

            setTimeout(updateCounter, 30);

        }

    };

    updateCounter();

});
// ==========================
// Current Date
// ==========================

const currentDate = document.getElementById("currentDate");

const today = new Date();

const options = {

    weekday: "long",

    year: "numeric",

    month: "long",

    day: "numeric"

};

currentDate.innerText = today.toLocaleDateString("en-US", options);
// ==========================
// Dynamic Greeting
// ==========================

const greeting = document.getElementById("greeting");

if (greeting) {

    const hour = new Date().getHours();

    if (hour < 12) {

        greeting.innerHTML = "Good Morning 🌅";

    }
    else if (hour < 17) {

        greeting.innerHTML = "Good Afternoon ☀️";

    }
    else {

        greeting.innerHTML = "Good Evening 🌙";

    }

}
// ==========================
// Live Clock
// ==========================

const liveClock = document.getElementById("liveClock");

function updateClock() {

    const now = new Date();

    const options = {

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit",

        hour12: true

    };

    if (liveClock) {

        liveClock.innerText = "🕒 " + now.toLocaleTimeString("en-US", options);

    }

}

// Run immediately
updateClock();

// Update every second
setInterval(updateClock, 1000);
// ==========================
// DARK MODE
// ==========================

const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

    if (themeIcon) {

        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");

    }

}

// Toggle theme
if (themeBtn) {

    themeBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

            themeIcon.classList.remove("fa-moon");
            themeIcon.classList.add("fa-sun");

        } else {

            localStorage.setItem("theme", "light");

            themeIcon.classList.remove("fa-sun");
            themeIcon.classList.add("fa-moon");

        }

    });

}
// ==========================================================
// LOAD REAL DONATION DATA WITH OFFLINE FALLBACK
// ==========================================================

async function loadDonationData() {
    try {
        const response = await fetch("http://127.0.0.1:5000/donations");
        const result = await response.json();

        console.log("🔥 Donation Data:", result);

        if (result.status !== "success") {
            console.error("Failed to load donations");
            return;
        }

        const donations = result.data;
        const totalDonations = donations.length;

        // Update Total Donations Counter
        const totalDonationElement = document.getElementById("totalDonations");
        if (totalDonationElement) {
            totalDonationElement.setAttribute("data-target", totalDonations);
            totalDonationElement.innerText = "0";

            // Animate the number
            let current = 0;
            const counterAnimation = setInterval(() => {
                if (current < totalDonations) {
                    current++;
                    totalDonationElement.innerText = current;
                } else {
                    totalDonationElement.innerText = totalDonations;
                    clearInterval(counterAnimation);
                }
            }, 30);
        }

    } catch (error) {
        console.warn("❌ Error loading donations from server, using local fallback:", error);
        
        // Offline Fallback - Load from local storage
        try {
            const localData = JSON.parse(localStorage.getItem("donations")) || [];
            const totalDonations = localData.length;
            const totalDonationElement = document.getElementById("totalDonations");
            if (totalDonationElement) {
                totalDonationElement.setAttribute("data-target", totalDonations);
                totalDonationElement.innerText = totalDonations;
            }
        } catch (e) {
            console.error("Error reading local donations:", e);
        }
    }
}

// Load donations when dashboard opens
loadDonationData();
console.log("🔥 LIVE DONATION CODE IS RUNNING WITH OFFLINE FALLBACK");
