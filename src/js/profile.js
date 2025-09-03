

document.addEventListener("DOMContentLoaded", async () => {



    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user-id");
    const userName = localStorage.getItem("user-name");
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");



//================== Validate login status and insert User name ========================================================

    if (!userId || !token) {
        alert("You must be logged in to view this page.");

        window.location.href = "login.html";
        return;
    }

    console.log("Log in validated- Username:", userName);

      document.getElementById("profile-username").textContent =
            userName || "Unknown User";



//================== Fetch and display rest of profile data  ========================================================

            try {
    if (!userId || !token) {
        throw new Error("Missing user credentials. Please log in again.");
    }

    const apiUrl = `https://the-inner-circle-rad8.onrender.com/profile/${encodeURIComponent(userId)}`;
    console.log("Fetching profile from:", apiUrl);

    const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Profile not found. The user ID might be invalid.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const userData = await response.json();
    console.log("Fetched user data:", userData);

    // Update profile details dynamically
    const avatarEl = document.getElementById("profile-avatar");
    if (avatarEl) {
        avatarEl.src = userData.avatar || "/images/default-avatar.png";
    } else {
        console.warn("Element with ID 'profile-avatar' not found.");
    }

    const bioEl = document.getElementById("profile-bio");
    if (bioEl) {
        bioEl.textContent = userData.bio?.trim() || "No bio available yet.";
    } else {
        console.warn("Element with ID 'profile-bio' not found.");
    }

} catch (error) {
    console.error("Error fetching profile:", error);
    alert("Error loading your profile. Please try again later.");
}


    

});


// Optional: Edit button behavior

// document.getElementById("edit-profile-btn").addEventListener("click", () => {
//     window.location.href = "edit-profile.html";

// });




