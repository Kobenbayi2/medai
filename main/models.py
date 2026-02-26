from django.db import models
from django.contrib.auth.models import User
import uuid

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('pain', 'Обезболивающие'),
        ('cold', 'От простуды'),
        ('allergy', 'От аллергии'),
        ('vitamins', 'Витамины'),
        ('digestive', 'Для пищеварения'),
        ('other', 'Другое'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(verbose_name='Описание', blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='Категория')
    icon = models.CharField(max_length=50, default='fas fa-pills', verbose_name='Иконка Font Awesome')
    stock = models.IntegerField(default=0, verbose_name='Количество на складе')
    
    # ДОБАВЛЕНО: Поле для фотографии товара
    image = models.ImageField(
        upload_to='products/',
        verbose_name='Фотография товара',
        blank=True,
        null=True,
        help_text='Загрузите фотографию товара'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
    
    def __str__(self):
        return f"{self.name} - {self.price} ₸"
    
    # ДОБАВЛЕНО: Метод для получения URL изображения или заглушки
    def get_image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return '/static/images/no-image.png'  # Заглушка если нет фото


class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Товар')
    quantity = models.IntegerField(default=1, verbose_name='Количество')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Элемент корзины'
        verbose_name_plural = 'Элементы корзины'
    
    def total_price(self):
        return self.product.price * self.quantity


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'В обработке'),
        ('confirmed', 'Подтвержден'),
        ('shipped', 'Отправлен'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменен'),
    ]
    
    PAYMENT_CHOICES = [
        ('card', 'Картой онлайн'),
        ('cash', 'Наличными'),
        ('card_on_delivery', 'Картой при получении'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    order_number = models.CharField(max_length=20, unique=True, verbose_name='Номер заказа')
    fullname = models.CharField(max_length=200, verbose_name='ФИО')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    city = models.CharField(max_length=100, verbose_name='Город')
    pharmacy = models.CharField(max_length=200, verbose_name='Аптека', blank=True)
    address = models.TextField(verbose_name='Адрес доставки')
    delivery_date = models.DateField(verbose_name='Дата доставки')
    delivery_time = models.CharField(max_length=50, verbose_name='Время доставки')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, verbose_name='Способ оплаты')
    comments = models.TextField(verbose_name='Комментарии', blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сумма заказа')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Заказ #{self.order_number} - {self.fullname}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='Заказ')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Товар')
    quantity = models.IntegerField(verbose_name='Количество')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    
    class Meta:
        verbose_name = 'Элемент заказа'
        verbose_name_plural = 'Элементы заказа'
    
    def total(self):
        return self.quantity * self.price


# НОВЫЕ МОДЕЛИ ДЛЯ СИСТЕМЫ ЗАПИСИ НА КОНСУЛЬТАЦИИ

class Hospital(models.Model):
    """Модель медицинского учреждения"""
    name = models.CharField(max_length=200, verbose_name="Название клиники")
    address = models.CharField(max_length=300, verbose_name="Адрес")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(verbose_name="Email", blank=True)
    description = models.TextField(verbose_name="Описание", blank=True)
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Клиника"
        verbose_name_plural = "Клиники"
        ordering = ['name']


class DoctorProfile(models.Model):
    """Профиль врача"""
    SPECIALTY_CHOICES = [
        ('therapist', 'Терапевт'),
        ('pediatrician', 'Педиатр'),
        ('cardiologist', 'Кардиолог'),
        ('neurologist', 'Невролог'),
        ('dermatologist', 'Дерматолог'),
        ('gastroenterologist', 'Гастроэнтеролог'),
        ('endocrinologist', 'Эндокринолог'),
        ('surgeon', 'Хирург'),
        ('other', 'Другой специалист'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, 
                                 verbose_name="Клиника")
    specialty = models.CharField(max_length=50, choices=SPECIALTY_CHOICES, 
                                verbose_name="Специальность")
    experience = models.IntegerField(verbose_name="Опыт работы (лет)", default=0)
    education = models.TextField(verbose_name="Образование", blank=True)
    description = models.TextField(verbose_name="О враче", blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=1500, 
                               verbose_name="Стоимость консультации")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    working_hours = models.JSONField(default=dict, blank=True, 
                                     verbose_name="Рабочие часы")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_specialty_display()}"
    
    class Meta:
        verbose_name = "Врач"
        verbose_name_plural = "Врачи"
        ordering = ['specialty', 'user__last_name']
    
    def get_avatar_url(self):
        """Получение URL аватара врача или заглушки"""
        # В реальном проекте можно добавить поле для фото врача
        return '/static/images/doctor-avatar.png'


class Consultation(models.Model):
    """Модель записи на консультацию"""
    STATUS_CHOICES = [
        ('waiting', 'В ожидании'),
        ('confirmed', 'Подтверждена'),
        ('in_progress', 'В процессе'),
        ('completed', 'Завершена'),
        ('cancelled', 'Отменена'),
    ]
    
    CONSULTATION_TYPES = [
        ('general', 'Общая консультация терапевта'),
        ('pediatric', 'Консультация педиатра'),
        ('cardiology', 'Консультация кардиолога'),
        ('neurology', 'Консультация невролога'),
        ('dermatology', 'Консультация дерматолога'),
        ('second_opinion', 'Второе мнение'),
        ('gastroenterology', 'Консультация гастроэнтеролога'),
        ('endocrinology', 'Консультация эндокринолога'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultations')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, 
                               related_name='doctor_consultations')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, 
                                 related_name='hospital_consultations')
    consultation_number = models.CharField(max_length=20, unique=True, blank=True, 
                                          verbose_name="Номер консультации")
    consultation_type = models.CharField(max_length=50, choices=CONSULTATION_TYPES, 
                                        verbose_name="Тип консультации")
    consultation_price = models.DecimalField(max_digits=10, decimal_places=2, 
                                            verbose_name="Стоимость")
    appointment_date = models.DateField(verbose_name="Дата приема")
    appointment_time = models.TimeField(verbose_name="Время приема")
    patient_name = models.CharField(max_length=200, verbose_name="ФИО пациента")
    birthdate = models.DateField(verbose_name="Дата рождения")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(verbose_name="Email")
    symptoms = models.TextField(verbose_name="Симптомы")
    additional_info = models.TextField(verbose_name="Дополнительная информация", blank=True)
    diagnosis = models.TextField(verbose_name="Диагноз", blank=True)
    recommendations = models.TextField(verbose_name="Рекомендации", blank=True)
    examinations = models.TextField(verbose_name="Направления на обследования", blank=True)
    next_appointment = models.DateField(null=True, blank=True, verbose_name="Следующий прием")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting',
                             verbose_name="Статус")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата завершения")
    
    def save(self, *args, **kwargs):
        if not self.consultation_number:
            # Генерируем номер консультации
            count = Consultation.objects.count() + 1
            self.consultation_number = f"CONS-{count:06d}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.consultation_number} - {self.patient_name} - {self.get_status_display()}"
    
    class Meta:
        verbose_name = "Консультация"
        verbose_name_plural = "Консультации"
        ordering = ['-appointment_date', '-appointment_time']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['doctor', 'appointment_date', 'appointment_time']),
            models.Index(fields=['consultation_number']),
        ]
    
    def get_appointment_datetime(self):
        """Получение даты и времени приема в удобном формате"""
        from django.utils import formats
        date_formatted = formats.date_format(self.appointment_date, "d E Y")
        time_formatted = self.appointment_time.strftime("%H:%M")
        return f"{date_formatted}, {time_formatted}"


