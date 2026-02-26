// JavaScript для страницы аптеки

let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', function() {
    // Загружаем товары из products.json
    loadProducts();
    
    // Инициализация поиска и фильтрации
    initSearchAndFilter();
    
    // Инициализация корзины
    initCart();
    
    // Инициализация кнопки оформления заказа
    initCheckoutButton();
    
    // Обновляем счетчик корзины
    updateCartCount();
});

// Функция загрузки товаров
async function loadProducts() {
    try {
        // Показываем индикатор загрузки
        showLoadingIndicator();
        
        // Создаем имитацию задержки загрузки
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Загружаем данные из products.json
        const response = await fetch('products.json');
        const products = await response.json();
        
        // Отображаем товары
        displayProducts(products);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showNotification('Не удалось загрузить товары. Пожалуйста, попробуйте позже.', 'error');
        
        // В случае ошибки используем тестовые данные
        const testProducts = getTestProducts();
        displayProducts(testProducts);
    }
}

// Функция показа индикатора загрузки
function showLoadingIndicator() {
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="loading-products">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка товаров...</p>
            </div>
        `;
    }
}

// Функция отображения товаров
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    
    if (!productsContainer) return;
    
    // Очищаем контейнер
    productsContainer.innerHTML = '';
    
    // Если товаров нет, показываем сообщение
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-search"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры поиска</p>
            </div>
        `;
        return;
    }
    
    // Создаем карточки товаров
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card slide-up';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onload="this.classList.add('loaded')"
                     onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22 viewBox=%220 0 200 150%22%3E%3Crect fill=%22%23e0f7fa%22 width=%22200%22 height=%22150%22/%3E%3Ctext x=%22100%22 y=%2275%22 font-family=%22Arial%22 font-size=%2214%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23009688%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                ${product.dosage ? `<div class="product-dosage"><i class="fas fa-capsules"></i> ${product.dosage} • ${product.quantity}</div>` : ''}
                <div class="product-price">${product.price.toLocaleString()} ₸</div>
                <div class="product-actions">
                    <button class="btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                        <i class="fas fa-cart-plus"></i> В корзину
                    </button>
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Добавляем обработчики событий для кнопок "В корзину"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Предотвращаем открытие модального окна товара
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseInt(this.getAttribute('data-price'));
            
            addToCart({
                id: productId,
                name: productName,
                price: productPrice
            });
        });
    });
    
    // Добавляем обработчики для открытия модального окна товара
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.add-to-cart')) {
                const addToCartBtn = this.querySelector('.add-to-cart');
                const productId = addToCartBtn?.getAttribute('data-id');
                
                if (productId && typeof showProductModal === 'function') {
                    showProductModal(productId);
                }
            }
        });
    });
}

// Функция добавления в корзину
function addToCart(product) {
    // Получаем актуальные данные из localStorage
    let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = currentCart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentCart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Обновляем глобальную переменную
    cart = currentCart;
    
    // Обновляем счетчик
    updateCartCount();
    
    // Показываем уведомление
    showNotification(`${product.name} добавлен в корзину`, 'success');
    
    // Обновляем модальное окно корзины, если оно открыто
    updateCartModal();
}

// Функция обновления счетчика корзины
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    // Всегда используем актуальные данные из localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cartCount) {
        const totalItems = currentCart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Функция инициализации корзины
