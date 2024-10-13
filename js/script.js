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
});
const aboutSlider = new Swiper(".main-slider", {
    loop: true,
    slidesPerView: 1,
    navigation: {
        nextEl: ".main-slider .swiper-button-next",
        prevEl: ".main-slider .swiper-button-prev",
    },
});
