const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.querySelector('input[name="role"]:checked').value;

    try {

        const response = await fetch("http://127.0.0.1:5000/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password,
                role: role
            })

        });

        const data = await response.json();

        // ======= PASTE THE NEW CODE HERE =======
        if (data.status === "success") {

            localStorage.setItem("name", data.name);
            localStorage.setItem("role", data.role);
            localStorage.setItem("email", email);

            alert("Welcome " + data.name);

            if (data.role === "donor" || data.role === "ngo" || data.role === "volunteer") {
                window.location.href = "dashboard.html";
            }

            else if (data.role === "admin") {
                window.location.href = "admin.html";
            }

        }
        // ======= END OF NEW CODE =======

        else {

            alert(data.message);

        }

    } catch (error) {

        alert("Cannot connect to server.");

        console.log(error);

    }

});