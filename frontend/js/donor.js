// ======================================
// LOAD DONOR DONATIONS
// ======================================

async function loadDonorDonations(){

    try{

        const response = await fetch("http://127.0.0.1:5000/donations");

        const result = await response.json();

        const container = document.getElementById("donorContainer");

        container.innerHTML = "";

        // Dynamic donor email from localStorage with fallback
        const donorEmail = localStorage.getItem("email") || "donor@test.com";

        const myDonations = result.data.filter(
            donation => donation.donor_email === donorEmail
        );

        if(myDonations.length === 0){

            container.innerHTML = "<h2>No Donations Found</h2>";

            return;

        }

        myDonations.forEach(donation =>{

            container.innerHTML += `

<div class="card">

<h2>${donation.food_name}</h2>

<p><b>Category :</b> ${donation.category}</p>

<p><b>Quantity :</b> ${donation.quantity}</p>

<p><b>Prepared Time :</b> ${donation.prepared_time}</p>

<p><b>Expiry :</b> ${donation.expiry}</p>

<p><b>Storage :</b> ${donation.storage}</p>

<p><b>Address :</b> ${donation.address}</p>

<div class="ai-box">

<h3>🤖 AI Analysis</h3>

<p><b>Freshness :</b> ${donation.freshness}%</p>

<p><b>AI Result :</b> ${donation.ai_result}</p>

<p><b>Priority :</b> ${donation.priority}</p>

<p><b>Recommended NGO :</b> ${donation.recommended_ngo}</p>

<p><b>Recommendation :</b> ${donation.recommendation}</p>

</div>

<p>

<b>Status :</b>

<span class="status ${donation.status.toLowerCase()}">

${donation.status}

</span>

</p>

<div class="timeline">

<h3>📌 Donation Timeline</h3>

<p><b>Created :</b> ${donation.created_at}</p>

<p><b>Accepted :</b> ${donation.accepted_at || "-"}</p>

<p><b>Picked :</b> ${donation.picked_at || "-"}</p>

<p><b>Delivered :</b> ${donation.delivered_at || "-"}</p>

</div>

</div>

`;

        });

    }

    catch(error){

        console.log(error);

        alert("Cannot connect to backend.");

    }

}

loadDonorDonations();