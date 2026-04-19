const products = [
  {
    id: 1,
    name: "Premium Choy Set",
    price: 89000,
    category: "Uy uchun",
    image: "/images/products/choy-set.jpg",
    images: [
      "/images/products/choy-set.jpg",
      "/images/products/choy-set-2.jpg",
      "/images/products/choy-set-3.jpg"
    ],
    details:
      "Sovga uchun ham, kundalik foydalanish uchun ham mos. Yengil, chiroyli va dasturxon ko'rinishini boyitadi.",
    description: "Sovga va kundalik foydalanish uchun chiroyli choy set."
  },
  {
    id: 2,
    name: "Mini Aroma Diffuser",
    price: 149000,
    category: "Aksessuar",
    image: "/images/products/aroma-diffuser.jpg",
    images: [
      "/images/products/aroma-diffuser.jpg",
      "/images/products/aroma-diffuser-2.jpg",
      "/images/products/aroma-diffuser-3.jpg"
    ],
    details:
      "Uy, ofis yoki sovg'a uchun mos. Xonaga yoqimli hid tarqatadi va sokin muhit yaratishga yordam beradi.",
    description: "Xonaga yoqimli hid va sokin atmosfera beradigan qurilma."
  },
  {
    id: 3,
    name: "Eco Notebook",
    price: 39000,
    category: "Ofis",
    image: "/images/products/eco-notebook.jpg",
    images: [
      "/images/products/eco-notebook.jpg",
      "/images/products/eco-notebook-2.jpg",
      "/images/products/eco-notebook-3.jpg"
    ],
    details:
      "Reja, eslatma va kundalik yozuvlar uchun qulay. Ixcham hajmda, sumkada olib yurishga mos.",
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
const productModal = document.getElementById("product-modal");
const modalMainImage = document.getElementById("modal-main-image");
const modalThumbs = document.getElementById("modal-thumbs");
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalPrice = document.getElementById("modal-price");
const modalAddToCart = document.getElementById("modal-add-to-cart");

let selectedProductId = null;

function formatPrice(value) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

function renderProducts() {
  productList.innerHTML = products
    .map(
      (product) => `
        <article class="product-card" data-open-product-id="${product.id}" tabindex="0" role="button" aria-label="${product.name} haqida batafsil">
          <div class="product-visual">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
            <span class="product-tag">${product.category}</span>
          </div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-footer">
              <span class="price">${formatPrice(product.price)}</span>
              <button class="secondary-btn" data-product-id="${product.id}" type="button">
                Savatga qo'shish
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  productList.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const productId = Number(button.getAttribute("data-product-id"));
      addToCart(productId);
    });
  });

  productList.querySelectorAll("[data-open-product-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const productId = Number(card.getAttribute("data-open-product-id"));
      openProductModal(productId);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const productId = Number(card.getAttribute("data-open-product-id"));
        openProductModal(productId);
      }
    });
  });
}

function getProductImages(product) {
  return product.images && product.images.length > 0 ? product.images : [product.image];
}

function setModalImage(image, productName) {
  modalMainImage.src = image;
  modalMainImage.alt = productName;
}

function openProductModal(productId) {
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  selectedProductId = productId;
  const images = getProductImages(product);

  setModalImage(images[0], product.name);
  modalCategory.textContent = product.category;
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.details || product.description;
  modalPrice.textContent = formatPrice(product.price);
  modalThumbs.innerHTML = images
    .map(
      (image, index) => `
        <button class="modal-thumb ${index === 0 ? "is-active" : ""}" type="button" data-modal-image="${image}">
          <img src="${image}" alt="${product.name} rasmi ${index + 1}" />
        </button>
      `
    )
    .join("");

  modalThumbs.querySelectorAll("[data-modal-image]").forEach((button) => {
    button.addEventListener("click", () => {
      setModalImage(button.getAttribute("data-modal-image"), product.name);
      modalThumbs.querySelectorAll(".modal-thumb").forEach((thumb) => thumb.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  selectedProductId = null;
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
modalAddToCart.addEventListener("click", () => {
  if (selectedProductId) {
    addToCart(selectedProductId);
    closeProductModal();
  }
});

productModal.querySelectorAll("[data-modal-close]").forEach((element) => {
  element.addEventListener("click", closeProductModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && productModal.classList.contains("is-open")) {
    closeProductModal();
  }
});

renderProducts();
renderCart();
