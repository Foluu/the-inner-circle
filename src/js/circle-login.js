
  document.addEventListener("DOMContentLoaded", () => {
    const isLocalHost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const SERVER_URL = isLocalHost
      ? (location.port === "3000" ? location.origin : "http://localhost:3000")
      : "https://the-inner-circle-rad8.onrender.com";

    const form = document.getElementById("contactform");


    form.addEventListener("submit", async (e) => {
      e.preventDefault();


      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;



      try {
        const res = await fetch(`${SERVER_URL}/auth/login`, {
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

        Toast.success("Welcome, Inner Circle Member! 🎉");
        
        // Redirect to homepage
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1200);

      } catch (err) {
        Toast.error(err.message);
      }
    });

    
  });

