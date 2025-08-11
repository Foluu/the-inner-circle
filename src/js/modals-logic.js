

// ------------------- Mobile Menu Toggle ------------------- //

const mobileMenuBtn = document.getElementById("mobileMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const closeMobileMenu = document.getElementById("mobileMenuClose");
const mobileBackdrop = document.getElementById("mobileMenuBackdrop");

if (mobileMenuBtn && mobileMenu && closeMobileMenu && mobileBackdrop) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.add("menu-visible");
    mobileBackdrop.classList.remove("hidden");
  });

  closeMobileMenu.addEventListener("click", () => {
    mobileMenu.classList.remove("menu-visible");
    mobileBackdrop.classList.add("hidden");
  });

  mobileBackdrop.addEventListener("click", () => {
    mobileMenu.classList.remove("menu-visible");
    mobileBackdrop.classList.add("hidden");
  });
}

// ------------------- Reusable Modal Functions ------------------- //

// Show modal by ID
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

// Close modal by ID
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

// Attach close logic to all modals with .close-btn
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.dataset.close;
    if (modalId) closeModal(modalId);
  });
});



 // ------------------- Request Sent Modal ------------------- //

    const requestSentModal = document.getElementById("modal-request-sent");

    function showRequestSentModal() {
      openModal("modal-request-sent");

      // Add event listener to close modal when clicking outside
      requestSentModal.addEventListener('click', (e) => {
        if (e.target === requestSentModal) {
          requestSentModal.classList.add('hidden');
        }
      });
    }


// ------------------- Pending Requests Modal ------------------- //

async function showPendingRequestsModal(spaceId) {
  const modal = document.getElementById("modal-pending-requests");
  const list = document.getElementById("pending-requests-list");

  if (!modal || !list) return;

  list.innerHTML = `<li>Loading...</li>`;

  try {
    const res = await fetch(`/spaces/${spaceId}/requests`);
    const data = await res.json();

    if (!Array.isArray(data) || !data.length) {
      list.innerHTML = `<li>No pending requests.</li>`;
      return;
    }

    list.innerHTML = "";

    data.forEach(user => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="request-user">${user.name} (${user.email})</span>
        <div>
          <button class="approve-btn" data-id="${user._id}">Approve</button>
          <button class="reject-btn" data-id="${user._id}">Reject</button>
        </div>
      `;
      list.appendChild(li);
    });

    // Handle Approve / Reject Actions
    list.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await fetch(`/spaces/${spaceId}/requests/${btn.dataset.id}/approve`, { method: "POST" });
        showPendingRequestsModal(spaceId); // Refresh list after approval
      });
    });

    list.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await fetch(`/spaces/${spaceId}/requests/${btn.dataset.id}/reject`, { method: "DELETE" });
        showPendingRequestsModal(spaceId); // Refresh list after rejection
      });
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = `<li>Error loading requests.</li>`;
  }

  openModal("modal-pending-requests"); // using reusable open function
}

// ------------------- Request Approved Modal ------------------- //

// Button to enter approved space
const goToSpaceBtn = document.getElementById("goToSpaceBtn");
if (goToSpaceBtn) {
  goToSpaceBtn.addEventListener("click", () => {
    // Replace with actual space navigation logic
    // window.location.href = `/space.html?id=${approvedSpaceId}`;
    closeModal("modal-request-approved"); // Ensure correct modal ID used
  });
}
