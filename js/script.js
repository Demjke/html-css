document.addEventListener("DOMContentLoaded", function () {
    let menu = document.querySelector(".menu");
    let filtres = document.querySelector(".products-filtres");
    document.addEventListener("click", e => {
        if ((e.target.closest(".header-menu") && !e.target.closest(".menu")) || e.target.closest(".menu-close")) {
            menu.classList.toggle("active");
        }
        if (e.target.closest(".products-filtres__title")) {
            filtres.classList.toggle("active");
        }
        if (e.target.closest(".products-filtres__bnt")) {
            e.target.closest(".products-filtres__cat").classList.toggle("active");
        }
        if (e.target.closest(".products-charact__title")) {
            e.target.closest(".products-charact__item").classList.toggle("active");
        }
    });

    const productsHome = document.querySelector(".products-wrapper");
    if (productsHome) {
        fetch("js/data.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load JSON: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                renderProducts(data);
            })
            .catch(error => {
                console.error("Ошибка загрузки JSON:", error);
            });
    }

    function renderProducts(data) {
        data.forEach(item => {
            const product = document.createElement("div");
            product.className = "products-item";
            product.dataset.productId = item.id;
            product.dataset.category = item.category;
            product.innerHTML = `
            <div class="products-item__img">
                <img src="${item.image}" alt="" />
                <div class="products-item__btn-wrapper">
                    <div class="products-item__btn">
                        <img src="img/home/cart.svg" alt="" />
                        <span>Add to Cart</span>
                    </div>
                </div>
            </div>
            <div class="products-item__content">
                <a href="products.html" class="products-item__title">${item.title}</a>
                <div class="products-item__decs">${item.description}</div>
                <div class="products-item__price">$${item.price}</div>
            </div>
            `;
            productsHome.appendChild(product);
        });
    }
});
