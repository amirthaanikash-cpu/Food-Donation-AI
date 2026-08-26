let statusChart = null;
let categoryChart = null;
// =======================================
// LOAD ADMIN DASHBOARD
// =======================================

async function loadDashboard(){

    try{

        const response = await fetch(
            "http://127.0.0.1:5000/admin/dashboard"
        );

        const data = await response.json();
loadStatusChart(data);

loadCategoryChart(data);
        // Statistics

        document.getElementById("users").innerHTML =
            data.total_users;

        document.getElementById("donations").innerHTML =
            data.total_donations;

        document.getElementById("waiting").innerHTML =
            data.waiting;

        document.getElementById("accepted").innerHTML =
            data.accepted;

        document.getElementById("picked").innerHTML =
            data.picked;

        document.getElementById("delivered").innerHTML =
            data.delivered;

        // Recent Donations

        const table =
            document.getElementById("recentData");

        table.innerHTML = "";

        data.recent.forEach(item => {

            table.innerHTML += `

            <tr>

                <td>${item.food_name}</td>

                <td>${item.category}</td>

                <td>${item.freshness}%</td>

                <td>

                    <span class="badge ${item.ai_result.toLowerCase()}">

                        ${item.ai_result}

                    </span>

                </td>

                <td>${item.recommendation}</td>

                <td>${item.status}</td>

                <td>${item.donor_email}</td>

            </tr>

            `;

        });

    }

    catch(error){

        console.log(error);

        alert("Unable to load dashboard.");

    }

}

loadDashboard();
// =======================================
// DONATION STATUS CHART
// =======================================

function loadStatusChart(data){
if(statusChart){
    statusChart.destroy();
}
    statusChart = new Chart(document.getElementById("statusChart"),{

        type:"pie",

        data:{

            labels:[
                "Waiting",
                "Accepted",
                "Picked",
                "Delivered"
            ],

            datasets:[{

                data:[

                    data.waiting,

                    data.accepted,

                    data.picked,

                    data.delivered

                ]

            }]

        }

    });

}

// =======================================
// FOOD CATEGORY CHART
// =======================================

function loadCategoryChart(data){

    new Chart(document.getElementById("categoryChart"),{

        type:"doughnut",

        data:{

            labels:[
                "Veg",
                "Non-Veg"
            ],

            datasets:[{

                data:[

                    data.veg,

                    data.nonveg

                ]

            }]

        }

    });

}