function initCart() {
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const modalClose = document.querySelector('.modal-close');
    const continueShopping = document.getElementById('continue-shopping');
    
    // Открытие модального окна корзины
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            updateCartModal();
            cartModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Закрытие модального окна
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    if (continueShopping) {
        continueShopping.addEventListener('click', function() {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Закрытие по клику вне модального окна
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Функция обновления модального окна корзины
function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItems || !cartSubtotal || !cartTotalPrice) return;
    
    // Всегда используем актуальные данные из localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cartItems.innerHTML = '';
    
    if (currentCart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Ваша корзина пуста</p>
                <small>Добавьте товары из каталога</small>
            </div>
        `;
        cartSubtotal.textContent = '0 ₸';
        cartTotalPrice.textContent = '0 ₸';
        
        // Делаем кнопку неактивной если корзина пуста
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.6';
        }
        return;
    }
    
    let subtotal = 0;
    
    currentCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toLocaleString()} ₸ × ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <span class="cart-item-total">${itemTotal.toLocaleString()} ₸</span>
                <button class="btn-outline remove-from-cart" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Добавляем обработчики для кнопок удаления
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
    
    // Активируем кнопку оформления заказа
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
    }
    
   const total = subtotal;
   cartTotalPrice.textContent = `${total.toLocaleString()} ₸`;

}

// Функция удаления из корзины - ИСПРАВЛЕННАЯ ВЕРСИЯ
function removeFromCart(productId) {
    // Получаем актуальные данные из localStorage
    let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Фильтруем корзину, удаляя товар с указанным ID
    currentCart = currentCart.filter(item => item.id !== productId);
    
    // Сохраняем обновленную корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Обновляем глобальную переменную
    cart = currentCart;
    
    // Обновляем счетчик корзины
    updateCartCount();
    
    // Обновляем модальное окно корзины
    updateCartModal();
    
    // Показываем уведомление
    showNotification('Товар удален из корзины', 'info');
    
    // Если корзина пуста, закрываем модальное окно через 1 секунду
    if (currentCart.length === 0) {
        setTimeout(() => {
            const cartModal = document.getElementById('cart-modal');
            if (cartModal) {
                cartModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }, 1000);
    }
}

// Функция инициализации поиска и фильтрации
function initSearchAndFilter() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    const categoryFilter = document.getElementById('category-filter');
    
    // Обработчик поиска
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Поиск при вводе с задержкой
        searchInput.addEventListener('input', debounce(performSearch, 500));
    }
    
    // Обработчик фильтрации по категории
    if (categoryFilter) {
        categoryFilter.addEventListener('change', performSearch);
    }
}

// Функция выполнения поиска и фильтрации
async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    try {
        // Загружаем все товары
        const response = await fetch('products.json');
        let products = await response.json();
        
        // Применяем поиск
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Применяем фильтрацию по категории
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        if (selectedCategory) {
            products = products.filter(product => product.category === selectedCategory);
        }
        
        // Отображаем отфильтрованные товары
        displayProducts(products);
    } catch (error) {
        console.error('Ошибка при поиске товаров:', error);
        // В случае ошибки используем тестовые данные
        const testProducts = getTestProducts();
        
        // Применяем фильтрацию к тестовым данным
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        
        let filteredProducts = testProducts;
        
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
        }
        
        displayProducts(filteredProducts);
    }
}

// Функция debounce для оптимизации поиска
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Функция инициализации кнопки оформления заказа
function initCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (currentCart.length === 0) {
                showNotification('Корзина пуста. Добавьте товары перед оформлением заказа.', 'error');
                return;
            }
            
            // Сохраняем корзину в sessionStorage перед переходом
            sessionStorage.setItem('checkoutCart', JSON.stringify(currentCart));
            sessionStorage.setItem('cartTotal', getCartTotal().toString());
            
            console.log('Корзина сохранена:', currentCart);
            
            // Переходим на страницу оформления доставки
            window.location.href = 'delivery.html';
        });
    }
}

// Функция расчета общей суммы
function getCartTotal() {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    return currentCart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Добавляем в тело документа
    document.body.appendChild(notification);
    
    // Обработчик закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Тестовые данные для товаров
function getTestProducts() {
    return [
        {
            id: '1',
            name: 'Парацетамол',
            description: 'Обезболивающее и жаропонижающее средство',
            price: 450,
            category: 'pain',
            dosage: '500 мг',
            quantity: '20 таблеток',
            image: 'https://via.placeholder.com/200x150?text=Парацетамол'
        },
        {
            id: '2',
            name: 'Ибупрофен',
            description: 'Противовоспалительное и обезболивающее средство',
            price: 650,
            category: 'pain',
            dosage: '400 мг',
            quantity: '24 таблетки',
            image: 'https://via.placeholder.com/200x150?text=Ибупрофен'
        },
        {
            id: '3',
            name: 'Витамин C',
            description: 'Иммуностимулирующее средство',
            price: 1200,
            category: 'vitamins',
            dosage: '1000 мг',
            quantity: '30 таблеток',
            image: 'https://via.placeholder.com/200x150?text=Витамин+C'
        }
    ];
}

// Добавляем CSS анимации для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .no-products-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }
    
    .no-products-message i {
        font-size: 3rem;
        margin-bottom: 15px;
        color: #ccc;
    }
    
    .no-products-message h3 {
        margin-bottom: 10px;
        color: #333;
    }
`;
document.head.appendChild(notificationStyles);
// Оформление заказа
const checkoutBtn = document.getElementById('checkout-btn');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('medai_user'));

        if (!user) {
            alert('Войдите или зарегистрируйтесь');
            return;
        }

        if (!user.orders) {
            user.orders = [];
        }

        const totalPriceEl = document.getElementById('cart-total-price');

        const order = {
            id: Date.now(),
            total: totalPriceEl ? totalPriceEl.innerText : '0 ₸',
            date: new Date().toLocaleString(),
        };

        user.orders.push(order);
        localStorage.setItem('medai_user', JSON.stringify(user));

        alert('Заказ оформлен!');
    });
}
