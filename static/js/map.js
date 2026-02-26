// js/map.js
let map;

// Данные аптек по городам
const pharmaciesData = {
    'almaty': [
        {
            id: 1,
            name: 'Аптека №1',
            coordinates: [43.238949, 76.889709],
            address: 'ул. Абая, 12',
            hours: '09:00 - 22:00',
            phone: '+7 (727) 123-45-67'
        },
        {
            id: 2,
            name: 'Аптека №2',
            coordinates: [43.256670, 76.928609],
            address: 'пр. Аль-Фараби, 77',
            hours: '08:00 - 23:00',
            phone: '+7 (727) 123-45-68'
        }
    ],
    'astana': [
        {
            id: 3,
            name: 'Аптека №3',
            coordinates: [51.169392, 71.449074],
            address: 'ул. Бейбитшилик, 10',
            hours: '09:00 - 21:00',
            phone: '+7 (717) 123-45-67'
        },
        {
            id: 4,
            name: 'Аптека №4',
            coordinates: [51.128207, 71.430566],
            address: 'пр. Кабанбай батыра, 25',
            hours: '08:00 - 22:00',
            phone: '+7 (717) 123-45-68'
        }
    ],
    'shymkent': [
        {
            id: 5,
            name: 'Аптека №5',
            coordinates: [42.341700, 69.590100],
            address: 'ул. Казыбек би, 15',
            hours: '08:00 - 20:00',
            phone: '+7 (725) 123-45-67'
        }
    ]
};

// Координаты центров городов
const cityCoordinates = {
    'almaty': [43.238949, 76.889709],
    'astana': [51.169392, 71.449074],
    'shymkent': [42.341700, 69.590100],
    'karaganda': [49.805400, 73.087200],
    'aktobe': [50.283300, 57.166700],
    'taraz': [42.900000, 71.366700],
    'pavlodar': [52.300000, 76.950000],
    'ust-kamenogorsk': [49.983300, 82.616700]
};

// Инициализация карты
function initMap() {
    console.log('Инициализация карты...');
    
    if (typeof ymaps === 'undefined') {
        console.error('Yandex Maps API не загружена');
        showMapFallback();
        return;
    }
    
    try {
        // Создаем карту с центром в Астане по умолчанию
        map = new ymaps.Map('pharmacy-map', {
            center: [51.169392, 71.449074], // Астана
            zoom: 10,
            controls: ['zoomControl', 'fullscreenControl']
        });

        console.log('Карта успешно инициализирована');
        
        // Добавляем обработчики
        setupModalHandlers();
        
    } catch (error) {
        console.error('Ошибка при инициализации карты:', error);
        showMapFallback();
    }
}

