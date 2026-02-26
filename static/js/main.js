// Основной JavaScript файл для проекта MedAI

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация прелоадера
    initPreloader();
    
    // Инициализация навигации
    initNavigation();
    
    // Инициализация модальных окон
    initModals();
    
    // Инициализация форм
    initForms();
    
    // Инициализация FAQ аккордеона
    initFAQ();
    
    // Инициализация корзины
    initCart();
});

// Функция инициализации прелоадера
function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    if (preloader) {
        // Скрываем прелоадер после загрузки страницы
        window.addEventListener('load', function() {
            setTimeout(function() {
                preloader.classList.add('fade-out');
                setTimeout(function() {
                    preloader.style.display = 'none';
                }, 500);
            }, 1000);
        });
    }
}

// Функция инициализации навигации
function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav ul');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('show');
        });
    }
    
    // Закрытие меню при клике на ссылку
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (nav.classList.contains('show')) {
                nav.classList.remove('show');
            }
        });
    });
}

// Функция инициализации модальных окон
function initModals() {
    // Закрытие модальных окон при клике на крестик
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Функция инициализации форм
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Простая валидация формы
            if (validateForm(this)) {
                // Имитация отправки формы
                showNotification('Форма успешно отправлена!', 'success');
                this.reset();
            } else {
                showNotification('Пожалуйста, заполните все обязательные поля правильно.', 'error');
            }
        });
    });
}

// Функция валидации формы
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
        
        // Специфическая валидация для email
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                field.classList.add('error');
            }
        }
        
        // Специфическая валидация для телефона
        if (field.type === 'tel') {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(field.value)) {
                isValid = false;
                field.classList.add('error');
            }
        }
    });
    
    return isValid;
}

// Функция показа уведомления
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Цвета в зависимости от типа
    if (type === 'success') {
        notification.style.backgroundColor = '#4caf50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else {
        notification.style.backgroundColor = '#2196f3';
    }
    
    // Добавляем уведомление на страницу
    document.body.appendChild(notification);
    
    // Удаляем уведомление после анимации
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Функция инициализации FAQ аккордеона
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Закрываем все открытые элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Переключаем текущий элемент
            item.classList.toggle('active');
        });
    });
}

// Функция инициализации корзины
function initCart() {
    // Инициализируем корзину в localStorage, если ее нет
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Обновляем счетчик корзины
    updateCartCount();
}

// Функция обновления счетчика корзины
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Глобальные функции для работы с модальными окнами
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};
// Инициализация аутентификации
function initAuth() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Обработчики кнопок
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal('login-modal'));
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => openModal('register-modal'));
    }
    
    // Обработчики форм
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Переключение между модальными окнами
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login-modal');
        openModal('register-modal');
    });
    
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('register-modal');
        openModal('login-modal');
    });
    
    // Обновление интерфейса в зависимости от статуса авторизации
    updateAuthUI();
}

// Обработчик входа
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await authService.login({ email, password });
        closeModal('login-modal');
        updateAuthUI();
    } catch (error) {
        console.error('Ошибка входа:', error);
    }
}

// Обработчик регистрации
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('register-fullname').value,
        email: document.getElementById('register-email').value,
        phone: document.getElementById('register-phone').value,
        password: document.getElementById('register-password').value,
        dateOfBirth: document.getElementById('register-birthdate').value || undefined
    };
    
    try {
        await authService.register(formData);
        closeModal('register-modal');
        updateAuthUI();
    } catch (error) {
        console.error('Ошибка регистрации:', error);
    }
}

