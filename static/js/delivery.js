// Новая логика расчета доставки - только по сумме заказа

document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка новой логики доставки...');
    loadCartItemsNew();
    initDeliveryFormNew();
    setMinDeliveryDateNew();
    initFormDependenciesNew();
});

function loadCartItemsNew() {
    console.log('Загрузка корзины...');
    const summaryItems = document.getElementById('summary-items');
    const itemsTotal = document.getElementById('items-total');
    const orderTotal = document.getElementById('order-total');
    const deliveryCost = document.getElementById('delivery-cost');
    
    const cart = JSON.parse(sessionStorage.getItem('checkoutCart')) || [];
    console.log('Корзина:', cart);
    
    if (cart.length === 0) {
        summaryItems.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                <p>Корзина пуста</p>
                <a href="pharmacy.html" class="btn-primary" style="margin-top: 15px; display: inline-block; padding: 10px 20px;">Вернуться в аптеку</a>
            </div>
        `;
        itemsTotal.textContent = '0 ₸';
        deliveryCost.textContent = '0 ₸';
        orderTotal.textContent = '0 ₸';
        return;
    }
    
    let total = 0;
    let itemsHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="summary-item">
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">${item.quantity} × ${item.price} ₸</span>
                </div>
                <span class="item-total">${itemTotal} ₸</span>
            </div>
        `;
    });
    
    // НОВАЯ ЛОГИКА РАСЧЕТА ДОСТАВКИ
    const currentDeliveryCost = calculateDeliveryCostNew(total);
    const finalTotal = total + currentDeliveryCost;
    
    console.log('Сумма заказа:', total, 'Доставка:', currentDeliveryCost, 'Итого:', finalTotal);
    
    summaryItems.innerHTML = itemsHTML;
    itemsTotal.textContent = `${total} ₸`;
    deliveryCost.textContent = `${currentDeliveryCost} ₸`;
    orderTotal.textContent = `${finalTotal} ₸`;
}

function calculateDeliveryCostNew(orderTotal) {
    console.log('Расчет доставки для суммы:', orderTotal);
    if (orderTotal >= 10000) {
        return 0;
    } else if (orderTotal >= 5000) {
        return 500;
    } else {
        return 700;
    }
}

function setMinDeliveryDateNew() {
    const deliveryDate = document.getElementById('delivery-date');
    if (deliveryDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        deliveryDate.min = formattedDate;
        deliveryDate.value = formattedDate;
    }
}

function initDeliveryFormNew() {
    const form = document.getElementById('delivery-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cart = JSON.parse(sessionStorage.getItem('checkoutCart')) || [];
            if (cart.length === 0) {
                alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
                return;
            }
            
            const requiredFields = ['fullname', 'phone', 'city', 'pharmacy', 'address', 'delivery-date', 'delivery-time', 'payment-method'];
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'red';
                } else if (field) {
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                alert('Пожалуйста, заполните все обязательные поля.');
                return;
            }
            
            let itemsTotal = 0;
            cart.forEach(item => {
                itemsTotal += item.price * item.quantity;
            });
            
            const deliveryCost = calculateDeliveryCostNew(itemsTotal);
            const total = itemsTotal + deliveryCost;
            
            const formData = {
                customer: {
                    fullname: document.getElementById('fullname').value,
                    phone: document.getElementById('phone').value,
                    city: document.getElementById('city').value,
                    pharmacy: document.getElementById('pharmacy').value,
                    address: document.getElementById('address').value
                },
                delivery: {
                    date: document.getElementById('delivery-date').value,
                    time: document.getElementById('delivery-time').value,
                    cost: deliveryCost
                },
                payment: {
                    method: document.getElementById('payment-method').value
                },
                comments: document.getElementById('comments').value,
                items: cart,
                totals: {
                    items: itemsTotal,
                    delivery: deliveryCost,
                    total: total
                }
            };
            
            processOrderNew(formData);
        });
    }
}

function initFormDependenciesNew() {
    const citySelect = document.getElementById('city');
    const pharmacySelect = document.getElementById('pharmacy');
    const paymentMethodSelect = document.getElementById('payment-method');
    const cardSection = document.getElementById('card-attachment-section');
    
    if (citySelect && pharmacySelect) {
        citySelect.addEventListener('change', function() {
            updatePharmaciesNew(this.value, pharmacySelect);
        });
    }
    
    if (paymentMethodSelect && cardSection) {
        paymentMethodSelect.addEventListener('change', function() {
            if (this.value === 'card') {
                cardSection.style.display = 'block';
            } else {
                cardSection.style.display = 'none';
            }
        });
    }
}

