/* ================= MENU TOGGLE ================= */
function toggleMenu() {
  const panel = document.querySelector('.menu-panel');
  const btn = document.querySelector('.hamburger');
  const isActive = panel.classList.toggle('active');

  // Update accessibility attributes
  if (btn) btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  if (panel) panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');

  // If opened, focus first link for keyboard users
  if (isActive) {
    const firstLink = panel.querySelector('a');
    if (firstLink) firstLink.focus();
  }
}

// Close menu on Escape or click outside
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const panel = document.querySelector('.menu-panel');
    if (panel && panel.classList.contains('active')) toggleMenu();
  }
});

document.addEventListener('click', (e) => {
  const panel = document.querySelector('.menu-panel');
  const btn = document.querySelector('.hamburger');
  if (!panel || !panel.classList.contains('active')) return;

  // If click is outside panel and not on the hamburger, close
  if (!panel.contains(e.target) && !btn.contains(e.target)) {
    toggleMenu();
  }
});

/* ================= CART ================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addItem(name, price) {
  cart.push({ name, price: Number(price) });
  saveCart();
  flashAdded();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  renderCartOnOrder();
  updateDeliveryFee();
}

function cartTotalRaw() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function cartTotal() {
  return cartTotalRaw().toFixed(2);
}

function renderCart() {
  const list = document.getElementById("cartList");
  const total = document.getElementById("total");
  if (!list || !total) return;

  list.innerHTML = "";
  cart.forEach((item, i) => {
    list.innerHTML += `
      <li>
        <span>${item.name} — R${item.price.toFixed(2)}</span>
        <button onclick="removeItem(${i})" aria-label="Remove ${item.name}">CANCEL</button>
      </li>`;
  });
  total.innerText = cartTotal();
}

function renderCartOnOrder() {
  const list = document.getElementById("cartListOrder");
  if (!list) return;

  list.innerHTML = "";
  cart.forEach((item) => {
    list.innerHTML += `<li>${item.name} — R${item.price.toFixed(2)}</li>`;
  });
}

/* ================= TOAST ================= */
function flashAdded() {
  const toast = document.createElement("div");
  toast.innerText = "Added to cart";
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#d4af37";
  toast.style.padding = "10px 20px";
  toast.style.color = "#000";
  toast.style.borderRadius = "6px";
  toast.style.fontWeight = "600";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

/* ================= ORDER ================= */
function handleOrderType() {
  const type = document.getElementById("orderType").value;
  const addressEl = document.getElementById("address");
  const areaEl = document.getElementById("area");

  if (addressEl) addressEl.style.display = type === "Delivery" ? "block" : "none";
  if (areaEl) areaEl.style.display = type === "Delivery" ? "block" : "none";

  updateDeliveryFee();
}

function getDeliveryFee() {
  const typeEl = document.getElementById("orderType");
  const area = document.getElementById("area");
  if (!typeEl || typeEl.value !== "Delivery") return 0;
  if (!area) return 0;

  switch (area.value) {
    case "Eden Park": return 10;
    case "Katlehong": return 15;
    case "Thokoza": return 15;
    case "Other": return 50;
    default: return 0;
  }
}

function updateDeliveryFee() {
  const itemsTotalEl = document.getElementById("totalOrder");
  const deliveryFeeEl = document.getElementById("deliveryFee");
  const grandTotalEl = document.getElementById("grandTotal");
  if (!itemsTotalEl) return;

  const itemsTotal = cartTotalRaw();
  const fee = getDeliveryFee();
  const grand = itemsTotal + fee;

  itemsTotalEl.innerText = itemsTotal.toFixed(2);
  if (deliveryFeeEl) deliveryFeeEl.innerText = fee.toFixed(2);
  if (grandTotalEl) grandTotalEl.innerText = grand.toFixed(2);
}

function sendOrder() {
  if (cart.length === 0) {
    alert("Please select food from the menu.");
    return;
  }

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const orderTypeInput = document.getElementById("orderType");
  const addressInput = document.getElementById("address");
  const areaInput = document.getElementById("area");

  // Get whatsapp number from input if present, otherwise use default business number
  const whatsappInput = document.getElementById("whatsappNumber");
  const whatsappNumber = whatsappInput && whatsappInput.value.trim() ? whatsappInput.value.trim() : "27831234567";

  if (!nameInput.value.trim() || !phoneInput.value.trim()) {
    alert("Please enter name and phone number.");
    return;
  }

  const phoneValid = /^[0-9+\s-]{8,}$/.test(phoneInput.value.trim());
  if (!phoneValid) {
    alert("Please enter a valid phone number.");
    return;
  }

  if (orderTypeInput.value === "Delivery") {
    if (!areaInput.value || !addressInput.value.trim()) {
      alert("Please fill delivery area and address.");
      return;
    }
  }

  const fee = getDeliveryFee();
  const itemsTotal = cartTotalRaw();
  const grand = itemsTotal + fee;

  let msg = "KING'S FOOD ORDER\n\n";
  msg += `Name: ${nameInput.value.trim()}\nPhone: ${phoneInput.value.trim()}\nOrder Type: ${orderTypeInput.value}\n`;
  if (orderTypeInput.value === "Delivery") {
    msg += `Area: ${areaInput.value}\nAddress: ${addressInput.value.trim()}\n`;
  }
  msg += "\nItems:\n";
  cart.forEach(i => msg += `• ${i.name} — R${i.price.toFixed(2)}\n`);
  msg += `\nItems Total: R${itemsTotal.toFixed(2)}\nDelivery Fee: R${fee.toFixed(2)}\nGrand Total: R${grand.toFixed(2)}`;

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  renderCartOnOrder();
  handleOrderType(); // set initial visibility for address/area
  updateDeliveryFee();
});

