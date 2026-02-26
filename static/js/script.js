// Функция показа модального окна
function showModal(title, image, description, instruction, price, category) {
    const modal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalInstruction = document.getElementById('modalInstruction');
    const modalPrice = document.getElementById('modalPrice');
    
    // Устанавливаем данные
    modalImage.src = image;
    modalImage.alt = title;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalInstruction.textContent = instruction;
    modalPrice.textContent = price.toLocaleString() + ' ₸';
    
    // Показываем модальное окно
    modal.style.display = 'block';
    
    // Анимация появления
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Блокируем прокрутку фона
    document.body.style.overflow = 'hidden';
}

// Функция закрытия модального окна
function closeModal() {
    const modal = document.getElementById('productModal');
    
    // Анимация исчезновения
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        // Восстанавливаем прокрутку
        document.body.style.overflow = 'auto';
    }, 300);
}

// Закрытие модального окна при клике вне его
document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Закрытие модального окна по клавише Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Обработчики для кнопок "В корзину" в карточках
document.querySelectorAll('.product-card .btn-primary').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); // Предотвращаем открытие модального окна
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        
        alert(`Товар "${productName}" добавлен в корзину!\nЦена: ${productPrice}`);
    });
});

// Обработчик для кнопки в модальном окне
document.querySelector('.modal-footer .btn-primary').addEventListener('click', function() {
    const productName = document.getElementById('modalTitle').textContent;
    const productPrice = document.getElementById('modalPrice').textContent;
    
    alert(`Товар "${productName}" добавлен в корзину!\nЦена: ${productPrice}`);
    closeModal();
});