/*=========================================
        IMAGE PREVIEW
=========================================*/

const image = document.getElementById("foodImage");
const preview = document.getElementById("previewImage");

if(image){

image.addEventListener("change", function(){

const file = this.files[0];

if(file){

preview.src = URL.createObjectURL(file);

preview.style.display = "block";

}

});

}

/*=========================================
        DONATION FORM
=========================================*/

/*=========================================
        AI FOOD SAFETY
=========================================*/

const prepared=document.getElementById("preparedTime");

const expiry = document.getElementById("expiry");
if(prepared && expiry){

    prepared.addEventListener("change", calculateAI);

    expiry.addEventListener("change", calculateAI);

}
function calculateAI(){

if(prepared.value==="" || expiry.value==="") return;

const p=prepared.value.split(":");

const e=expiry.value.split(":");

const prepareMinutes=parseInt(p[0])*60+parseInt(p[1]);

const expiryMinutes=parseInt(e[0])*60+parseInt(e[1]);

const diff=expiryMinutes-prepareMinutes;

let freshness=0;

let status="";

let recommendation="";

if(diff>=360){

freshness=96;

status="Excellent";

recommendation="Food is safe for donation.";

}

else if(diff>=240){

freshness=85;

status="Good";

recommendation="Donate as soon as possible.";

}

else if(diff>=120){

freshness=65;

status="Average";

recommendation="Deliver within 1 hour.";

}

else{

freshness=30;

status="Unsafe";

recommendation="Not recommended for donation.";

}

document.getElementById("freshness").innerHTML=freshness+"%";

document.getElementById("foodStatus").innerHTML=status;

document.getElementById("recommendation").innerHTML=recommendation;

}
// [Form submission logic consolidated in the unified handler at the bottom of the file]
// ==========================================
// AI FOOD SAFETY VARIABLES
// ==========================================
const foodCategory = document.getElementById("foodCategory");
const storage = document.getElementById("storage");

const preparedDate = document.getElementById("preparedDate");
const preparedTime = document.getElementById("preparedTime");
const preparedPeriod = document.getElementById("preparedPeriod");

const expiryDate = document.getElementById("expiryDate");
const expiryTime = document.getElementById("expiryTime");
const expiryPeriod = document.getElementById("expiryPeriod");

