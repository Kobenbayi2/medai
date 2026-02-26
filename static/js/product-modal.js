// JavaScript для модального окна товаров

let productDetails = [];
let currentProductId = null;
let userRating = 0;

// Загрузка детальной информации о товарах
async function loadProductDetails() {
    try {
        const response = await fetch('product-details.json');
        productDetails = await response.json();
        console.log('Детали товаров загружены:', productDetails);
    } catch (error) {
        console.error('Ошибка загрузки деталей товаров:', error);
        productDetails = [];
    }
}

// Функция показа модального окна
function showProductModal(productId) {
    console.log('Показ модального окна для товара:', productId);
    
    const product = productDetails.find(p => p.id == productId);
    if (!product) {
        console.error('Товар не найден:', productId);
        return;
    }

    currentProductId = productId;
    userRating = product.rating || 0;

    const modal = document.getElementById('product-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Создаем отзывы
    const reviewsHtml = product.reviews && product.reviews.length > 0 
        ? product.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-user">${review.user}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="rating-stars">
                    ${createStars(review.rating, false)}
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `).join('')
        : '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';

    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeProductModal()">×</button>
        <div class="modal-body">
            <!-- Заголовок с изображением -->
            <div class="modal-header">
                <div class="modal-image">
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e0f7fa%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-family=%22Arial%22 font-size=%2210%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23009688%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="modal-title-section">
                    <h2 class="modal-title">${product.name}</h2>
                    <div class="modal-price">${product.price} ₸</div>
                    <p class="modal-description">${product.description}</p>
                </div>
            </div>
            
            <!-- Полное описание -->
            <div class="modal-section">
                <h3>Подробное описание</h3>
                <p class="modal-description">${product.fullDescription}</p>
            </div>
            
            <!-- Инструкция -->
            <div class="modal-section">
                <h3>Инструкция по применению</h3>
                <div class="modal-instruction">
                    ${product.instruction}
                </div>
            </div>
            
            <!-- Система рейтинга -->
            <div class="rating-section">
                <div class="rating-title">Оцените этот товар</div>
                <div class="rating-stars" id="rating-stars">
                    ${createStars(0, true)}
                </div>
                <div class="rating-value" id="rating-value">Выберите оценку</div>
                <div class="rating-actions">
                    <button class="btn-small btn-outline" onclick="submitRating()">Отправить оценку</button>
                    <button class="btn-small btn-primary" onclick="addToCartFromModal(${product.id})">Добавить в корзину</button>
                </div>
            </div>
            
            <!-- Отзывы -->
            <div class="modal-section reviews-section">
                <h3>Отзывы покупателей</h3>
                <div class="reviews-list">
                    ${reviewsHtml}
                </div>
            </div>
        </div>
    `;

    // Инициализация звезд рейтинга
    initRatingStars();
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Функция создания звезд рейтинга
function createStars(rating, interactive = false) {
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= rating;
        const starClass = interactive ? 'star' + i + ' star' + (isActive ? ' active' : '') : 'star';
        const starSymbol = isActive ? '⭐' : '☆';
        
        if (interactive) {
            starsHtml += `<span class="${starClass}" onclick="setRating(${i})" onmouseover="hoverRating(${i})">${starSymbol}</span>`;
        } else {
            starsHtml += `<span class="${starClass}">${starSymbol}</span>`;
        }
    }
    
    return starsHtml;
}

// Инициализация интерактивных звезд
function initRatingStars() {
    if (userRating > 0) {
        setRating(userRating);
    }
}

// Установка рейтинга при наведении
function hoverRating(rating) {
    const stars = document.querySelectorAll('#rating-stars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '⭐';
            star.style.color = '#ffc107';
        } else {
            star.textContent = '☆';
            star.style.color = '#e0e0e0';
        }
    });
    document.getElementById('rating-value').textContent = `Оценка: ${rating}/5`;
}

// Установка рейтинга
function setRating(rating) {
    userRating = rating;
    const stars = document.querySelectorAll('#rating-stars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '⭐';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
    document.getElementById('rating-value').textContent = `Ваша оценка: ${rating}/5`;
}

// Отправка рейтинга
function submitRating() {
    if (userRating === 0) {
        alert('Пожалуйста, выберите оценку');
        return;
    }
    
    // Здесь можно отправить рейтинг на сервер
    console.log(`Оценка ${userRating} для товара ${currentProductId}`);
    alert(`Спасибо! Ваша оценка ${userRating}/5 принята.`);
    
    // Обновляем рейтинг в данных
    const product = productDetails.find(p => p.id == currentProductId);
    if (product) {
        product.rating = userRating;
    }
}

// Добавление в корзину из модального окна
function addToCartFromModal(productId) {
    const product = productDetails.find(p => p.id == productId);
    if (product) {
        // Используем существующую функцию addToCart из pharmacy.js
        if (typeof addToCart === 'function') {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price
            });
            closeProductModal();
        } else {
            alert('Товар добавлен в корзину!');
        }
    }
}

// Функция закрытия модального окна
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentProductId = null;
    userRating = 0;
}

// Закрытие модального окна при клике на фон
document.addEventListener('click', function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeProductModal();
    }
});

// Закрытие модального окна по ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeProductModal();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    
    // Добавляем обработчики клика на карточки товаров
    document.addEventListener('click', function(event) {
        const productCard = event.target.closest('.product-card');
        if (productCard && !event.target.closest('.add-to-cart')) {
            event.preventDefault();
            event.stopPropagation();
            
            const addToCartBtn = productCard.querySelector('.add-to-cart');
            const productId = addToCartBtn?.getAttribute('data-id');
            
            console.log('Клик по карточке, productId:', productId);
            
            if (productId) {
                showProductModal(productId);
            }
        }
    });
    
    console.log('Product modal initialized');
});