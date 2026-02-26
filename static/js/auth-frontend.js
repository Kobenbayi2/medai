// frontend/js/auth-fronted.js

class AuthService {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('medai_user'));
        this.isAuth = localStorage.getItem('medai_isAuth') === 'true';
        this.init();
    }

    init() {
        this.setupEvents();
        this.updateUI();
        this.setupPasswordToggles();
    }

    setupEvents() {
        document.getElementById('login-btn')?.addEventListener('click', () => this.showModal('login-modal'));
        document.getElementById('register-btn')?.addEventListener('click', () => this.showModal('register-modal'));

        document.getElementById('show-register')?.addEventListener('click', e => {
            e.preventDefault();
            this.switchModal('login-modal', 'register-modal');
        });

        document.getElementById('show-login')?.addEventListener('click', e => {
            e.preventDefault();
            this.switchModal('register-modal', 'login-modal');
        });

        document.getElementById('login-form')?.addEventListener('submit', e => this.login(e));
        document.getElementById('register-form')?.addEventListener('submit', e => this.register(e));

        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

        document.querySelectorAll('.modal-close').forEach(btn =>
            btn.addEventListener('click', () => this.closeModals())
        );

        window.addEventListener('click', e => {
            if (e.target.classList.contains('modal')) this.closeModals();
        });
    }

    setupPasswordToggles() {
        this.togglePassword('login-password', 'login-password-toggle');
        this.togglePassword('register-password', 'register-password-toggle');
    }

    togglePassword(inputId, btnId) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);

        if (!input || !btn) return;

        btn.onclick = () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            btn.querySelector('i').className =
                input.type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
        };
    }

    showModal(id) {
        this.closeModals();
        document.getElementById(id).style.display = 'block';
    }

    switchModal(from, to) {
        document.getElementById(from).style.display = 'none';
        document.getElementById(to).style.display = 'block';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }

    register(e) {
        e.preventDefault();

        const user = {
            id: Date.now(),
            fullname: document.getElementById('register-fullname').value.trim(),
            identifier: document.getElementById('register-identifier').value.trim(),
            password: document.getElementById('register-password').value,
            orders: []
        };

        if (!user.fullname || !user.identifier || user.password.length < 6) {
            this.notify('Заполните все поля (пароль ≥ 6)', 'error');
            return;
        }

        localStorage.setItem('medai_user', JSON.stringify(user));
        localStorage.setItem('medai_isAuth', 'true');

        this.user = user;
        this.isAuth = true;

        this.closeModals();
        this.updateUI();
        this.notify('Регистрация успешна! 🎉', 'success');
    }

    login(e) {
        e.preventDefault();

        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;

        const savedUser = JSON.parse(localStorage.getItem('medai_user'));

        if (!savedUser || savedUser.identifier !== identifier || savedUser.password !== password) {
            this.notify('Неверные данные', 'error');
            return;
        }

        localStorage.setItem('medai_isAuth', 'true');
        this.user = savedUser;
        this.isAuth = true;

        this.closeModals();
        this.updateUI();
        this.notify('Вы вошли в аккаунт', 'success');
    }

    logout() {
        localStorage.removeItem('medai_isAuth');
        this.user = null;
        this.isAuth = false;
        this.updateUI();
        this.notify('Вы вышли из аккаунта', 'info');
    }

    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const profile = document.getElementById('user-profile');
        const name = document.getElementById('user-display-name');

        if (this.isAuth && this.user) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            profile.style.display = 'flex';
            name.textContent = this.user.fullname;
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            profile.style.display = 'none';
        }
    }

    notify(text, type) {
        alert(text); // можно заменить на красивый toast
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authService = new AuthService();
});
// ...existing code...
const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
});
const registerData = await registerResponse.json();

const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
});
const loginData = await loginResponse.json();
// ...existing code...);