const freshness = document.getElementById("freshness");
const foodStatus = document.getElementById("foodStatus");
const recommendation = document.getElementById("recommendation");
// ==========================================================
// CONVERT 12-HOUR TIME TO 24-HOUR TIME
// ==========================================================
function convertTo24Hour(time, period) {

    let [hour, minute] = time.split(":").map(Number);

    if (period === "AM" && hour === 12) {
        hour = 0;
    }

    if (period === "PM" && hour !== 12) {
        hour += 12;
    }

    return {
        hour,
        minute
    };
}
// ==========================================================
// AI FOOD ANALYSIS
// ==========================================================
function analyzeFood() {

    if (
        !foodCategory ||
        !storage ||
        !preparedDate ||
        !preparedTime ||
        !preparedPeriod ||
        !expiryDate ||
        !expiryTime ||
        !expiryPeriod
    ) {
        console.error("AI: Required elements not found");
        return;
    }

    // Check all required values
    if (
        !foodCategory.value ||
        !storage.value ||
        !preparedDate.value ||
        !preparedTime.value ||
        !expiryDate.value ||
        !expiryTime.value
    ) {
        return;
    }

    // ==========================
    // CONVERT PREPARED TIME
    // ==========================

    const prep = convertTo24Hour(
        preparedTime.value,
        preparedPeriod.value
    );

    // ==========================
    // CONVERT EXPIRY TIME
    // ==========================

    const exp = convertTo24Hour(
        expiryTime.value,
        expiryPeriod.value
    );

    // ==========================
    // CREATE REAL DATE/TIME
    // ==========================

    const preparationDateTime = new Date(
        preparedDate.value + "T" +
        String(prep.hour).padStart(2, "0") + ":" +
        String(prep.minute).padStart(2, "0")
    );

    const expiryDateTime = new Date(
        expiryDate.value + "T" +
        String(exp.hour).padStart(2, "0") + ":" +
        String(exp.minute).padStart(2, "0")
    );

    // ==========================
    // VALIDATE DATES
    // ==========================

    if (expiryDateTime <= preparationDateTime) {

        freshness.innerText = "--";

        foodStatus.innerText = "❌ Invalid";

        recommendation.innerText =
            "Expiry date/time must be after preparation date/time.";

        return;
    }

    // ==========================
    // CURRENT TIME
    // ==========================

    const now = new Date();

    // ==========================
    // FOOD TOTAL LIFE
    // ==========================

    const totalLife =
        expiryDateTime - preparationDateTime;

    // ==========================
    // TIME ALREADY PASSED
    // ==========================

    const elapsed =
        now - preparationDateTime;

    // ==========================
    // CHECK IF NOT PREPARED YET
    // ==========================

    if (elapsed < 0) {

        freshness.innerText = "--";

        foodStatus.innerText = "⏳ Upcoming";

        recommendation.innerText =
            "Preparation time has not been reached yet.";

        return;
    }

    // ==========================
    // CHECK IF EXPIRED
    // ==========================

    if (now >= expiryDateTime) {

        freshness.innerText = "0%";

        foodStatus.innerText = "❌ Expired";

        recommendation.innerText =
            "Food has passed its expiry time. Do not donate.";

        return;
    }

    // ==========================
    // REMAINING TIME
    // ==========================

    const remaining =
        expiryDateTime - now;

    const totalHours =
        totalLife / (1000 * 60 * 60);

    const remainingHours =
        remaining / (1000 * 60 * 60);

    // ==========================
    // TIME PROGRESS
    // ==========================

    let freshnessScore =
        (remaining / totalLife) * 100;

    // ==========================
    // FOOD CATEGORY
    // ==========================

    if (foodCategory.value === "Non Veg" ||
        foodCategory.value === "Non-Veg") {

        freshnessScore -= 10;

    }
    else if (foodCategory.value === "Veg") {

        freshnessScore -= 2;

    }

    // ==========================
    // STORAGE
    // ==========================

    if (storage.value === "Room Temperature") {

        freshnessScore -= 10;

    }
    else if (
        storage.value === "Refrigerated" ||
        storage.value === "Refrigerator"
    ) {

        freshnessScore += 3;

    }
    else if (storage.value === "Frozen") {

        freshnessScore += 5;

    }

    // Keep between 0 and 100

    freshnessScore = Math.round(
        Math.max(0, Math.min(100, freshnessScore))
    );

    // ==========================
    // DISPLAY FRESHNESS
    // ==========================

    freshness.innerText =
        freshnessScore + "%";

    // ==========================
    // FOOD STATUS
    // ==========================

    if (remainingHours <= 0) {

        foodStatus.innerText = "❌ Expired";

        recommendation.innerText =
            "Food has expired. Do not donate.";

    }
    else if (remainingHours <= 1) {

        foodStatus.innerText =
            "🔴 Near Expiry";

        recommendation.innerText =
            "Less than 1 hour remaining. Donate immediately if food has been stored safely.";

    }
    else if (freshnessScore >= 75) {

        foodStatus.innerText =
            "✅ Fresh";

        recommendation.innerText =
            "Food appears fresh. Donate as soon as possible.";

    }
    else if (freshnessScore >= 50) {

        foodStatus.innerText =
            "⚠ Moderate";

        recommendation.innerText =
            "Food is approaching expiry. Prioritize donation.";

    }
    else {

        foodStatus.innerText =
            "⚠ Low Freshness";

        recommendation.innerText =
            "Food is close to expiry. Donate immediately if safe.";

    }

    // ==========================
    // CONSOLE INFORMATION
    // ==========================

    console.log(
        "Prepared:",
        preparedDate.value,
        preparedTime.value,
        preparedPeriod.value
    );

    console.log(
        "Expiry:",
        expiryDate.value,
        expiryTime.value,
        expiryPeriod.value
    );

    console.log(
        "Remaining:",
        remainingHours.toFixed(2),
        "hours"
    );

    console.log(
        "Freshness:",
        freshnessScore + "%"
    );
}
// ==========================================================
// RUN AI WHEN TIME / FOOD DATA CHANGES
// ==========================================================
foodCategory.addEventListener("change", analyzeFood);

