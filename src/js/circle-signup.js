

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");


    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch('https://the-inner-circle-rad8.onrender.com/auth/signup', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });


        const data = await res.json();


        if (!res.ok) {
          throw new Error(data.message || "Signup failed bruh..");
        }


        Toast.success("🎉 Signup successful! Welcome to the Inner Circle!");
        setTimeout(() => {
          window.location.href = "login.html"; 
        }, 1200);

      } catch (err) {
        Toast.error(err.message);
      }
    });



  });