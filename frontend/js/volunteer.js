// ======================================
// Load Accepted Donations
// ======================================

async function loadVolunteerTasks() {

    try {

        const response = await fetch("http://127.0.0.1:5000/accepted-donations");

        const result = await response.json();

        const container = document.getElementById("volunteerContainer");

        const taskCount = document.getElementById("taskCount");

        container.innerHTML = "";

        taskCount.innerHTML = result.data.length;

        if(result.data.length === 0){

            container.innerHTML = `
                <h2>No Accepted Donations</h2>
            `;

            return;

        }

        result.data.forEach(donation=>{

            container.innerHTML += `

            <div class="card">

                <h2>${donation.food_name}</h2>

                <p><b>Category :</b> ${donation.category}</p>

                <p><b>Quantity :</b> ${donation.quantity}</p>

                <p><b>Prepared Time :</b> ${donation.prepared_time}</p>

                <p><b>Expiry :</b> ${donation.expiry}</p>

                <p><b>Storage :</b> ${donation.storage}</p>

                <p><b>Address :</b> ${donation.address}</p>

                <p><b>NGO :</b> ${donation.recommended_ngo}</p>

                <p><b>Status :</b>
                    <span class="status">${donation.status}</span>
                </p>

                ${
                    donation.status==="Accepted"

                    ?

                    `<button class="pick-btn"
                    onclick="pickupFood('${donation._id}')">
                    Pick Up Food
                    </button>`

                    :

                    ""

                }

                ${
                    donation.status==="Picked"

                    ?

                    `<button class="deliver-btn"
                    onclick="deliverFood('${donation._id}')">
                    Deliver Food
                    </button>`

                    :

                    ""

                }

            </div>

            `;

        });

    }

    catch(error){

        console.log(error);

        alert("Cannot connect to backend.");

    }

}

loadVolunteerTasks();


// ======================================
// Pickup
// ======================================

async function pickupFood(id){

    const volunteerName = localStorage.getItem("name") || "Arun Kumar";
    const response = await fetch(

        `http://127.0.0.1:5000/pickup/${id}`,

        {

            method:"PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ volunteer: volunteerName })

        }

    );

    const data = await response.json();

    alert(data.message);

    loadVolunteerTasks();
    if (window.updateDashboardStats) window.updateDashboardStats();

}


// ======================================
// Deliver
// ======================================

async function deliverFood(id){

    const response = await fetch(

        `http://127.0.0.1:5000/deliver/${id}`,

        {

            method:"PUT"

        }

    );

    const data = await response.json();

    alert(data.message);

    loadVolunteerTasks();
    if (window.updateDashboardStats) window.updateDashboardStats();

}