// Функция для показа заглушки если карта не работает
function showMapFallback() {
    const mapContainer = document.getElementById('pharmacy-map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="height: 400px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 8px; flex-direction: column;">
                <i class="fas fa-map" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                <p style="color: #666; margin-bottom: 10px;">Карта временно недоступна</p>
                <p style="color: #999; font-size: 14px;">Используйте список аптек ниже</p>
            </div>
        `;
    }
}

// Обновление карты по выбранному городу
function updateMapByCity(city) {
    console.log('Обновление карты для города:', city);
    
    if (!map) {
        console.error('Карта не инициализирована');
        return;
    }
    
    if (!cityCoordinates[city]) {
        console.error('Координаты для города не найдены:', city);
        return;
    }

    // Удаляем старые метки
    map.geoObjects.removeAll();
    
    // Устанавливаем центр карты
    map.setCenter(cityCoordinates[city], 12);
    
    // Добавляем метки аптек для выбранного города
    const pharmacies = pharmaciesData[city] || [];
    console.log('Найдено аптек для города', city, ':', pharmacies.length);
    
    pharmacies.forEach(pharmacy => {
        const placemark = new ymaps.Placemark(pharmacy.coordinates, {
            hintContent: pharmacy.name,
            balloonContentHeader: `<strong>${pharmacy.name}</strong>`,
            balloonContentBody: `
                <p><i class="fas fa-map-marker-alt"></i> ${pharmacy.address}</p>
                <p><i class="fas fa-clock"></i> ${pharmacy.hours}</p>
                <p><i class="fas fa-phone"></i> ${pharmacy.phone}</p>
                <button class="btn-outline" onclick="selectPharmacyFromMap(${pharmacy.id})" 
                        style="margin-top: 10px; padding: 5px 10px; border: 1px solid #007bff; color: #007bff; background: white; border-radius: 4px; cursor: pointer;">
                    Выбрать эту аптеку
                </button>
            `,
            balloonContentFooter: 'MedAI - Ваше здоровье в надёжных руках'
        }, {
            preset: 'islands#blueMedicalIcon',
            iconColor: '#007bff'
        });

        // Добавляем обработчик клика на метку
        placemark.events.add('click', function (e) {
            e.get('target').balloon.open();
        });

        map.geoObjects.add(placemark);
    });

    // Обновляем список аптек
    updatePharmacyList(city);
}

// Обновление списка аптек
function updatePharmacyList(city) {
    const pharmacyList = document.getElementById('pharmacy-list');
    const pharmacies = pharmaciesData[city] || [];
    
    if (pharmacies.length === 0) {
        pharmacyList.innerHTML = '<p>В выбранном городе пока нет аптек</p>';
        return;
    }

    let html = '<h3>Список аптек в выбранном городе</h3>';
    
    pharmacies.forEach(pharmacy => {
        html += `
            <div class="pharmacy-item" data-pharmacy-id="${pharmacy.id}" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0;">${pharmacy.name}</h4>
                <p style="margin: 5px 0;"><i class="fas fa-map-marker-alt"></i> ${pharmacy.address}</p>
                <p style="margin: 5px 0;"><i class="fas fa-clock"></i> ${pharmacy.hours}</p>
                <p style="margin: 5px 0;"><i class="fas fa-phone"></i> ${pharmacy.phone}</p>
                <button class="select-pharmacy-btn" style="margin-top: 10px; padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Выбрать эту аптеку
                </button>
            </div>
        `;
    });
    
    pharmacyList.innerHTML = html;

    // Добавляем обработчики для кнопок выбора
    document.querySelectorAll('.select-pharmacy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const pharmacyId = this.closest('.pharmacy-item').getAttribute('data-pharmacy-id');
            selectPharmacy(parseInt(pharmacyId));
        });
    });
}

// Выбор аптеки из списка
function selectPharmacy(pharmacyId) {
    console.log('Выбор аптеки:', pharmacyId);
    
    let selectedPharmacy = null;
    let selectedCity = null;
    
    for (const [city, pharmacies] of Object.entries(pharmaciesData)) {
        const pharmacy = pharmacies.find(p => p.id === pharmacyId);
        if (pharmacy) {
            selectedPharmacy = pharmacy;
            selectedCity = city;
            break;
        }
    }
    
    if (selectedPharmacy && selectedCity) {
        // Обновляем выпадающий список
        const citySelect = document.getElementById('city');
        const pharmacySelect = document.getElementById('pharmacy');
        
        citySelect.value = selectedCity;
        populatePharmacies(selectedCity);
        pharmacySelect.value = pharmacyId;
        
        // Закрываем модальное окно
        document.getElementById('map-modal').style.display = 'none';
        
        alert(`Выбрана аптека: ${selectedPharmacy.name}`);
    }
}

// Выбор аптеки с карты (глобальная функция)
window.selectPharmacyFromMap = function(pharmacyId) {
    selectPharmacy(pharmacyId);
};

// Настройка обработчиков модального окна
function setupModalHandlers() {
    console.log('Настройка обработчиков модального окна...');
    
    // Кнопка показа карты
    const showMapBtn = document.getElementById('show-map-btn');
    if (showMapBtn) {
        showMapBtn.addEventListener('click', function() {
            console.log('Кнопка "Показать на карте" нажата');
            
            const city = document.getElementById('city').value;
            console.log('Выбранный город:', city);
            
            if (!city) {
                alert('Пожалуйста, сначала выберите город');
                return;
            }
            
            const modal = document.getElementById('map-modal');
            if (modal) {
                modal.style.display = 'block';
                console.log('Модальное окно открыто');
                
                // Даем небольшую задержку для отображения модального окна
                setTimeout(() => {
                    updateMapByCity(city);
                }, 100);
                
            } else {
                console.error('Модальное окно не найдено');
            }
        });
    } else {
        console.error('Кнопка "Показать на карте" не найдена');
    }

    // Закрытие модального окна
    const modalClose = document.querySelector('#map-modal .modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            document.getElementById('map-modal').style.display = 'none';
        });
    } else {
        console.error('Кнопка закрытия модального окна не найдена');
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('map-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Функция для заполнения списка аптек в форме
function populatePharmacies(city) {
    const pharmacySelect = document.getElementById('pharmacy');
    const pharmacies = pharmaciesData[city] || [];
    
    pharmacySelect.innerHTML = '';
    
    if (pharmacies.length === 0) {
        pharmacySelect.innerHTML = '<option value="">В выбранном городе нет аптек</option>';
        pharmacySelect.disabled = true;
        return;
    }
    
    pharmacySelect.disabled = false;
    pharmacySelect.innerHTML = '<option value="">Выберите аптеку</option>';
    
    pharmacies.forEach(pharmacy => {
        const option = document.createElement('option');
        option.value = pharmacy.id;
        option.textContent = `${pharmacy.name} - ${pharmacy.address}`;
        pharmacySelect.appendChild(option);
    });
}

// Основная инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация карты...');
    
    // Обработчик изменения города
    const citySelect = document.getElementById('city');
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            populatePharmacies(this.value);
        });
    }

    // Инициализация карты
    if (typeof ymaps !== 'undefined') {
        ymaps.ready(function() {
            console.log('Yandex Maps API готова');
            initMap();
        });
    } else {
        console.error('Yandex Maps API не загружена');
        showMapFallback();
    }
});
// Инициализация карты для выбора адреса доставки
let addressMap;
let addressPlacemark;
let selectedAddress = '';

function initAddressMap() {
    addressMap = new ymaps.Map('address-map', {
        center: [51.1694, 71.4491], // Центр по умолчанию (Астана)
        zoom: 12
    });

    // Обработчик клика по карте
    addressMap.events.add('click', function (e) {
        const coords = e.get('coords');
        
        // Удаляем предыдущую метку
        if (addressPlacemark) {
            addressMap.geoObjects.remove(addressPlacemark);
        }

        // Создаем новую метку
        addressPlacemark = new ymaps.Placemark(coords, {}, {
            preset: 'islands#redIcon',
            draggable: true
        });

        addressMap.geoObjects.add(addressPlacemark);

        // Получаем адрес по координатам
        ymaps.geocode(coords).then(function (res) {
            const firstGeoObject = res.geoObjects.get(0);
            selectedAddress = firstGeoObject.getAddressLine();
            
            // Обновляем информацию о выбранном адресе
            document.getElementById('confirmed-address-text').textContent = selectedAddress;
            document.getElementById('address-confirm-section').style.display = 'block';
            
            // Показываем балун с адресом
            addressPlacemark.properties.set('balloonContentBody', selectedAddress);
            addressPlacemark.balloon.open();
        });

        // Обработчик перемещения метки
        addressPlacemark.events.add('dragend', function () {
            const newCoords = addressPlacemark.geometry.getCoordinates();
            ymaps.geocode(newCoords).then(function (res) {
                const firstGeoObject = res.geoObjects.get(0);
                selectedAddress = firstGeoObject.getAddressLine();
                
                document.getElementById('confirmed-address-text').textContent = selectedAddress;
                addressPlacemark.properties.set('balloonContentBody', selectedAddress);
            });
        });
    });

    // Поиск адреса
    document.getElementById('search-address-btn').addEventListener('click', function() {
        const searchQuery = document.getElementById('address-search').value;
        
        if (!searchQuery) return;

        ymaps.geocode(searchQuery).then(function (res) {
            const firstGeoObject = res.geoObjects.get(0);
            const coords = firstGeoObject.geometry.getCoordinates();
            
            // Перемещаем карту к найденному адресу
            addressMap.setCenter(coords, 17);
            
            // Удаляем предыдущую метку
            if (addressPlacemark) {
                addressMap.geoObjects.remove(addressPlacemark);
            }

            // Создаем новую метку
            addressPlacemark = new ymaps.Placemark(coords, {}, {
                preset: 'islands#redIcon',
                draggable: true
            });

            addressMap.geoObjects.add(addressPlacemark);
            
            selectedAddress = firstGeoObject.getAddressLine();
            document.getElementById('confirmed-address-text').textContent = selectedAddress;
            document.getElementById('address-confirm-section').style.display = 'block';
            
            addressPlacemark.properties.set('balloonContentBody', selectedAddress);
            addressPlacemark.balloon.open();
        });
    });

    // Подтверждение выбора адреса
    document.getElementById('confirm-address-btn').addEventListener('click', function() {
        if (selectedAddress) {
            document.getElementById('address').value = selectedAddress;
            document.getElementById('address-text').textContent = selectedAddress;
            document.getElementById('selected-address-preview').style.display = 'block';
            
            // Пересчитываем стоимость доставки
            calculateDeliveryCost();
            
            // Закрываем модальное окно
            closeModal('address-map-modal');
        }
    });

    // Кнопка изменения адреса
    document.getElementById('change-address-btn').addEventListener('click', function() {
        openModal('address-map-modal');
    });
}

// Обработчик открытия модального окна выбора адреса
document.getElementById('open-address-map-btn').addEventListener('click', function() {
    openModal('address-map-modal');
});

// Поиск при нажатии Enter
document.getElementById('address-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('search-address-btn').click();
    }
});

// Функция для расчета стоимости доставки
function calculateDeliveryCost() {
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    let deliveryCost = 0;

    if (address && city) {
        // Базовая стоимость доставки
        deliveryCost = 500; // 500 тенге
        
        // Если адрес за пределами центра, увеличиваем стоимость
        if (address.includes('окраина') || address.includes('микрорайон') || address.includes('поселок')) {
            deliveryCost = 800;
        }
        
        // Бесплатная доставка от определенной суммы
        const itemsTotal = 4500; // Пример общей стоимости товаров
        if (itemsTotal > 10000) {
            deliveryCost = 0;
        }
    }

    document.getElementById('delivery-cost').textContent = deliveryCost + ' Тенге.';
    updateOrderTotal();
}

// Функция обновления итоговой суммы
function updateOrderTotal() {
    const itemsTotal = 4500; // Пример стоимости товаров
    const deliveryCostText = document.getElementById('delivery-cost').textContent;
    const deliveryCost = parseInt(deliveryCostText) || 0;
    const total = itemsTotal + deliveryCost;
    
    document.getElementById('order-total').textContent = total.toLocaleString() + ' Тенге.';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем минимальную дату доставки (завтра)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('delivery-date').min = minDate;
    
    // Инициализация карты адреса
    ymaps.ready(initAddressMap);
});
// main.js - добавьте эти функции если их нет

// Базовые функции для модальных окон
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Закрытие модальных окон при клике на крестик
document.addEventListener('DOMContentLoaded', function() {
    // Закрытие всех модальных окон при клике на крестик
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Закрытие при клике вне модального окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
});