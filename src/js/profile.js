

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
            // Check if the avatar path starts with "/uploads"
            if (userData.avatar && userData.avatar.startsWith("/uploads")) {
                avatarEl.src = `https://the-inner-circle-rad8.onrender.com${userData.avatar}`;
            } else {
                avatarEl.src = "/images/default-avatar.png";
            }
        } else {
            console.warn("Element with ID 'profile-avatar' not found.");
        }


    // User Bio Details

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


//================== Edit Profile Modal and Form Handling ========================================================


// Elements
const editBtn = document.querySelector(".edit-btn");
const modal = document.getElementById("edit-modal");
const closeModal = document.getElementById("close-modal");
const editForm = document.getElementById("edit-profile-form");


// Open modal
editBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  document.getElementById("edit-username").value = localStorage.getItem("user-name") || "";
  document.getElementById("edit-bio").value = document.getElementById("profile-bio").textContent.trim();
});


// Close modal
closeModal.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });



// Handle form submission
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();


  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user-id");
  const apiUrl = `https://the-inner-circle-rad8.onrender.com/profile/${encodeURIComponent(userId)}`;

  const formData = new FormData();
  formData.append("name", document.getElementById("edit-username").value.trim());
  formData.append("bio", document.getElementById("edit-bio").value.trim());
  const avatarFile = document.getElementById("edit-avatar").files[0];
  if (avatarFile) formData.append("avatar", avatarFile);



  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} - Failed to update profile.`);

    const updatedData = await response.json();
    alert("Profile updated successfully!");


    // Update DOM
   const avatarEl = document.getElementById("profile-avatar");
      if (avatarEl) {
          avatarEl.src =
              updatedData.avatar && updatedData.avatar.startsWith("/uploads")
                  ? `https://the-inner-circle-rad8.onrender.com${updatedData.avatar}`
                  : "/images/default-avatar.png";
      }

      const usernameEl = document.getElementById("profile-username");
      if (usernameEl) usernameEl.textContent = updatedData.name;

      const bioEl = document.getElementById("profile-bio");
      if (bioEl) bioEl.textContent = updatedData.bio || "No bio available yet.";

      // Update localStorage
      localStorage.setItem("user-name", updatedData.name);
      localStorage.setItem("user", JSON.stringify(updatedData));

      // Clear file input and hide modal
      document.getElementById("edit-avatar").value = "";
      modal.classList.add("hidden");


  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile. Please try again.");
  }



});


// ================== Fetch and Display Spaces Where User is Admin =====================

        async function fetchAdminSpaces() {
        const token = localStorage.getItem("token");
        const spacesContainer = document.getElementById("admin-spaces");

        if (!spacesContainer) {
            console.warn("No container found for admin spaces.");
            return;
        }


        try {
            const res = await fetch("https://the-inner-circle-rad8.onrender.com/spaces/user-admin", {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status} - Failed to fetch admin spaces.`);

            const spaces = await res.json();
            console.log("Fetched admin spaces:", spaces);


            // Clear placeholder
            spacesContainer.innerHTML = "";

            if (!spaces || spaces.length === 0) {
                spacesContainer.innerHTML = `<p class="text-gray-500">You don't manage any spaces yet.</p>`;
                return;
            }


            // Populate spaces dynamically
            spaces.forEach(space => {
                const spaceCard = document.createElement("div");
                spaceCard.classList.add("space-card");


                // Fix avatar path handling like we did for profile avatar
                let avatarUrl = "images/icn.png"; // Default avatar
                if (space.avatar) {
                    if (space.avatar.startsWith("/uploads")) {
                        avatarUrl = `https://the-inner-circle-rad8.onrender.com${space.avatar}`;
                    } else if (space.avatar.startsWith("http")) {
                        avatarUrl = space.avatar;
                    }
                }



                spaceCard.innerHTML = `
                    <div class="space-avatar">
                        <img src="${avatarUrl}" 
                            style="width: 60px; height: 60px; object-fit: cover;">
                    </div>
                    <div class="space-info">
                        <h3>${space.name}</h3>
                        <p>${space.description || "No description provided."}</p>
                        <div class="space-meta">
                            <span>${space.members.length || 0} members</span> • 
                            <span>Created at ${space.createdAt}</span>
                        </div>
                    </div>
                `;
                spacesContainer.appendChild(spaceCard);
            });


        } catch (error) {
            console.error("Error fetching admin spaces:", error);
            spacesContainer.innerHTML
                = `<p class="text-red-500">Error loading your spaces. Please try again later.</p>`;
        }
    }


        // Call after DOM is ready
        fetchAdminSpaces();






});