// Обновление UI в зависимости от статуса авторизации
function updateAuthUI() {
    const headerActions = document.querySelector('.header-actions');
    const user = authService.getUser();
    
    if (headerActions && user) {
        headerActions.innerHTML = `
            <div class="user-menu">
                <span>Привет, ${user.fullName}</span>
                <div class="dropdown">
                    <button class="btn-outline">
                        <i class="fas fa-user"></i> Мой профиль
                    </button>
                    <div class="dropdown-content">
                        <a href="#" onclick="authService.logout()">Выйти</a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Добавьте вызов в DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    initNavigation();
    initModals();
    initForms();
    initFAQ();
    initCart();
    initAuth(); // Добавьте эту строку
});
// Функции для модальных окон аутентификации
document.addEventListener('DOMContentLoaded', function() {
    // Элементы модальных окон
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const closeButtons = document.querySelectorAll('.modal-close');

    // Функции переключения видимости пароля
    function setupPasswordToggle(passwordInputId, toggleButtonId) {
        const passwordInput = document.getElementById(passwordInputId);
        const toggleButton = document.getElementById(toggleButtonId);
        
        if (passwordInput && toggleButton) {
            toggleButton.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Меняем иконку
                const icon = this.querySelector('i');
                if (type === 'text') {
                    icon.className = 'fas fa-eye-slash';
                    this.title = 'Скрыть пароль';
                } else {
                    icon.className = 'fas fa-eye';
                    this.title = 'Показать пароль';
                }
            });
        }
    }

    // Настройка переключения паролей
    setupPasswordToggle('login-password', 'login-password-toggle');
    setupPasswordToggle('register-password', 'register-password-toggle');

    // Функции открытия/закрытия модальных окон
    function openLoginModal() {
        loginModal.style.display = 'block';
        registerModal.style.display = 'none';
    }

    function openRegisterModal() {
        registerModal.style.display = 'block';
        loginModal.style.display = 'none';
    }

    function closeModals() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }

    // Обработчики событий
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (registerBtn) registerBtn.addEventListener('click', openRegisterModal);
    if (showRegister) showRegister.addEventListener('click', openRegisterModal);
    if (showLogin) showLogin.addEventListener('click', openLoginModal);

    // Закрытие модальных окон
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Закрытие при клике вне модального окна
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) closeModals();
        if (event.target === registerModal) closeModals();
    });

    // Обработка формы входа
    document.getElementById('login-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;
        
        // Определяем, что ввел пользователь - email или телефон
        const isEmail = identifier.includes('@');
        const loginData = {
            [isEmail ? 'email' : 'phone']: identifier,
            password: password
        };

        console.log('Данные для входа:', loginData);
        
        // Здесь будет отправка на сервер
        // fetch('/api/auth/login', { ... })
        
        alert('Форма входа отправлена!');
        closeModals();
    });

    // Обработка формы регистрации
    document.getElementById('register-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const fullname = document.getElementById('register-fullname').value;
        const identifier = document.getElementById('register-identifier').value;
        const password = document.getElementById('register-password').value;
        
        // Определяем, что ввел пользователь - email или телефон
        const isEmail = identifier.includes('@');
        const registerData = {
            fullname: fullname,
            [isEmail ? 'email' : 'phone']: identifier,
            password: password
        };

        console.log('Данные для регистрации:', registerData);
        
        // Здесь будет отправка на сервер
        // fetch('/api/auth/register', { ... })
        
        alert('Форма регистрации отправлена!');
        closeModals();
    });

    // Валидация в реальном времени для идентификатора
    const identifierInputs = document.querySelectorAll('input[type="text"][id*="identifier"]');
    identifierInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value) {
                const isEmail = value.includes('@');
                const isPhone = /^[\d+\-\s()]+$/.test(value);
                
                if (!isEmail && !isPhone) {
                    this.style.borderColor = '#dc3545';
                    this.title = 'Введите корректный email или номер телефона';
                } else {
                    this.style.borderColor = '#28a745';
                    this.title = '';
                }
            }
        });
    });
});
// Main functionality for header, navigation and modals
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            if (nav.style.display === 'flex') {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = 'white';
                nav.style.padding = '1rem';
                nav.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                
                const navList = nav.querySelector('ul');
                if (navList) {
                    navList.style.flexDirection = 'column';
                    navList.style.gap = '1rem';
                }
            }
        });
    }
    
    // Modal functionality
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Open login modal
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function() {
            loginModal.classList.add('active');
        });
    }
    
    // Open register modal
    if (registerBtn && registerModal) {
        registerBtn.addEventListener('click', function() {
            registerModal.classList.add('active');
        });
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
    
    // Form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Функция входа будет реализована позже');
            loginModal.classList.remove('active');
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Функция регистрации будет реализована позже');
            registerModal.classList.remove('active');
        });
    }
    
    // Set active navigation link based on current page
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    setActiveNavLink();
});