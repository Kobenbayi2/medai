from django.contrib import admin
from django.utils.html import format_html
from django.core.files.images import get_image_dimensions
from PIL import Image
import os
from django.conf import settings
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'name', 'price', 'category', 'stock', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['price', 'stock']
    ordering = ['name']
    
    # Автоматическое изменение размера изображений
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        
        # Если есть изображение, обрабатываем его
        if obj.image:
            self.resize_and_optimize_image(obj.image.path)
    
    # Функция для изменения размера и оптимизации изображения
    def resize_and_optimize_image(self, image_path):
        try:
            # Открываем изображение
            img = Image.open(image_path)
            
            # Определяем текущий размер
            width, height = img.size
            
            # Целевой размер (например, 800x800 максимум)
            max_size = 800
            
            # Если изображение больше целевого размера, уменьшаем его
            if width > max_size or height > max_size:
                # Сохраняем пропорции
                if width > height:
                    new_width = max_size
                    new_height = int((height * max_size) / width)
                else:
                    new_height = max_size
                    new_width = int((width * max_size) / height)
                
                # Изменяем размер
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Оптимизируем и сохраняем
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Для изображений с прозрачностью
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        background.paste(img, mask=img.split()[-1])
                    else:
                        background.paste(img)
                    img = background
                
                # Сохраняем с оптимизацией
                img.save(image_path, 'JPEG' if image_path.lower().endswith('.jpg') else 'PNG', 
                        optimize=True, quality=85)
                
                print(f"Изображение оптимизировано: {image_path}")
            
        except Exception as e:
            print(f"Ошибка при обработке изображения {image_path}: {e}")
    
    # Показ миниатюры в списке товаров
    def image_preview(self, obj):
        if obj.image:
            # Проверяем размеры изображения
            try:
                width, height = get_image_dimensions(obj.image.path)
                return format_html(
                    '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" title="{}x{}" />',
                    obj.image.url, width, height
                )
            except:
                return format_html(
                    '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                    obj.image.url
                )
        return format_html('<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">Нет фото</div>')
    
    image_preview.short_description = 'Фото'

# Удаляем все другие модели из админки
# Остается только Product

# Кастомизация заголовка админки
admin.site.site_header = "Управление товарами"
admin.site.site_title = "Панель управления"
admin.site.index_title = "Добро пожаловать в панель управления товарами"
from django.contrib import admin
from .models import MedicalCertificate

@admin.register(MedicalCertificate)
class MedicalCertificateAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'certificate_type', 'status', 'created_at', 'issued_at')
    list_filter = ('status', 'certificate_type', 'created_at')
    search_fields = ('patient__username', 'patient__email')
from .models import DoctorProfile

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user',)
    search_fields = ('user__username', 'user__email')
