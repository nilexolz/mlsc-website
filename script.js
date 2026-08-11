const STARTER_ITEMS = [
  {
    id: "starter-1",
    name: "Blue Hydro Flask Bottle",
    category: "ACCESSORIES",
    status: "FOUND",
    location: "Main Library, 2nd Floor",
    date: "2026-08-05",
    description: "Matte blue 32oz bottle with a university sticker on the side. Left near the study pods.",
    contactEmail: "priya@vcet.edu.in"
  },
  {
    id: "starter-2",
    name: "Student ID Card - R. Sharma",
    category: "DOCUMENTS",
    status: "FOUND",
    location: "Cafeteria",
    date: "2026-08-06",
    description: "Found on a table near the vending machines. Handed to the front desk.",
    contactEmail: "madhu@vcet.edu"
  },
  {
    id: "starter-3",
    name: "Wired Earphones (black)",
    category: "ELECTRONICS",
    status: "LOST",
    location: "Lecture Hall B2",
    date: "2026-08-04",
    description: "Left behind after the 10am DBMS lecture. Tangled in a small pouch.",
    contactEmail: "amitkumar24@vcet.edu.in"
  },
  {
    id: "starter-4",
    name: "Grey Hoodie (size M)",
    category: "OTHER",
    status: "LOST",
    location: "Basketball Court",
    date: "2026-08-07",
    description: "Plain grey hoodie, left on the bleachers after evening practice.",
    contactEmail: "priyamahajan@vcet.edu.in"
  },
  {
    id: "starter-5",
    name: "Casio Scientific Calculator",
    category: "ACCESSORIES",
    status: "FOUND",
    location: "Exam Hall 1",
    date: "2026-08-03",
    description: "Fx-991ES model, name 'Rohan' scratched on the back cover.",
    contactEmail: "Vivekkhanna@vcet.edu.in"
  },
  {
    id: "starter-6",
    name: "USB-C Charger Brick",
    category: "ELECTRONICS",
    status: "FOUND",
    location: "Innovation Lab",
    date: "2026-08-06",
    description: "White 20W charger, left plugged into a corner socket overnight.",
    contactEmail: "lab@mlsc.edu"
  }
];

// ---- Storage keys ----
const LS_KEYS = {
  BANNER_DISMISSED: "mlsc_lf_banner_dismissed",
  BOOKMARKS: "mlsc_lf_bookmarks",
  THEME: "mlsc_lf_theme",
  POSTED_ITEMS: "mlsc_lf_posted_items"
};

// ---- State ----
let allItems = [];
let bookmarkedIds = new Set();
let activeCategory = "ALL";
let searchTerm = "";

// ---- DOM refs ----
const listingsGrid = document.getElementById("listingsGrid");
const emptyState = document.getElementById("emptyState");
const listingCountEl = document.getElementById("listingCount");
const searchInput = document.getElementById("searchInput");
const filterTags = document.getElementById("filterTags");

const banner = document.getElementById("banner");
const bannerClose = document.getElementById("bannerClose");

const themeToggle = document.getElementById("themeToggle");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

const postBtn = document.getElementById("postBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const cancelBtn = document.getElementById("cancelBtn");
const postForm = document.getElementById("postForm");
const successMessage = document.getElementById("successMessage");

function init() {
  loadPersistedItems();
  loadBookmarks();
  loadTheme();
  loadBannerState();
  renderListings();

  bannerClose.addEventListener("click", dismissBanner);
  themeToggle.addEventListener("click", toggleTheme);
  hamburger.addEventListener("click", toggleMobileNav);

  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderListings();
  });

  filterTags.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-tag");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    [...filterTags.children].forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    renderListings();
  });

  postBtn.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  });

  postForm.addEventListener("submit", handleFormSubmit);
}


function loadPersistedItems() {
  let posted = [];
  try {
    posted = JSON.parse(localStorage.getItem(LS_KEYS.POSTED_ITEMS)) || [];
  } catch (err) {
    posted = [];
  }
  // Posted items appear first (most recent on top), then starter items.
  allItems = [...posted, ...STARTER_ITEMS];
}

function savePostedItems() {
  const posted = allItems.filter((item) => !item.id.startsWith("starter-"));
  localStorage.setItem(LS_KEYS.POSTED_ITEMS, JSON.stringify(posted));
}

function loadBookmarks() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.BOOKMARKS)) || [];
    bookmarkedIds = new Set(stored);
  } catch (err) {
    bookmarkedIds = new Set();
  }
}

function saveBookmarks() {
  localStorage.setItem(LS_KEYS.BOOKMARKS, JSON.stringify([...bookmarkedIds]));
}

