from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

# УДАЛИТЕ ЭТИ 4 СТРОКИ:
# Используйте встроенное представление
# path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
# или
# path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    

urlpatterns = [
    # Основные страницы
    path('', views.index, name='index'),
    path('consultation/', views.consultation, name='consultation'),
    path('pharmacy/', views.pharmacy, name='pharmacy'),
    path('documents/', views.documents, name='documents'),
    path('about/', views.about, name='about'),
    path('profile/', views.profile, name='profile'),
    path('delivery/', views.delivery, name='delivery'),
    
    # Авторизация
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),  # Это работает, т.к. функция есть в views.py
    path('register/', views.register_view, name='register'),
    # main/urls.py (вставьте рядом с другими auth-путями)
path('password-reset/', views.password_reset_view, name='password_reset'),
  
    # Тестовые страницы
    path('test-nojs/', views.test_nojs_register, name='test_nojs'),
    path('test-db/', views.test_db_view, name='test_db_view'),
    path('test-simple-register/', views.test_simple_register, name='test_simple_register'),
        # Тестовые страницы
    path('test-nojs/', views.test_nojs_register, name='test_nojs'),
    path('test-db/', views.test_db_view, name='test_db_view'),
    # ЗАКОММЕНТИРУЙТЕ ЭТУ СТРОКУ:
    # path('test-simple-register/', views.test_simple_register, name='test_simple_register'),
    
    # Или удалите её полностью
    
    # Дополнительные страницы
    path('terms/', views.terms, name='terms'),
    path('privacy/', views.privacy, name='privacy'),
    path('certificate/<int:pk>/delete/', views.delete_certificate, name='delete_certificate'),
    
    # Запись на консультацию
    path('book-consultation/', views.book_consultation, name='book_consultation'),
    
    # API endpoints (упрощенные)
    path('api/consultation/', views.api_consultation, name='api_consultation'),
    path('api/book-consultation/', views.api_book_consultation, name='api_book_consultation'),
    
    # Обработка заказа
    path('process-order/', views.process_order, name='process_order'),
    
    # Панель врача
    path('doctor-dashboard/', views.doctor_dashboard, name='doctor_dashboard'),
    path('certificates/', views.certificates_list, name='certificates_list'),
path('certificates/request/', views.certificate_request, name='certificate_request'),
path('doctor/certificates/', views.doctor_certificates, name='doctor_certificates'),
path('doctor/certificates/<int:pk>/', views.doctor_issue_certificate, name='doctor_issue_certificate'),

]
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