class ConsultationDocument(models.Model):
    """Модель для документов, прикрепленных к консультации"""
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, 
                                     related_name='documents')
    file = models.FileField(upload_to='consultation_documents/%Y/%m/%d/', 
                            verbose_name="Файл")
    file_name = models.CharField(max_length=255, verbose_name="Название файла")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.file_name} - {self.consultation.consultation_number}"
    
    class Meta:
        verbose_name = "Документ консультации"
        verbose_name_plural = "Документы консультаций"


class DoctorSchedule(models.Model):
    """Расписание врача"""
    DAY_CHOICES = [
        (0, 'Понедельник'),
        (1, 'Вторник'),
        (2, 'Среда'),
        (3, 'Четверг'),
        (4, 'Пятница'),
        (5, 'Суббота'),
        (6, 'Воскресенье'),
    ]
    
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, 
                               related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES, verbose_name="День недели")
    start_time = models.TimeField(verbose_name="Время начала приема")
    end_time = models.TimeField(verbose_name="Время окончания приема")
    is_available = models.BooleanField(default=True, verbose_name="Доступен")
    max_patients = models.IntegerField(default=10, verbose_name="Максимум пациентов")
    
    class Meta:
        verbose_name = "Расписание врача"
        verbose_name_plural = "Расписания врачей"
        unique_together = ['doctor', 'day_of_week']
    
    def __str__(self):
        return f"{self.doctor.user.get_full_name()} - {self.get_day_of_week_display()}"


