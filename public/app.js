const products = [
  {
    id: 1,
    name: "Premium Choy Set",
    price: 89000,
    category: "Uy uchun",
    description: "Sovga va kundalik foydalanish uchun chiroyli choy set."
  },
  {
    id: 2,
    name: "Mini Aroma Diffuser",
    price: 149000,
    category: "Aksessuar",
    description: "Xonaga yoqimli hid va sokin atmosfera beradigan qurilma."
  },
  {
    id: 3,
    name: "Eco Notebook",
    price: 39000,
    category: "Ofis",
    description: "Ish va reja yozish uchun ixcham va saranjom daftar."
  }
];

const cart = [];

const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const orderForm = document.getElementById("order-form");
const formMessage = document.getElementById("form-message");

function formatPrice(value) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

function renderProducts() {
  productList.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-visual">
            <span class="product-tag">${product.category}</span>
          </div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-footer">
              <span class="price">${formatPrice(product.price)}</span>
              <button class="secondary-btn" data-product-id="${product.id}">
                Savatga qo'shish
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  productList.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.getAttribute("data-product-id"));
      addToCart(productId);
    });
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existing = cart.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
}

function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.id === productId);

  if (index !== -1) {
    cart.splice(index, 1);
  }

  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-state">Hozircha savatda mahsulot yo\'q.</p>';
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <p>${item.quantity} x ${formatPrice(item.price)}</p>
            </div>
            <button class="secondary-btn" data-remove-id="${item.id}">O'chirish</button>
          </div>
        `
      )
      .join("");

    cartItems.querySelectorAll("[data-remove-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = Number(button.getAttribute("data-remove-id"));
        removeFromCart(productId);
      });
    });
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = `Savat: ${totalItems} ta`;
  cartTotal.textContent = formatPrice(getCartTotal());
}

async function submitOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    formMessage.textContent = "Avval kamida bitta mahsulot tanlang.";
    return;
  }

  formMessage.textContent = "Yuborilmoqda...";

  const formData = new FormData(orderForm);
  const payload = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    note: formData.get("note"),
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    total: getCartTotal()
  };

  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Buyurtma yuborilmadi.");
    }

    formMessage.style.color = "#14532d";
    formMessage.textContent = `${result.message} ID: ${result.orderId}`;
    orderForm.reset();
    cart.splice(0, cart.length);
    renderCart();
  } catch (error) {
    formMessage.style.color = "#8a1c1c";
    formMessage.textContent = error.message;
  }
}

orderForm.addEventListener("submit", submitOrder);

renderProducts();
renderCart();
