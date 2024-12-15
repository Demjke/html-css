document.addEventListener("DOMContentLoaded", () => {
    // --- Общие переменные ---
    const menu = document.querySelector(".menu");
    const filters = document.querySelector(".products-filtres");
    const cartOverlay = document.querySelector(".header-cart__overlay");
    const goodsContainer = document.querySelector(".cart-goods");
    const cartCountElement = document.querySelector(".header-cart__img-count");
    const totalPriceElement = document.querySelector(".cart-pay__total span");
    const productsContainer = document.querySelector(".products-wrapper");

    let cartCount = 0;

    // --- Вспомогательные функции ---

    const toggleElementClass = (element, className) => {
        if (element) element.classList.toggle(className);
    };

    const updateCartCount = count => {
        cartCount = count;
        cartCountElement.textContent = count;
        cartCountElement.classList.toggle("active", count > 0);
    };

    const calculateTotalPrice = () => {
        let totalPrice = 0;
        document.querySelectorAll(".cart-good").forEach(item => {
            const price = parseFloat(item.querySelector(".cart-good__price-num span").textContent);
            const quantity = parseInt(item.querySelector(".cart-good__quant input").value, 10);
            totalPrice += price * quantity;
        });
        totalPriceElement.textContent = totalPrice.toFixed(2);
    };

    const addProductToCart = product => {
        const productId = product.dataset.productId;
        const existingProduct = goodsContainer.querySelector(`[data-cart-id="${productId}"]`);

        if (existingProduct) {
            const quantityInput = existingProduct.querySelector(".cart-good__quant input");
            quantityInput.value = parseInt(quantityInput.value, 10) + 1;
        } else {
            const productMarkup = `
                <div class="cart-good" data-cart-id="${productId}">
                    <div class="cart-good__close"><img src="img/home/good-close.png" alt="Remove"></div>
                    <div class="cart-good__img"><img src="${product.querySelector(".products-item__img img").src}" alt=""></div>
                    <div class="cart-good__info">
                        <div class="cart-good__title">${product.querySelector(".products-item__title").textContent}</div>
                        <div class="cart-good__items">
                            <div class="cart-good__item cart-good__price">
                                <div>Price:</div>
                                <div class="cart-good__price-num">$<span>${parseFloat(product.querySelector(".products-item__price").textContent.slice(1))}</span></div>
                            </div>
                            <div class="cart-good__item cart-good__quant">
                                <div>Quantity:</div>
                                <input type="number" name="quantityCart" value="1" min="1">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            goodsContainer.insertAdjacentHTML("beforeend", productMarkup);
        }

        updateCartCount(cartCount + 1);
        calculateTotalPrice();
    };

    const removeProductFromCart = product => {
        const quantity = parseInt(product.querySelector(".cart-good__quant input").value, 10);
        product.remove();
        updateCartCount(cartCount - quantity);
        calculateTotalPrice();
        if (cartCount === 0) cartOverlay.classList.add("active");
    };

    const clearCart = () => {
        goodsContainer.innerHTML = "";
        updateCartCount(0);
        totalPriceElement.textContent = "0.00";
        cartOverlay.classList.add("active");
    };

    // --- Обработчики событий ---

    document.addEventListener("click", e => {
        if (e.target.closest(".header-menu") && !e.target.closest(".menu")) {
            toggleElementClass(menu, "active");
        }

        if (e.target.closest(".menu-close")) {
            menu.classList.remove("active");
        }

        if (e.target.closest(".products-filtres__title")) {
            toggleElementClass(filters, "active");
        }

        if (e.target.closest(".products-filtres__bnt")) {
            const category = e.target.closest(".products-filtres__cat");
            toggleElementClass(category, "active");
        }

        if (e.target.closest(".products-charact__title")) {
            const item = e.target.closest(".products-charact__item");
            toggleElementClass(item, "active");
        }

        if (e.target.closest(".products-item__btn")) {
            const product = e.target.closest(".products-item");
            cartOverlay.classList.remove("active");
            addProductToCart(product);
        }

        if (e.target.closest(".cart-good__close")) {
            const product = e.target.closest(".cart-good");
            removeProductFromCart(product);
        }

        if (e.target.closest(".clear")) {
            clearCart();
        }
    });

    document.addEventListener("input", e => {
        if (e.target.name === "quantityCart") {
            const product = e.target.closest(".cart-good");
            const newQuantity = parseInt(e.target.value, 10);
            const oldQuantity = parseInt(e.target.dataset.previousValue || 1, 10);

            updateCartCount(cartCount + (newQuantity - oldQuantity));
            calculateTotalPrice();
            e.target.dataset.previousValue = newQuantity;

            if (newQuantity <= 0) {
                removeProductFromCart(product);
            }
        }
    });
    if (productsContainer) {
        fetch("js/data.json")
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load JSON: ${response.status}`);
                return response.json();
            })
            .then(data => {
                data.forEach(item => {
                    const productMarkup = `
                        <div class="products-item" data-product-id="${item.id}" data-category="${item.category}">
                            <div class="products-item__img">
                                <img src="${item.image}" alt="">
                                <div class="products-item__btn-wrapper">
                                    <div class="products-item__btn">
                                        <img src="img/home/cart.svg" alt="">
                                        <span>Add to Cart</span>
                                    </div>
                                </div>
                            </div>
                            <div class="products-item__content">
                                <a href="products.html" class="products-item__title">${item.title}</a>
                                <div class="products-item__decs">${item.description}</div>
                                <div class="products-item__price">$${item.price}</div>
                            </div>
                        </div>
                    `;
                    productsContainer.insertAdjacentHTML("beforeend", productMarkup);
                });
            })
            .catch(error => console.error("Error loading products:", error));
    }
});
