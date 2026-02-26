// Chat functionality
document.addEventListener('DOMContentLoaded', function() {
    // База данных лекарств
    const medicineDB = {
        'головная боль': [
            {
                name: 'Ибупрофен',
                price: '50-150 ₽',
                description: 'Снимает боль и воспаление',
                dosage: 'По 200-400 мг каждые 4-6 часов',
                side: 'Может раздражать желудок'
            },
            {
                name: 'Парацетамол',
                price: '30-100 ₽',
                description: 'Снижает температуру и боль',
                dosage: 'По 500 мг каждые 4-6 часов',
                side: 'Безопасен для желудка'
            },
            {
                name: 'Цитрамон',
                price: '40-80 ₽',
                description: 'Комбинированный препарат',
                dosage: '1-2 таблетки',
                side: 'Содержит кофеин'
            }
        ],
        'температура': [
            {
                name: 'Парацетамол',
                price: '30-100 ₽',
                description: 'Основное жаропонижающее',
                dosage: '500-1000 мг каждые 4-6 часов',
                side: 'Не превышать 4 г в сутки'
            },
            {
                name: 'Ибупрофен',
                price: '50-150 ₽',
                description: 'Против воспаления и температуры',
                dosage: '200-400 мг 3-4 раза в день',
                side: 'Осторожно при проблемах с желудком'
            },
            {
                name: 'Аспирин',
                price: '40-120 ₽',
                description: 'Ацетилсалициловая кислота',
                dosage: '500 мг каждые 4-6 часов',
                side: 'Не давать детям до 12 лет'
            }
        ],
        'кашель': [
            {
                name: 'Амброксол',
                price: '80-200 ₽',
                description: 'Разжижает мокроту',
                dosage: '30 мг 3 раза в день',
                side: 'Редко - тошнота'
            },
            {
                name: 'Бромгексин',
                price: '40-120 ₽',
                description: 'Отхаркивающее средство',
                dosage: '8-16 мг 3 раза в день',
                side: 'Иногда головокружение'
            },
            {
                name: 'Мукалтин',
                price: '20-60 ₽',
                description: 'На основе алтея',
                dosage: '1-2 таблетки 3 раза в день',
                side: 'Натуральный, редко аллергия'
            }
        ],
        'горло': [
            {
                name: 'Стрепсилс',
                price: '150-250 ₽',
                description: 'Пастилки для горла',
                dosage: 'Каждые 2-3 часа',
                side: 'Редко аллергия'
            },
            {
                name: 'Гексорал',
                price: '200-350 ₽',
                description: 'Спрей-антисептик',
                dosage: '2 раза в день',
                side: 'Временный эффект на вкус'
            },
            {
                name: 'Лизобакт',
                price: '250-400 ₽',
                description: 'Таблетки для рассасывания',
                dosage: '2 таблетки 3-4 раза',
                side: 'Безопасен, можно детям'
            }
        ],
        'насморк': [
            {
                name: 'Називин',
                price: '150-250 ₽',
                description: 'Сосудосуживающие капли',
                dosage: '1-2 капли 2-3 раза',
                side: 'Не более 5-7 дней'
            },
            {
                name: 'Пиносол',
                price: '120-200 ₽',
                description: 'На основе масел',
                dosage: '1-2 капли 3-4 раза',
                side: 'Натуральный состав'
            }
        ]
    };

    // DOM элементы
    const chatContainer = document.getElementById('chat');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const quickBtns = document.querySelectorAll('.quick-btn');

    // Инициализация чата
    function initChat() {
        // Добавляем приветственное сообщение через 2 секунды
        setTimeout(() => {
            addMessage('Чтобы начать, напишите вопрос о лекарствах или нажмите на одну из кнопок выше.', 'bot');
        }, 2000);
        
        // Назначаем обработчики для кнопок быстрого доступа
        quickBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const question = this.getAttribute('data-question');
                if (question) {
                    askQuestion(question);
                }
            });
        });
        
        // Обработчик кнопки отправки
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        // Обработчик нажатия Enter
        if (userInput) {
            userInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
    }

    // Функция отправки сообщения
    function sendMessage() {
        if (!userInput) return;
        
        const message = userInput.value.trim();
        
        if (message === '') return;
        
        // Показываем сообщение пользователя
        addMessage(message, 'user');
        userInput.value = '';
        
        // Имитируем задержку ответа
        setTimeout(() => {
            const response = getResponse(message);
            addMessage(response, 'bot');
        }, 800);
    }

    // Функция быстрого вопроса
    function askQuestion(question) {
        if (userInput && question) {
            userInput.value = question;
            sendMessage();
        }
    }

    // Добавление сообщения в чат
    function addMessage(text, sender) {
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = text;
        
        messageDiv.appendChild(contentDiv);
        
        // Добавляем время
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = getCurrentTime();
        messageDiv.appendChild(timeDiv);
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Генерация ответа
    function getResponse(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        
        // Проверяем категории
        for (const [category, medicines] of Object.entries(medicineDB)) {
            if (lowerMsg.includes(category.split(' ')[0])) {
                let response = `<strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong><br><br>`;
                
                medicines.forEach(med => {
                    response += `
                        <div class="medicine-card">
                            <div class="medicine-name">${med.name}</div>
                            <div class="medicine-desc">${med.description}</div>
                            <div class="medicine-desc"><strong>Дозировка:</strong> ${med.dosage}</div>
                            <div class="medicine-price">${med.price}</div>
                            <div class="medicine-desc"><small>${med.side}</small></div>
                        </div>
                    `;
                });
                
                response += '<br><em>Цены ориентировочные. Точную стоимость уточняйте в аптеках.</em>';
                return response;
            }
        }
        
        // Общие ответы
        if (lowerMsg.includes('привет') || lowerMsg.includes('здравств')) {
            return 'Здравствуйте! Чем могу помочь? Спросите о лекарствах или используйте кнопки быстрого доступа.';
        }
        
        if (lowerMsg.includes('цена') || lowerMsg.includes('стоимость')) {
            return 'Примерные цены: парацетамол 30-100 ₽, ибупрофен 50-150 ₽, аспирин 40-120 ₽. Уточните конкретное лекарство для точной информации.';
        }
        
        if (lowerMsg.includes('спасибо')) {
            return 'Пожалуйста! Будьте здоровы. Не забывайте консультироваться с врачом перед приемом лекарств.';
        }
        
        return 'Я могу помочь с информацией о лекарствах от: головной боли, температуры, кашля, боли в горле или насморка. Спросите конкретнее!';
    }

    // Получение текущего времени
    function getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0');
    }

    // Инициализируем чат при загрузке страницы
    initChat();
});