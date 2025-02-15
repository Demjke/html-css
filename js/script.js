document.addEventListener("DOMContentLoaded", () => {
    // --- Общие переменные ---
    const selectors = {
        menu: ".menu",
        filters: ".products-filtres",
        cartOverlay: ".header-cart__overlay",
        goodsContainer: ".cart-goods",
        cartCount: ".header-cart__img-count",
        totalPrice: ".cart-pay__total span",
        productsWrapper: ".home-products",
        productsCatalog: ".catalog-products",
        productsPagNums: ".products-pag__nums",
        productsPagPrev: ".products-pag__prev",
        productsPagNext: ".products-pag__next",
    };

    const elements = Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, document.querySelector(selector)]));

    const itemsPerPage = 9; // Количество товаров на странице
    let currentPage = 1;
    let productsData = [];
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const toggleClass = (el, className) => el?.classList.toggle(className);

    const renderProducts = (container, data, page = 1) => {
        if (!container) return;

        const paginatedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        container.classList.add("loading");

        const fragment = paginatedData.map(({ id, category, image, title, description, price }) => {
            const productItem = document.createElement("div");
            productItem.classList.add("products-item");
            productItem.dataset.productId = id;
            productItem.dataset.category = category;
            productItem.innerHTML = `
                <div class="products-item__img">
                    <img src="${image}" alt="">
                    <div class="products-item__btn-wrapper">
                        <div class="products-item__btn">
                            <img src="img/home/cart.svg" alt="">
                            <span>Add to Cart</span>
                        </div>
                    </div>
                </div>
                <div class="products-item__content">
                    <a href="products.html" class="products-item__title">${title}</a>
                    <div class="products-item__decs">${description}</div>
                    <div class="products-item__price">$${price}</div>
                </div>`;
            return productItem;
        });

        container.innerHTML = "";
        container.append(...fragment);
        updatePagination(data.length, page);
    };

    const updatePagination = (totalItems, currentPage) => {
        if (!elements.productsPagNums) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        elements.productsPagNums.innerHTML = "";

        const fragment = Array.from({ length: totalPages }, (_, i) => {
            const pageButton = document.createElement("button");
            pageButton.classList.add("products-pag__num", i + 1 === currentPage && "active");
            pageButton.textContent = i + 1;
            pageButton.addEventListener("click", () => {
                currentPage = i + 1;
                document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
                renderProducts(elements.productsWrapper || elements.productsCatalog, productsData, currentPage);
            });
            return pageButton;
        });

        elements.productsPagNums.append(...fragment);

        elements.productsPagPrev?.classList.toggle("hidden", currentPage === 1);
        elements.productsPagNext?.classList.toggle("hidden", currentPage === totalPages);
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("js/data.json");
            productsData = await response.json();
            renderProducts(elements.productsWrapper || elements.productsCatalog, productsData, currentPage);
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    const updateCart = () => {
        const totalItems = cart.reduce((sum, { quantity }) => sum + quantity, 0);
        const totalAmount = cart.reduce((sum, { price, quantity }) => sum + price * quantity, 0).toFixed(2);

        elements.cartCount?.classList.toggle("active", totalItems > 0);
        if (elements.cartCount) elements.cartCount.textContent = totalItems;
        if (elements.totalPrice) elements.totalPrice.textContent = totalAmount;

        if (elements.goodsContainer) {
            elements.goodsContainer.innerHTML = cart
                .map(
                    ({ id, title, price, image, quantity }) => `
            <div class="cart-good" data-cart-id="${id}">
                <div class="cart-good__close">
                    <img src="img/home/good-close.png" alt="Remove" class="remove-item-btn">
                </div>
                <div class="cart-good__img"><img src="${image}" alt=""></div>
                <div class="cart-good__info">
                    <div class="cart-good__title">${title}</div>
                    <div class="cart-good__items">
                        <div class="cart-good__item cart-good__price">
                            <div>Price:</div>
                            <div class="cart-good__price-num">$<span>${price}</span></div>
                        </div>
                        <div class="cart-good__item cart-good__quant">
                            <div>Quantity:</div>
                            <input type="number" name="quantityCart" value="${quantity}" min="1">
                        </div>
                    </div>
                </div>
            </div>`
                )
                .join("");
        }

        elements.cartOverlay?.classList.toggle("active", cart.length === 0);
        localStorage.setItem("cart", JSON.stringify(cart));
    };

    const addToCart = product => {
        const id = product.dataset.productId;
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id,
                title: product.querySelector(".products-item__title")?.textContent,
                price: parseFloat(product.querySelector(".products-item__price")?.textContent.slice(1)),
                image: product.querySelector(".products-item__img img")?.src,
                quantity: 1,
            });
        }

        updateCart();
    };

    const removeFromCart = productId => {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    };

    document.addEventListener("input", ({ target }) => {
        if (target.name === "quantityCart") {
            const cartItem = target.closest(".cart-good");
            const productId = cartItem?.dataset.cartId;
            const newQuantity = parseInt(target.value, 10);

            if (newQuantity > 0) {
                cart.find(item => item.id === productId).quantity = newQuantity;
            } else {
                removeFromCart(productId);
            }
            updateCart();
        }
    });

    document.addEventListener("click", ({ target }) => {
        if (target.closest(".products-item__btn")) {
            addToCart(target.closest(".products-item"));
        }

        if (target.classList.contains("remove-item-btn")) {
            removeFromCart(target.closest(".cart-good")?.dataset.cartId);
        }

        if (target.closest(".header-burger")) toggleClass(elements.menu, "active");
        if (target.closest(".menu-close")) toggleClass(elements.menu, "active");
    });

    elements.productsPagPrev?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
            renderProducts(elements.productsWrapper || elements.productsCatalog, productsData, currentPage);
        }
    });

    elements.productsPagNext?.addEventListener("click", () => {
        const totalPages = Math.ceil(productsData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
            renderProducts(elements.productsWrapper || elements.productsCatalog, productsData, currentPage);
        }
    });

    fetchProducts();
    updateCart();
});
