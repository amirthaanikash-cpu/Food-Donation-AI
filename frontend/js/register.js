const form = document.getElementById("registerForm");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.querySelector('input[name="role"]:checked').value;

    const response = await fetch("http://127.0.0.1:5000/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            name:name,
            email:email,
            password:password,
            role:role
        })

    });

    const data = await response.json();

    alert(data.message);

});
