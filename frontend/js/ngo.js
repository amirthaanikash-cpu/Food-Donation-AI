// ======================================
// Load All Donations
// ======================================

async function loadDonations() {

    try {

        const response = await fetch("http://127.0.0.1:5000/donations");

        const result = await response.json();

        const container = document.getElementById("donationContainer");

        container.innerHTML = "";

        if (result.data.length === 0) {

            container.innerHTML = `
                <h2>No Food Donations Available</h2>
            `;

            return;

        }

     result.data
.filter(donation => donation.status === "Waiting")
.forEach(donation => {
container.innerHTML += `

<div class="card">

    <h2>${donation.food_name}</h2>

    <p><b>Category :</b> ${donation.category}</p>

    <p><b>Quantity :</b> ${donation.quantity}</p>

    <p><b>Prepared Time :</b> ${donation.prepared_time}</p>

    <p><b>Expiry Time :</b> ${donation.expiry}</p>

    <p><b>Storage :</b> ${donation.storage}</p>

    <p><b>Address :</b> ${donation.address}</p>

    <p><b>Freshness :</b> ${donation.freshness}%</p>

    <p><b>AI Result :</b> ${donation.ai_result}</p>

    <p><b>Priority :</b> ${donation.priority}</p>

    <p><b>Recommended NGO :</b> ${donation.recommended_ngo}</p>

    <p><b>Distance :</b> ${donation.distance}</p>

    <p><b>AI Recommendation :</b> ${donation.recommendation}</p>

    <p>
        <b>Status :</b>
        <span class="status">
            ${donation.status}
        </span>
    </p>

    <button
        class="accept-btn"
        onclick="acceptDonation('${donation._id}')">

        Accept Donation

    </button>

</div>

`;

        });

    }

    catch(error){

        console.log(error);

        alert("Cannot connect to Flask server.");

    }

}

loadDonations();


// ======================================
// Accept Button (Temporary)
// ======================================

async function acceptDonation(id) {

    try {

        const ngoName = localStorage.getItem("name") || "Helping Hands NGO";
        const response = await fetch(`http://127.0.0.1:5000/accept/${id}`, {

            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ngo: ngoName })

        });

        const data = await response.json();

        alert(data.message);

        // Reload all donation cards
        loadDonations();
        if (window.updateDashboardStats) window.updateDashboardStats();

    }

    catch (error) {

        console.log(error);

        alert("Cannot connect to backend.");

    }

}