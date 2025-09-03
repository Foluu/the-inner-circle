

document.addEventListener("DOMContentLoaded", async () => {


    const userId = localStorage.getItem("user-id");
    const token = localStorage.getItem("token");  // JWT for authorization


    if (!userId || !token) {
        alert("You must be logged in to view this page.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`/profile/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch profile data.");
        }

        const userData = await response.json();

        // Populate profile section dynamically
        document.getElementById("profile-avatar").src = userData.avatar || "/images/default-avatar.png";
        document.getElementById("profile-username").textContent = userData.username || userData.name || "Unknown User";
        document.getElementById("profile-bio").textContent = userData.bio || "No bio available yet.";


    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("There was an error loading your profile. Try again later.");
    }



});




// Optional: Edit button behavior

// document.getElementById("edit-profile-btn").addEventListener("click", () => {
//     window.location.href = "edit-profile.html";

// });




