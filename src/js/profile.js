

document.addEventListener("DOMContentLoaded", async () => {



    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user-id");
    const userName = localStorage.getItem("user-name");
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");



    // Validate login status
    if (!userId || !token) {
        alert("You must be logged in to view this page.");

        window.location.href = "login.html";
        return;
    }

    console.log("Log in validated- Username:", userName);

      document.getElementById("profile-username").textContent =
            userName || "Unknown User";



    




});


// Optional: Edit button behavior

// document.getElementById("edit-profile-btn").addEventListener("click", () => {
//     window.location.href = "edit-profile.html";

// });




