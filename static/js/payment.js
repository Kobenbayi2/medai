// Функционал прикрепления карты
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethodSelect = document.getElementById('payment-method');
    const cardAttachmentSection = document.getElementById('card-attachment-section');
    const attachCardBtn = document.getElementById('attach-card-btn');
    const cardModal = document.getElementById('card-modal');
    const cardForm = document.getElementById('card-form');
    const cardInfo = document.getElementById('card-info');
    const cardNumberDisplay = document.getElementById('card-number');
    const modalClose = document.querySelectorAll('.modal-close');
    
    // Обработчик изменения способа оплаты
    paymentMethodSelect.addEventListener('change', function() {
        if (this.value === 'card') {
            cardAttachmentSection.style.display = 'block';
        } else {
            cardAttachmentSection.style.display = 'none';
        }
    });
    
    // Открытие модального окна прикрепления карты
    attachCardBtn.addEventListener('click', function() {
        cardModal.style.display = 'block';
    });
    
    // Закрытие модальных окон
    modalClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Обработчик формы прикрепления карты
    cardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // В реальном приложении здесь будет отправка данных в платежную систему
        // Для демо просто имитируем успешное прикрепление карты
        
        const cardNumber = document.getElementById('card-number-input').value;
        const lastFourDigits = cardNumber.replace(/\s/g, '').slice(-4);
        
        // Обновляем отображение информации о карте
        cardNumberDisplay.textContent = `**** **** **** ${lastFourDigits}`;
        cardInfo.style.display = 'block';
        
        // Закрываем модальное окно
        cardModal.style.display = 'none';
        
        // Меняем текст кнопки
        attachCardBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Изменить карту';
        
        // Показываем уведомление
        alert('Карта успешно прикреплена!');
    });
    
    // Форматирование номера карты
    const cardNumberInput = document.getElementById('card-number-input');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let matches = value.match(/\d{4,16}/g);
            let match = matches && matches[0] || '';
            let parts = [];
            
            for (let i = 0; i < match.length; i += 4) {
                parts.push(match.substring(i, i + 4));
            }
            
            if (parts.length) {
                this.value = parts.join(' ');
            } else {
                this.value = value;
            }
        });
    }
    
    // Форматирование срока действия карты
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                this.value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
        });
    }
    
    // Ограничение ввода для CVC
    const cardCvcInput = document.getElementById('card-cvc');
    if (cardCvcInput) {
        cardCvcInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }
});