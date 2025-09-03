

document.addEventListener("DOMContentLoaded", async () => {



    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user-id");
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");



    // Validate login status
    if (!userId || !token) {
        alert("You must be logged in to view this page.");

        window.location.href = "login.html";
        return;
    }

    

    try {
        const response = await fetch("https://the-inner-circle-rad8.onrender.com/profile/${userId}", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status} - Failed to fetch profile data.`);

        const userData = await response.json();




        // Update profile details dynamically
        document.getElementById("profile-avatar").src =
            userData.avatar || "/images/default-avatar.png";


        document.getElementById("profile-username").textContent =
            userData.name || userObj.name || "Unknown User";


        document.getElementById("profile-bio").textContent =
            userData.bio?.trim() || "No bio available yet.";


    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Error loading your profile. Please try again later.");
    }




});


// Optional: Edit button behavior

// document.getElementById("edit-profile-btn").addEventListener("click", () => {
//     window.location.href = "edit-profile.html";

// });