function updatePharmaciesNew(city, pharmacySelect) {
    if (!city) {
        pharmacySelect.innerHTML = '<option value="">Сначала выберите город</option>';
        pharmacySelect.disabled = true;
        return;
    }
    
    const pharmacies = {
        'almaty': [
            { id: 'apt1', name: 'Аптека №1 - ул. Абая, 123' },
            { id: 'apt2', name: 'Аптека №2 - пр. Аль-Фараби, 45' },
            { id: 'apt3', name: 'Аптека №3 - ул. Фурманова, 67' }
        ],
        'astana': [
            { id: 'apt4', name: 'Аптека №4 - ул. Бейбитшилик, 12' },
            { id: 'apt5', name: 'Аптека №5 - пр. Кабанбай батыра, 89' }
        ],
        'shymkent': [
            { id: 'apt6', name: 'Аптека №6 - ул. Туркестанская, 34' }
        ],
        'karaganda': [
            { id: 'apt7', name: 'Аптека №7 - пр. Бухар жырау, 56' }
        ],
        'aktobe': [
            { id: 'apt8', name: 'Аптека №8 - ул. Айтеке би, 78' }
        ],
        'taraz': [
            { id: 'apt9', name: 'Аптека №9 - ул. Толе би, 90' }
        ],
        'pavlodar': [
            { id: 'apt10', name: 'Аптека №10 - ул. Ломова, 11' }
        ],
        'ust-kamenogorsk': [
            { id: 'apt11', name: 'Аптека №11 - ул. Казахстанская, 22' }
        ]
    };
    
    const cityPharmacies = pharmacies[city] || [];
    pharmacySelect.innerHTML = '<option value="">Выберите аптеку</option>';
    
    cityPharmacies.forEach(pharmacy => {
        const option = document.createElement('option');
        option.value = pharmacy.id;
        option.textContent = pharmacy.name;
        pharmacySelect.appendChild(option);
    });
    
    pharmacySelect.disabled = false;
}

function processOrderNew(orderData) {
    const submitButton = document.querySelector('#delivery-form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Оформление заказа...';
    }
    
    orderData.id = 'ORD-' + Date.now();
    
    setTimeout(() => {
        saveOrderToHistoryNew(orderData);
        clearCartNew();
        
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Подтвердить заказ';
        }
        
        showSuccessMessageNew(orderData);
    }, 2000);
}

function saveOrderToHistoryNew(orderData) {
    const orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const order = {
        id: orderData.id,
        date: new Date().toISOString(),
        status: 'pending',
        ...orderData
    };
    orders.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(orders));
}

function clearCartNew() {
    localStorage.removeItem('cart');
    sessionStorage.removeItem('checkoutCart');
    sessionStorage.removeItem('cartTotal');
}

function showSuccessMessageNew(orderData) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="success-content" style="
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 500px;
            width: 90%;
        ">
            <div class="success-icon" style="font-size: 64px; color: #4CAF50; margin-bottom: 20px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: #333; margin-bottom: 15px;">Заказ успешно оформлен!</h3>
            <p>Номер вашего заказа: <strong>${orderData.id}</strong></p>
            <p>Стоимость заказа: <strong>${orderData.totals.total} ₸</strong></p>
            <p>Стоимость доставки: <strong>${orderData.totals.delivery} ₸</strong></p>
            <p>Адрес доставки: <strong>${orderData.customer.address}</strong></p>
            <p>С вами свяжется наш оператор для подтверждения заказа.</p>
            <div class="success-actions" style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
                <button class="btn-outline" id="continue-shopping">Продолжить покупки</button>
                <button class="btn-primary" id="track-order">Отслеживать заказ</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('continue-shopping').addEventListener('click', function() {
        window.location.href = 'pharmacy.html';
    });
    
    document.getElementById('track-order').addEventListener('click', function() {
        alert('Функция отслеживания заказа будет доступна в ближайшее время');
        modal.remove();
    });
}

// Переопределяем старые функции
window.calculateDeliveryCost = calculateDeliveryCostNew;
window.loadCartItems = loadCartItemsNew;