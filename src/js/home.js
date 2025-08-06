
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
                <img src="images/icn.png" alt="group-selfie" style="width: 100px; height: 100px;">
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

      // Elements for Create Space Modal
      const createModal = document.getElementById('createSpaceModal');
      const openCreateBtn = document.getElementById('openCreateModal'); // Button to trigger modal (you'll need this in your HTML)
      const closeCreateBtn = document.getElementById('closeCreateModal');
      const createForm = document.getElementById('createSpaceForm');

      // Open modal handler
      if (openCreateBtn) {
        openCreateBtn.addEventListener('click', () => {
          createModal.classList.remove('hidden'); // Show modal
        });
      }

      // Close modal handler
      closeCreateBtn.addEventListener('click', () => {
        createModal.classList.add('hidden'); // Hide modal
      });

      // Optional: Close when clicking outside modal content
      createModal.addEventListener('click', (e) => {
        if (e.target === createModal) {
          createModal.classList.add('hidden');
        }
      });

      // Form submission
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('spaceName').value.trim();
        const desc = document.getElementById('spaceDesc').value.trim();

        // TODO: Replace this with your backend call
        try {
          const res = await fetch("https://the-inner-circle-rad8.onrender.com/spaces/create", {
            method: 'POST',
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ name, description: desc })
          });

          if (!res.ok) throw new Error('Failed to create space.');

          // Success! Close modal and optionally refresh space list
          createModal.classList.add('hidden');
          createForm.reset();
          alert('Space created successfully!'); // Replace this with custom toast/modal
        } catch (err) {
          console.error(err);
          alert('Error: ' + err.message);
        }
      });



//======================== Join a Space Modal ===========================

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

            showRequestSentModal();

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

closeJoinBtn?.addEventListener("click", () => {
  joinModal.classList.add("hidden");
});





//=================== Pending Requests Modal ===========================



const viewReqBtn = document.getElementById("view-requests-btn");

viewReqBtn?.addEventListener("click", async () => {
  const currentSpaceId = localStorage.getItem("currentSpaceId"); //  Get from storage or your app state

  if (!currentSpaceId) {
    alert("No space selected.");
    return;
  }

  await showPendingRequestsModal(currentSpaceId);
});

async function showPendingRequestsModal(spaceId) {
  try {
    const res = await fetch(`/api/spaces/${spaceId}/requests`);
    if (!res.ok) throw new Error("Failed to fetch pending requests");

    const requests = await res.json();

    const listContainer = document.getElementById("pending-requests-list");
    listContainer.innerHTML = ""; // Clear previous list

    if (requests.length === 0) {
      listContainer.innerHTML = `<li>No pending requests</li>`;
    } else {
      requests.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = `${user.fullName || user.username || user.userId}`;
        listContainer.appendChild(li);
      });
    }

    document.getElementById("modal-pending-requests")?.classList.remove("hidden");

  } catch (err) {
    console.error(err);
    alert("Could not load pending requests.");
  }
}

// Close logic already exists:
document.getElementById("close-pending-requests")?.addEventListener("click", () => {
  document.getElementById("modal-pending-requests")?.classList.add("hidden");
});



//================== Request Approved Modal (Triggered externally) ==================



// openModal("requestApprovedModal");






  
});