storage.addEventListener("change", analyzeFood);

preparedDate.addEventListener("change", analyzeFood);
preparedTime.addEventListener("change", analyzeFood);
preparedPeriod.addEventListener("change", analyzeFood);

expiryDate.addEventListener("change", analyzeFood);
expiryTime.addEventListener("change", analyzeFood);
expiryPeriod.addEventListener("change", analyzeFood);
// ==========================================
// FOOD IMAGE PREVIEW
// ==========================================

const foodImage = document.getElementById("foodImage");
const previewImage = document.getElementById("previewImage");

if (foodImage && previewImage) {

    foodImage.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            previewImage.style.display = "none";
            return;
        }

        if (!file.type.startsWith("image/")) {

            alert("Please select a valid image.");

            this.value = "";

            previewImage.style.display = "none";

            return;
        }

        const imageURL = URL.createObjectURL(file);

        previewImage.src = imageURL;

        previewImage.style.display = "block";

    });

}

// ==========================================
// COMPLETE PICKUP LOCATION SYSTEM
// ==========================================

let pickupMap;
let pickupMarker = null;

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const addressInput = document.getElementById("address");
const locationSearchInput = document.getElementById("locationSearch");
const searchLocationBtn = document.getElementById("searchLocationBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");

// Initialize Leaflet Map
function initLeafletMap() {
    if (typeof L === "undefined") {
        console.error("Leaflet library not loaded");
        return;
    }

    // Fix Leaflet's default marker icon paths (broken on standard script CDN load)
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const defaultLocation = [9.9252, 78.1198]; // Madurai, Tamil Nadu, India

    pickupMap = L.map('map').setView(defaultLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(pickupMap);

    // Solves the incomplete tile rendering bug by repeatedly forcing size recalculations during grid layout render
    const invalidator = function () {
        if (pickupMap) {
            pickupMap.invalidateSize();
        }
    };

    [100, 300, 600, 1000, 1500, 2000, 3000].forEach(function (delay) {
        setTimeout(invalidator, delay);
    });

    if (document.readyState === "complete") {
        setTimeout(invalidator, 500);
    } else {
        window.addEventListener("load", function () {
            setTimeout(invalidator, 500);
        });
    }

    // Trigger size recalculation on interactions to ensure full rendering
    pickupMap.on("focus", invalidator);
    pickupMap.on("mouseover", invalidator);
    pickupMap.on("click", invalidator);

    // Populate initial coordinates
    if (latitudeInput) latitudeInput.value = defaultLocation[0].toFixed(6);
    if (longitudeInput) longitudeInput.value = defaultLocation[1].toFixed(6);

    // Create marker
    pickupMarker = L.marker(defaultLocation, {
        draggable: true,
        title: "Drag me to your pickup location"
    }).addTo(pickupMap);

    // Update coordinates when marker is dragged and dropped
    pickupMarker.on("dragend", function () {
        const position = pickupMarker.getLatLng();
        updateSelectedLocation(position.lat, position.lng, true, false);
    });

    // Move marker and update coordinates when map is clicked
    pickupMap.on("click", function (event) {
        if (event.latlng) {
            updateSelectedLocation(event.latlng.lat, event.latlng.lng, true, false);
        }
    });

    // Address Search button
    if (searchLocationBtn) {
        searchLocationBtn.addEventListener("click", searchPickupLocation);
    }

    // Address Search Enter key support
    if (locationSearchInput) {
        locationSearchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent accidental form submission
                searchPickupLocation();
            }
        });
    }

    // Geolocation / Current Location button
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener("click", function () {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            const originalHTML = currentLocationBtn.innerHTML;
            currentLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Requesting Location...';
            currentLocationBtn.disabled = true;

            // Success callback
            const successCallback = function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                updateSelectedLocation(lat, lng, true, true, 16);

                currentLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Location Selected';
                currentLocationBtn.disabled = false;

                setTimeout(() => {
                    currentLocationBtn.innerHTML = originalHTML;
                }, 3000);
            };

            // Error callback
            const errorCallback = function (error) {
                console.error("Geolocation error:", error);
                let errMsg = "Unable to retrieve your location.";
                if (error.code === error.PERMISSION_DENIED) {
                    errMsg = "Location permission denied. Please enable location services in your browser settings.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errMsg = "Location information is unavailable.";
                } else if (error.code === error.TIMEOUT) {
                    errMsg = "The request to get user location timed out.";
                }
                alert(errMsg);
                currentLocationBtn.innerHTML = originalHTML;
                currentLocationBtn.disabled = false;
            };

            // Attempt precise geolocation first
            navigator.geolocation.getCurrentPosition(
                successCallback,
                function (err) {
                    // Fallback to lower accuracy if precise geolocation times out or fails (common on desktop web browsers)
                    if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
                        console.log("High accuracy timed out. Falling back to default settings...");
                        navigator.geolocation.getCurrentPosition(
                            successCallback,
                            errorCallback,
                            { enableHighAccuracy: false, timeout: 6000 }
                        );
                    } else {
                        errorCallback(err);
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }
}

// REUSABLE FUNCTION FOR UPDATING SELECTED LOCATION
function updateSelectedLocation(lat, lng, shouldReverseGeocode = false, shouldMoveMap = false, zoomLevel = null) {
    const latVal = Number(lat).toFixed(6);
    const lngVal = Number(lng).toFixed(6);

    // 1. Update coordinate inputs
    if (latitudeInput) latitudeInput.value = latVal;
    if (longitudeInput) longitudeInput.value = lngVal;

    const latLng = [lat, lng];

    // 2. Move or place marker
    if (pickupMarker) {
        pickupMarker.setLatLng(latLng);
    } else if (pickupMap) {
        pickupMarker = L.marker(latLng, {
            draggable: true,
            title: "Drag me to your pickup location"
        }).addTo(pickupMap);
        pickupMarker.on("dragend", function () {
            const position = pickupMarker.getLatLng();
            updateSelectedLocation(position.lat, position.lng, true, false);
        });
    }

    // 3. Move map if requested
    if (shouldMoveMap && pickupMap) {
        pickupMap.invalidateSize(); // Force recalculating size before centering
        if (zoomLevel !== null) {
            pickupMap.setView(latLng, zoomLevel);
        } else {
            pickupMap.panTo(latLng);
        }
    }

    // 4. Reverse geocode if requested
    if (shouldReverseGeocode) {
        reverseGeocode(lat, lng);
    }
}

// SEARCH PICKUP LOCATION FUNCTION (Geocoding)
async function searchPickupLocation() {
    if (!locationSearchInput) return;
    const searchText = locationSearchInput.value.trim();

    if (!searchText) {
        alert("Please enter a pickup location address.");
        return;
    }

    const originalText = searchLocationBtn ? searchLocationBtn.textContent : "Search";
    if (searchLocationBtn) {
        searchLocationBtn.disabled = true;
        searchLocationBtn.textContent = "Searching...";
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`;
        const response = await fetch(url, {
            headers: {
                "Accept-Language": "en"
            }
        });
        if (!response.ok) throw new Error("Geocoding API network response error");
        const data = await response.json();

        if (data && data.length > 0) {
            const firstResult = data[0];
            const lat = parseFloat(firstResult.lat);
            const lon = parseFloat(firstResult.lon);

            // Move map, marker, update coordinates
            updateSelectedLocation(lat, lon, false, true, 16);

            // Populate the address input
            if (addressInput) {
                addressInput.value = firstResult.display_name;
            }
        } else {
            alert("Address not found. Please try a more specific address search.");
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        alert("An error occurred while searching for the address. Please check your network connection.");
    } finally {
        if (searchLocationBtn) {
            searchLocationBtn.disabled = false;
            searchLocationBtn.textContent = originalText;
        }
    }
}

// REVERSE GEOCODING FUNCTION
async function reverseGeocode(latitude, longitude) {
    if (!addressInput) return;
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url, {
            headers: {
                "Accept-Language": "en"
            }
        });
        if (!response.ok) throw new Error("Reverse geocoding network response error");
        const data = await response.json();

        if (data && data.display_name) {
            addressInput.value = data.display_name;
        } else {
            console.warn("No address name found for these coordinates.");
        }
    } catch (error) {
        console.error("Reverse geocoding error:", error);
    }
}

// Run map initialization
initLeafletMap();

// ==========================================
// FOOD IMAGE PREVIEW
// ==========================================

const foodImageInput = document.getElementById("foodImage");
const previewImageElement = document.getElementById("previewImage");

if (foodImageInput && previewImageElement) {
    foodImageInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            previewImageElement.style.display = "none";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            this.value = "";
            previewImageElement.style.display = "none";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            previewImageElement.src = event.target.result;
            previewImageElement.style.display = "block";
        };

        reader.readAsDataURL(file);
    });
}

// ==========================================
// DONATE FOOD FORM SUBMISSION
// ==========================================

const donateForm = document.getElementById("donateForm");

if (donateForm) {
    donateForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get form values
        const foodName = document.getElementById("foodName").value.trim();
        const foodCategory = document.getElementById("foodCategory").value;
        const quantity = document.getElementById("quantity").value;
        const preparedDate = document.getElementById("preparedDate").value;
        const preparedTime = document.getElementById("preparedTime").value;
        const preparedPeriod = document.getElementById("preparedPeriod").value;
        const expiryDate = document.getElementById("expiryDate").value;
        const expiryTime = document.getElementById("expiryTime").value;
        const expiryPeriod = document.getElementById("expiryPeriod").value;
        const storage = document.getElementById("storage").value;
        const address = document.getElementById("address").value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;

        // Check required fields
        if (
            !foodName ||
            !foodCategory ||
            !quantity ||
            !preparedDate ||
            !preparedTime ||
            !expiryDate ||
            !expiryTime ||
            !storage ||
            !address
        ) {
            alert("Please fill in all required food details.");
            return;
        }

        // Check location
        if (!latitude || !longitude) {
            alert("Please select a pickup location on the map.");
            return;
        }

        // Format dates and times for backend logic
        const prep = convertTo24Hour(preparedTime, preparedPeriod);
        const exp = convertTo24Hour(expiryTime, expiryPeriod);
        const prepared_time_str = `${String(prep.hour).padStart(2, "0")}:${String(prep.minute).padStart(2, "0")}`;
        const expiry_time_str = `${String(exp.hour).padStart(2, "0")}:${String(exp.minute).padStart(2, "0")}`;

        const donor_email = localStorage.getItem("email") || "test@example.com";

        // Create donation data object
        const donationData = {
            foodName: foodName,
            foodCategory: foodCategory,
            quantity: quantity,
            preparedDate: preparedDate,
            preparedTime: prepared_time_str,
            expiryDate: expiryDate,
            expiryTime: expiry_time_str,
            storage: storage,
            address: address,
            latitude: latitude,
            longitude: longitude,
            donationStatus: "Available",
            createdAt: new Date().toISOString()
        };

        // Try submitting to Flask Backend first
        let backendSubmitted = false;
        try {
            const response = await fetch("http://127.0.0.1:5000/donate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    food_name: foodName,
                    quantity: quantity,
                    category: foodCategory,
                    prepared_time: prepared_time_str,
                    storage: storage,
                    expiry: expiry_time_str,
                    address: address,
                    latitude: latitude,
                    longitude: longitude,
                    donor_email: donor_email
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === "success") {
                    backendSubmitted = true;
                    console.log("Submitted to backend successfully:", data.message);
                }
            }
        } catch (error) {
            console.warn("Backend submission failed (is server running?), saving locally only.", error);
        }

        // Temporarily save donation in local storage (browser)
        const donations = JSON.parse(localStorage.getItem("donations")) || [];
        donations.push(donationData);
        localStorage.setItem("donations", JSON.stringify(donations));

        // Success alert
        if (backendSubmitted) {
            alert("Food donation submitted successfully!");
        } else {
            alert("Food donation saved locally!");
        }

        // Reset form
        donateForm.reset();

        // Hide image preview
        const previewImage = document.getElementById("previewImage");
        if (previewImage) {
            previewImage.style.display = "none";
            previewImage.src = "";
        }

        // Clear location fields
        document.getElementById("latitude").value = "";
        document.getElementById("longitude").value = "";
        
        // Reset map to default location
        const defaultLocation = [9.9252, 78.1198];
        updateSelectedLocation(defaultLocation[0], defaultLocation[1], false, true, 13);

        console.log("Donation saved:", donationData);
    });
};