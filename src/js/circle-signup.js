

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");


    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch('http://localhost:3000/auth/signup', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });


        const data = await res.json();


        if (!res.ok) {
          throw new Error(data.message || "Signup failed bruh..");
        }


        alert("🎉 Signup successful!  Welcome to the Inner circle!");
        window.location.href = "login.html"; 

      } catch (err) {
        alert(err.message);
      }
    });



  });