class DoctorTimeSlot(models.Model):
    """Временные слоты для записи к врачу"""
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, 
                               related_name='time_slots')
    date = models.DateField(verbose_name="Дата")
    start_time = models.TimeField(verbose_name="Время начала")
    end_time = models.TimeField(verbose_name="Время окончания")
    is_booked = models.BooleanField(default=False, verbose_name="Забронирован")
    consultation = models.ForeignKey(Consultation, on_delete=models.SET_NULL, 
                                     null=True, blank=True, 
                                     related_name='time_slots')
    
    class Meta:
        verbose_name = "Временной слот врача"
        verbose_name_plural = "Временные слоты врачей"
        unique_together = ['doctor', 'date', 'start_time']
        ordering = ['date', 'start_time']
    
    def __str__(self):
        booked = "забронирован" if self.is_booked else "свободен"
        return f"{self.doctor.user.get_full_name()} - {self.date} {self.start_time} ({booked})"

from django.utils import timezone
from django.contrib.auth.models import User
from django.db import models

class MedicalCertificate(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новая заявка'),
        ('review', 'На рассмотрении'),
        ('issued', 'Выдано'),
        ('rejected', 'Отказано'),
    ]

    TYPE_CHOICES = [
        ('work', 'Справка для работы'),
        ('study', 'Справка для учебы'),
        ('sick_leave', 'Больничный/нетрудоспособность'),
        ('sports', 'Справка для спорта'),
        ('other', 'Другая'),
    ]

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates', verbose_name='Пациент')
    # если у тебя DoctorProfile называется иначе — скажешь, поменяем
    doctor = models.ForeignKey('DoctorProfile', on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='issued_certificates', verbose_name='Врач')

    # если у тебя Consultation называется иначе — скажешь, поменяем
    consultation = models.ForeignKey('Consultation', on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='certificates', verbose_name='Консультация')

    certificate_type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name='Тип справки')
    reason = models.TextField(verbose_name='Причина/описание запроса')
    doctor_comment = models.TextField(blank=True, verbose_name='Комментарий врача')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус')
    pdf_file = models.FileField(upload_to='certificates/%Y/%m/%d/', blank=True, null=True, verbose_name='PDF справки')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    issued_at = models.DateTimeField(null=True, blank=True, verbose_name='Выдано')

    class Meta:
        verbose_name = 'Медицинская справка'
        verbose_name_plural = 'Медицинские справки'
        ordering = ['-created_at']

    def __str__(self):
        return f"Справка #{self.id} - {self.patient.username}"

    def mark_issued(self):
        self.status = 'issued'
        self.issued_at = timezone.now()

# Сигналы для автоматического создания временных слотов
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime, timedelta

@receiver(post_save, sender=DoctorSchedule)
def create_time_slots(sender, instance, created, **kwargs):
    """Автоматическое создание временных слотов на основе расписания врача"""
    if created:
        # В реальном проекте здесь можно создать слоты на ближайшие недели
        pass
    