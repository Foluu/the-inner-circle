
document.addEventListener("DOMContentLoaded", () => {


//================== Validate login status and insert User name ========================================================
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user-id");
    const userName = localStorage.getItem("user-name");
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");

    if (!userId || !token) {
        Toast.warning("You must be logged in to view this page.");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
        return;
    }

    document.getElementById("user--name").textContent =   userName || "Unknown User";

    document.querySelector(".header-search-box img").src =  userObj.avatar || "images/default-avatar.png";



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
          Toast.success('Space created successfully!');
          loadSpaces();
        } catch (err) {
          console.error(err);
          Toast.error('Error: ' + err.message);
        }
      });




//================================= Join a Space Modal ===================================


          const joinModal = document.getElementById("joinSpaceModal");
          const closeJoinBtn = document.getElementById("closeJoinSpaceModal");
          const joinSpaceList = document.getElementById("joinSpaceList");

          // Attach listener to ALL buttons that open the Join modal

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
                    <button data-id="${space._id}" class="join-btn">Request to Join</button>
                  `;


                  joinSpaceList.appendChild(card);

                });




                //  Join logic

                joinSpaceList.querySelectorAll(".join-btn").forEach((btn) => {
                  btn.addEventListener("click", async () => {
                    const spaceId = btn.getAttribute("data-id");
                    btn.disabled = true;
                    btn.textContent = "Requesting...";

                    try {
                      const res = await fetch(`https://the-inner-circle-rad8.onrender.com/spaces/${spaceId}/request-join`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${localStorage.getItem("token")}`
                        },
                      });

                      const result = await res.json();

                      if (res.ok) {
                        showRequestSentModal();

                        console.log("Join request sent successfully:", result);

                        joinModal.classList.add("hidden");

                      } else {
                        Toast.error(result.message || "Could not send join request.");
                      }
                    } catch (err) {
                      console.error("Join request failed:", err);
                      Toast.error("Something went wrong. Try again.");
                    } finally {
                      btn.disabled = false;
                      btn.textContent = "Request to Join";
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









//=================== Pending Requests Modal Logic ===========================

document.getElementById("openRequestsModalBtn").addEventListener("click", async (e) => {
  e.preventDefault();



  const modal = document.getElementById("pendingRequestsModal");
  const container = document.getElementById("adminSpacesList");
  container.innerHTML = "<p>Loading requests...</p>";
  modal.style.display = "flex"; // flex for centering


  try {
    const token = localStorage.getItem("token"); 
    const res = await fetch("https://the-inner-circle-rad8.onrender.com/spaces/user-admin", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    


    if (!data.length) {
      container.innerHTML = "<p>No pending requests found.</p>";
      return;
    }

    console.log("Pending Requests Data:", data);

    // Render spaces & requests
        container.innerHTML = data.map(space => `
        <div class="space-requests" data-space-id="${space._id}">
          <h3>${space.name} (${space.joinRequests.length} pending)</h3>
          <ul class="requests-list">
            ${space.joinRequests.map(user => `
              <li id="user-${user._id}-${space._id}" data-user-id="${user._id}">
                <span class="request-user">${user.name}</span>
                <button class="approve-btn">✅</button>
                <button class="reject-btn">❌</button>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('');



      container.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const li = btn.closest('li');
          const spaceId = btn.closest('.space-requests').dataset.spaceId;
          const userId = li.dataset.userId;
          handleRequest(spaceId, userId, true);
        });
      });

      container.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const li = btn.closest('li');
          const spaceId = btn.closest('.space-requests').dataset.spaceId;
          const userId = li.dataset.userId;
          handleRequest(spaceId, userId, false);
        });
      });




  } catch (err) {
    container.innerHTML = "<p>Something went wrong fetching requests.</p>";
    console.error(err);
  }
  

});


  // Handle approval/rejection

      async function handleRequest(spaceId, userId, approve) {
        const token = localStorage.getItem("token");
        const endpoint = `https://the-inner-circle-rad8.onrender.com/spaces/${spaceId}/${approve ? "approve-request" : "reject-request"}/${userId}`;

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            }

          });


          if (res.ok) {
            document.getElementById(`user-${userId}-${spaceId}`).remove();
            Toast.success(approve ? "Request approved!" : "Request rejected!");
          } else {
            Toast.error("Failed to process request.");
          }
        } catch (err) {
          console.error(err);
          Toast.error("Error handling request.");
        }
      }

    

// Close modal
document.getElementById("closePendingRequestsModal").addEventListener("click", () => {

  document.getElementById("pendingRequestsModal").style.display = "none";
});




















//================== Request Approved Modal (Triggered externally) ==================



  
});
