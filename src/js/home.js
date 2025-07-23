
document.addEventListener("DOMContentLoaded", () => {


//============= Populate User Space List Dynamically ===============================

  const spaceTableBody = document.querySelector(".space-list");

  async function loadSpaces() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://the-inner-circle-rad8.onrender.com/spaces", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const spaces = await res.json();
      spaceTableBody.innerHTML = ""; // Clear old data

      for (const space of spaces) {
        // Fetch bubbles count
        const bubbleRes = await fetch(`https://the-inner-circle-rad8.onrender.com/bubbles/${space._id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const bubbles = await bubbleRes.json();

        // Pins count
        const pinsCount = bubbles.filter(b => b.pinned).length;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <th>
            <div class="author-personal-info">
              <a href="#" class="item-figure">
                <img src="images/members/02.JPG" alt="group-selfie" style="width: 100px; height: 100px;">
              </a>
              <div class="item-content">
                <div class="item-title">
                  <a href="space.html?id=${space._id}">${space.name}</a>
                </div>
                <div class="item-designation">${space.description || "No description"}</div>
              </div>
            </div>
          </th>
          <td>
            <div class="author-social-info">
              <ul>
                <li>
                  <div>
                    <h4 class="item-title">Members</h4>
                    <span class="item-number">${space.members.length}</span>
                  </div>
                </li>
                <li>
                  <div>
                    <h4 class="item-title">Pins</h4>
                    <span class="item-number">${pinsCount}</span>
                  </div>
                </li>
                <li>
                  <div>
                    <h4 class="item-title">Bubbles</h4>
                    <span class="item-number">${bubbles.length}</span>
                  </div>
                </li>
              </ul>
            </div>
          </td>
        `;
        spaceTableBody.appendChild(tr);
      }
    } catch (err) {
      console.error("Failed to load spaces:", err);
    }
  }

  loadSpaces();


//=================== Create Space Modal ================================

  const openModalBtn = document.getElementById("openCreateSpace");
  const modal = document.getElementById("createSpaceModal");
  const closeModalBtn = document.getElementById("closeModal");
  const form = document.getElementById("createSpaceForm");

  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();


//====================== Create Space Function ===================================

    const name = document.getElementById("spaceName").value.trim();
    const description = document.getElementById("spaceDesc").value.trim();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://the-inner-circle-rad8.onrender.com/spaces/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create space");

      alert("Space created successfully! 🎉");
      modal.style.display = "none";
      form.reset();

      // Optionally reload space list:
      loadSpaces?.();

    } catch (err) {
      alert(err.message);
    }
  });


//======================== Join a Space Modal ===========================

// Modal Elements
const joinModal = document.getElementById("joinSpaceModal");
const closeJoinBtn = document.getElementById("closeJoinSpaceModal");
const joinSpaceList = document.getElementById("joinSpaceList");



// Attach listener to ANY button or anchor that should open the modal
document.querySelectorAll(".openJoinSpaceModal").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    joinModal.classList.remove("hidden");
    joinSpaceList.innerHTML = `<p class="loading-text">Loading spaces...</p>`;

    try {
      const res = await fetch("https://the-inner-circle-rad8.onrender.com/spaces/all", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const spaces = await res.json();
      joinSpaceList.innerHTML = ""; // Clear loading state

      if (!spaces.length) {
        joinSpaceList.innerHTML = `<p>No public spaces found.</p>`;
        return;
      }

      spaces.forEach((space) => {
        const card = document.createElement("div");
        card.className = "space-card";
        card.innerHTML = `
          <h3>${space.name}</h3>
          <p>${space.description || "No description"}</p>
          <p><strong>Created by:</strong> ${space.createdBy?.name || "Unknown"}</p>
          <button data-id="${space._id}">Join</button>
        `;
        joinSpaceList.appendChild(card);
      });




      // Attach join logic to each "Join" button
      joinSpaceList.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const spaceId = btn.getAttribute("data-id");

          try {
            const res = await fetch(`https://the-inner-circle-rad8.onrender.com/spaces/join/${spaceId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              },
            });

            const result = await res.json();

            if (res.ok) {
              alert(`Joined space: ${result.space.name}`);
              joinModal.classList.add("hidden");
            } else {
              alert(result.message || "Could not join space");
            }
          } catch (err) {
            console.error("Join failed:", err);
            alert("Something went wrong");
          }
        });
      });

    } catch (err) {
      console.error("Error loading spaces:", err);
      joinSpaceList.innerHTML = `<p>Error fetching spaces</p>`;
    }
  });
});




// Close modal
closeJoinBtn.addEventListener("click", () => {
  joinModal.classList.add("hidden");
});








  
});
