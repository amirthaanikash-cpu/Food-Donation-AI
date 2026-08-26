// ======================================
// CHECK LOGIN
// ======================================

const role = localStorage.getItem("role");

if (!role) {

    alert("Please login first.");

    window.location.href = "login.html";

}

// ======================================
// CHECK ROLE
// ======================================

function checkRole(expectedRole){

    const currentRole = localStorage.getItem("role");

    if(currentRole !== expectedRole){

        alert("Access Denied!");

        window.location.href = "login.html";

    }

}

// ======================================
// LOGOUT
// ======================================

function logout(){

    localStorage.clear();

    alert("Logged out successfully.");

    window.location.href = "login.html";

}
// =======================================
// CHECK LOGIN
// =======================================

function checkLogin() {

    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (!name || !role) {

        alert("Please login first.");

        window.location.href = "login.html";
    }

}

// =======================================
// CHECK ROLE
// =======================================

function checkRole(expectedRole) {

    checkLogin();

    const role = localStorage.getItem("role");

    if (role !== expectedRole) {

        alert("Access Denied!");

        window.location.href = "login.html";
    }

}