function getFilteredItems() {
  return allItems.filter((item) => {
    const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

function renderListings() {
  const filtered = getFilteredItems();
  listingsGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    filtered.forEach((item) => listingsGrid.appendChild(buildCard(item)));
  }

  listingCountEl.textContent = allItems.length;
}

function buildCard(item) {
  const card = document.createElement("article");
  card.className = "listing-card" + (bookmarkedIds.has(item.id) ? " bookmarked" : "");
  card.dataset.id = item.id;

  const statusClass = item.status === "LOST" ? "status-lost" : "status-found";
  const chipClass = "chip-" + item.category.toLowerCase();
  const isBookmarked = bookmarkedIds.has(item.id);

  card.innerHTML = `
    <div class="card-top">
      <h3 class="card-title">${escapeHtml(item.name)}</h3>
      <span class="status-badge ${statusClass}">${item.status}</span>
    </div>
    <span class="category-chip ${chipClass}">${item.category}</span>
    <div class="card-meta">
      <span>📍 ${escapeHtml(item.location)}</span>
      <span>🗓 ${formatDate(item.date)}</span>
    </div>
    <p class="card-desc">${escapeHtml(item.description)}</p>
    <div class="card-bottom">
      <span class="card-email">✉ ${escapeHtml(item.contactEmail)}</span>
      <button class="bookmark-btn" aria-label="${isBookmarked ? "Remove bookmark" : "Bookmark this listing"}" aria-pressed="${isBookmarked}">
        ${isBookmarked ? "📌" : "📍"}
      </button>
    </div>
  `;

  card.querySelector(".bookmark-btn").addEventListener("click", () => toggleBookmark(item.id));

  return card;
}

function toggleBookmark(id) {
  if (bookmarkedIds.has(id)) {
    bookmarkedIds.delete(id);
  } else {
    bookmarkedIds.add(id);
  }
  saveBookmarks();
  renderListings();
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d)) return isoDate;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}


function loadBannerState() {
  if (localStorage.getItem(LS_KEYS.BANNER_DISMISSED) === "true") {
    banner.hidden = true;
  }
}

function dismissBanner() {
  banner.hidden = true;
  localStorage.setItem(LS_KEYS.BANNER_DISMISSED, "true");
}

function loadTheme() {
  const saved = localStorage.getItem(LS_KEYS.THEME);
  if (saved === "dark") {
    document.body.classList.add("dark");
    themeToggle.setAttribute("aria-pressed", "true");
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  localStorage.setItem(LS_KEYS.THEME, isDark ? "dark" : "light");
}

function toggleMobileNav() {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
}

function openModal() {
  modalOverlay.hidden = false;
  successMessage.hidden = true;
  postForm.hidden = false;
  document.getElementById("itemName").focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  postForm.reset();
  clearAllErrors();
}

const REQUIRED_FIELDS = ["itemName", "category", "status", "location", "date", "description", "contactEmail"];

function clearAllErrors() {
  REQUIRED_FIELDS.forEach((field) => setFieldError(field, ""));
}

function setFieldError(fieldName, message) {
  const input = document.getElementById(fieldName);
  const errorEl = document.getElementById("err-" + fieldName);
  if (message) {
    input.classList.add("invalid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("invalid");
    errorEl.textContent = "";
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(data) {
  let valid = true;

  REQUIRED_FIELDS.forEach((field) => {
    if (!data[field] || !data[field].toString().trim()) {
      setFieldError(field, "This field is required.");
      valid = false;
    } else {
      setFieldError(field, "");
    }
  });

  if (data.contactEmail && data.contactEmail.trim() && !isValidEmail(data.contactEmail.trim())) {
    setFieldError("contactEmail", "Enter a valid email address.");
    valid = false;
  }

  return valid;
}

function handleFormSubmit(e) {
  e.preventDefault();
  clearAllErrors();

  const data = {
    itemName: document.getElementById("itemName").value.trim(),
    category: document.getElementById("category").value,
    status: document.getElementById("status").value,
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value,
    description: document.getElementById("description").value.trim(),
    contactEmail: document.getElementById("contactEmail").value.trim()
  };

  if (!validateForm(data)) return;

  const newItem = {
    id: "item-" + Date.now(),
    name: data.itemName,
    category: data.category,
    status: data.status,
    location: data.location,
    date: data.date,
    description: data.description,
    contactEmail: data.contactEmail
  };

  allItems.unshift(newItem);
  savePostedItems();
  renderListings();

  postForm.hidden = true;
  successMessage.hidden = false;

  setTimeout(() => {
    closeModal();
  }, 1500);
}

document.addEventListener("DOMContentLoaded", init);
