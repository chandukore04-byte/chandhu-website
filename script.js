const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "campusFindItems";

const sampleItems = [
  {
    id: 1,
    status: "Found",
    name: "Wireless Headphones",
    category: "Electronics",
    location: "College Library",
    description: "Black headphones found near the reading area.",
    image: "",
    owner: "Student Helper",
    contact: "helper@example.com"
  },
  {
    id: 2,
    status: "Lost",
    name: "College ID Card",
    category: "ID Cards",
    location: "Main Canteen",
    description: "Student ID card lost during lunch break.",
    image: "",
    owner: "A Student",
    contact: "student@example.com"
  },
  {
    id: 3,
    status: "Found",
    name: "Blue Notebook",
    category: "Books & Notes",
    location: "Room 204",
    description: "Notebook found after the morning lecture.",
    image: "",
    owner: "Class Representative",
    contact: "cr@example.com"
  }
];

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Could not load saved items:", error);
  }

  return sampleItems;
}

let items = loadItems();
let selectedItem = null;

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    alert("Browser storage is full or unavailable. Your changes may not persist.");
    return false;
  }
}

function updateStats() {
  $("totalItems").textContent = items.length;
  $("lostCount").textContent =
    items.filter(item => item.status === "Lost").length;
  $("foundCount").textContent =
    items.filter(item => item.status === "Found").length;
}

function renderItems() {
  const searchText = $("search").value.toLowerCase().trim();
  const category = $("categoryFilter").value;
  const status = $("statusFilter").value;

  const filtered = items.filter(item => {
    const searchable = [
      item.name,
      item.category,
      item.location,
      item.description
    ].join(" ").toLowerCase();

    return searchable.includes(searchText) &&
      (category === "All" || item.category === category) &&
      (status === "All" || item.status === status);
  });

  const grid = $("itemGrid");
  grid.replaceChildren();

  $("emptyMessage").hidden = filtered.length !== 0;

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "item-card";

    const imageBox = document.createElement("div");
    imageBox.className = "item-image";

    if (item.image) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.name;
      image.loading = "lazy";

      image.onerror = () => {
        imageBox.replaceChildren();
        imageBox.textContent = "📦";
      };

      imageBox.appendChild(image);
    } else {
      const icons = {
        Electronics: "📱",
        "ID Cards": "🪪",
        "Books & Notes": "📚",
        Bags: "🎒",
        Keys: "🔑",
        Other: "📦"
      };

      imageBox.textContent = icons[item.category] || "📦";
    }

    const body = document.createElement("div");
    body.className = "item-body";

    const pills = document.createElement("div");
    pills.className = "pills";

    const statusPill = document.createElement("span");
    statusPill.className =
      "pill" + (item.status === "Lost" ? " lost" : "");
    statusPill.textContent = item.status;

    const categoryPill = document.createElement("span");
    categoryPill.className = "pill";
    categoryPill.textContent = item.category;

    pills.append(statusPill, categoryPill);

    const title = document.createElement("h3");
    title.textContent = item.name;

    const location = document.createElement("p");
    location.textContent = "📍 " + item.location;

    const description = document.createElement("p");
    description.textContent = item.description;

    const button = document.createElement("button");
    button.className = "btn primary";
    button.type = "button";
    button.textContent =
      item.status === "Lost" ? "I Found This Item" : "Claim This Item";

    button.addEventListener("click", () => openClaim(item.id));

    body.append(pills, title, location, description, button);
    card.append(imageBox, body);
    grid.appendChild(card);
  });

  updateStats();
}

$("search").addEventListener("input", renderItems);
$("categoryFilter").addEventListener("change", renderItems);
$("statusFilter").addEventListener("change", renderItems);

$("postForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const item = {
    id: Date.now(),
    status: $("itemStatus").value,
    name: $("itemName").value.trim(),
    category: $("itemCategory").value,
    location: $("itemLocation").value.trim(),
    description: $("itemDescription").value.trim(),
    image: $("itemImage").value.trim(),
    owner: $("ownerName").value.trim(),
    contact: $("ownerContact").value.trim()
  };

  if (!item.name || !item.location ||
      !item.description || !item.owner || !item.contact) {
    $("formMessage").textContent = "Please fill in all required fields.";
    return;
  }

  items.unshift(item);
  saveItems();

  $("formMessage").textContent = "Item published successfully!";
  $("postForm").reset();

  $("search").value = "";
  $("categoryFilter").value = "All";
  $("statusFilter").value = "All";

  renderItems();
  $("items").scrollIntoView({ behavior: "smooth" });
});

function openClaim(id) {
  selectedItem = items.find(item => item.id === id);

  if (!selectedItem) return;

  $("claimDetails").textContent =
    selectedItem.name + " · " +
    selectedItem.status + " · " +
    selectedItem.location;

  $("claimForm").reset();
  $("contactResult").replaceChildren();
  $("claimModal").hidden = false;
  $("claimName").focus();
}

function closeClaim() {
  $("claimModal").hidden = true;
  selectedItem = null;
}

$("closeModal").addEventListener("click", closeClaim);

$("claimModal").addEventListener("click", event => {
  if (event.target === $("claimModal")) closeClaim();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("claimModal").hidden) {
    closeClaim();
  }
});

$("claimForm").addEventListener("submit", function(event) {
  event.preventDefault();

  if (!selectedItem) return;

  const message = $("claimMessage").value.trim();
  const result = $("contactResult");
  result.replaceChildren();

  const note = document.createElement("p");
  note.textContent =
    "Contact the item poster directly and describe the item to verify ownership.";
  result.appendChild(note);

  const contact = document.createElement("p");
  contact.textContent = "Poster contact: " + selectedItem.contact;
  contact.style.marginTop = "10px";
  result.appendChild(contact);

  // Optional email link when the poster supplied an email address.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedItem.contact)) {
    const link = document.createElement("a");
    link.href = "mailto:" + selectedItem.contact +
      "?subject=" + encodeURIComponent("Campus Lost & Found: " + selectedItem.name) +
      "&body=" + encodeURIComponent(
        "Hello " + selectedItem.owner + ",\n\n" + message
      );
    link.textContent = "Open Email App";
    link.style.display = "inline-block";
    link.style.marginTop = "12px";
    result.appendChild(link);
  }

  const warning = document.createElement("p");
  warning.textContent =
    "Meet in a safe public campus location and verify ownership before handing over an item.";
  warning.style.marginTop = "12px";
  result.appendChild(warning);
});

renderItems();