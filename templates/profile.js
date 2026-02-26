const isAuth = localStorage.getItem('medai_isAuth');
const user = JSON.parse(localStorage.getItem('medai_user'));

if (!isAuth || !user) {
    window.location.href = 'index.html';
}

document.getElementById('profile-name').innerText =
    `Здравствуйте, ${user.fullname}`;

document.getElementById('profile-id').innerText =
    `ID пользователя: ${user.id}`;

const ordersBlock = document.getElementById('orders');

if (user.orders.length === 0) {
    ordersBlock.innerHTML = '<p>Заказов пока нет</p>';
} else {
    user.orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-card';
        div.innerHTML = `
            <p><strong>Заказ №${order.id}</strong></p>
            <p>Сумма: ${order.total} ₸</p>
            <p>Дата: ${order.date}</p>
        `;
        ordersBlock.appendChild(div);
    });
}
