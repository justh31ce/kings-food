/* ================= MENU TOGGLE ================= */
function toggleMenu(){
  const panel = document.querySelector('.menu-panel');
  const btn = document.querySelector('.hamburger');
  const isActive = panel.classList.toggle('active');
  panel.setAttribute('aria-hidden', !isActive);
  if(btn) btn.setAttribute('aria-expanded', isActive);
}

/* ================= CART ================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addItem(name, price){
  cart.push({name, price: Number(price)});
  saveCart();
  flashAdded();
}

function removeItem(index){
  cart.splice(index, 1);
  saveCart();
}

function clearCart(){
  cart = [];
  saveCart();
}

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  renderCartOnOrder();
  updateDeliveryFee(); // keep totals fresh
}

function cartTotalRaw(){
  return cart.reduce((sum, item) => sum + item.price, 0);
}
function cartTotal(){
  return cartTotalRaw().toFixed(2);
}

function renderCart(){
  const list = document.getElementById("cartList");
  const total = document.getElementById("total");
  if(!list || !total) return;

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

function renderCartOnOrder(){
  const list = document.getElementById("cartListOrder");
  const total = document.getElementById("totalOrder");
  if(!list || !total) return;

  list.innerHTML = "";
  cart.forEach((item, i) => {
    list.innerHTML += `
      <li>
        <span>${item.name} — R${item.price.toFixed(2)}</span>
        <button onclick="removeItem(${i})" aria-label="Remove ${item.name}">CANCEL</button>
      </li>`;
  });
  total.innerText = cartTotal();
  updateDeliveryFee(); // recalc grand total
}

function flashAdded(){
  const nav = document.querySelector('nav');
  if(!nav) return;
  nav.style.boxShadow = '0 0 12px rgba(212,175,55,0.6)';
  setTimeout(()=>{ nav.style.boxShadow = 'none'; }, 400);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  renderCartOnOrder();
});

/* ================= ORDER ================= */
function handleOrderType(){
  const type = document.getElementById("orderType").value;
  const address = document.getElementById("address");
  const area = document.getElementById("area");
  if(address) address.style.display = type === "Delivery" ? "block" : "none";
  if(area) area.style.display = type === "Delivery" ? "block" : "none";
}

/* Delivery fee by area:
   Eden Park = R10
   Katlehong = R15
   Thokoza = R15
   Other (e.g., Alberton) = R50
*/
function getDeliveryFee(){
  const orderTypeInput = document.getElementById("orderType");
  const areaInput = document.getElementById("area");
  if(!orderTypeInput || orderTypeInput.value !== "Delivery") return 0;

  const area = areaInput ? areaInput.value : "";
  switch(area){
    case "Eden Park": return 10;
    case "Katlehong": return 15;
    case "Thokoza": return 15;
    case "Other": return 50;
    default: return 0; // no area selected yet
  }
}

function updateDeliveryFee(){
  const itemsTotalEl = document.getElementById("totalOrder");
  const deliveryFeeEl = document.getElementById("deliveryFee");
  const grandTotalEl = document.getElementById("grandTotal");
  if(!itemsTotalEl || !deliveryFeeEl || !grandTotalEl) return;

  const itemsTotal = cartTotalRaw();
  const fee = getDeliveryFee();
  const grand = itemsTotal + fee;

  itemsTotalEl.innerText = itemsTotal.toFixed(2);
  deliveryFeeEl.innerText = fee.toFixed(2);
  grandTotalEl.innerText = grand.toFixed(2);
}

function sendOrder(){
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const orderTypeInput = document.getElementById("orderType");
  const addressInput = document.getElementById("address");
  const areaInput = document.getElementById("area");

  if(cart.length === 0){
    alert("Please select food from the menu.");
    return;
  }
  if(!nameInput.value.trim() || !phoneInput.value.trim()){
    alert("Please fill in your name and phone number.");
    return;
  }
  const phoneValid = /^[0-9+\s-]{8,}$/.test(phoneInput.value.trim());
  if(!phoneValid){
    alert("Please enter a valid phone number.");
    return;
  }
  if(orderTypeInput.value === "Delivery"){
    if(!areaInput.value){
      alert("Please select your delivery area.");
      return;
    }
    if(!addressInput.value.trim()){
      alert("Please provide a delivery address.");
      return;
    }
  }

  const fee = getDeliveryFee();
  const itemsTotal = cartTotalRaw();
  const grand = itemsTotal + fee;

  let msg = "KINGS FOOD ORDER\n\n";
  msg += `Name: ${nameInput.value.trim()}\nPhone: ${phoneInput.value.trim()}\n`;
  msg += `Order Type: ${orderTypeInput.value}\n`;
  if(orderTypeInput.value === "Delivery"){
    msg += `Area: ${areaInput.value}\n`;
    msg += `Address: ${addressInput.value.trim()}\n`;
  }
  msg += `\nItems:\n`;
  cart.forEach(i => msg += `• ${i.name} — R${i.price.toFixed(2)}\n`);
  msg += `\nItems Total: R${itemsTotal.toFixed(2)}`;
  msg += `\nDelivery Fee: R${fee.toFixed(2)}`;
  msg += `\nGrand Total: R${grand.toFixed(2)}`;

  const confirmSend = confirm("Send order to WhatsApp?");
  if(!confirmSend) return;

  window.open(
    "https://wa.me/27814963608?text=" + encodeURIComponent(msg),
    "_blank"
  );
}