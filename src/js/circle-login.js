
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactform");


    form.addEventListener("submit", async (e) => {
      e.preventDefault();


      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;



      try {
        const res = await fetch('http://localhost:3000/auth/login', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed bruh..");
        }

        // Save token and redirect
        localStorage.setItem("token", data.token);

        localStorage.setItem("user", JSON.stringify(data.user));

      //  individually 
          localStorage.setItem("user-id",  data.user.id);
          localStorage.setItem("user-name", data.user.name);

        alert("Welcome, Inner Circle Member! 🎉");
        
        // Redirect to homepage
        window.location.href = "home.html";

      } catch (err) {
        alert(err.message);
      }
    });

    
  });

