from django.shortcuts import render, redirect, HttpResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth.models import User
from .forms import RegisterForm
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib import messages
from django.utils import timezone
from django.contrib.admin.views.decorators import staff_member_required

from .models import MedicalCertificate, Consultation, Product, Hospital, DoctorProfile
from .forms import CertificateRequestForm, CertificateIssueForm

@staff_member_required
def delete_certificate(request, pk):
    # Исправлено: используем правильную модель MedicalCertificate вместо CertificateRequest
    certificate = get_object_or_404(MedicalCertificate, pk=pk)
    
    # Дополнительная проверка прав (например, только врач может удалять)
    if request.user.is_staff:
        certificate.delete()
        messages.success(request, f'Заявка #{pk} успешно удалена')
    else:
        messages.error(request, 'У вас нет прав для удаления заявок')
    
    return redirect('doctor_certificates')

# ==================== ОСНОВНЫЕ СТРАНИЦЫ ====================

def index(request):
    return render(request, 'index.html')

def consultation(request):
    symptoms = [
        {'name': 'Головная боль', 'icon': 'fas fa-head-side-virus', 'question': 'Что помогает от головной боли?'},
        {'name': 'Температура', 'icon': 'fas fa-thermometer-half', 'question': 'Что принимать при температуре?'},
        {'name': 'Кашель', 'icon': 'fas fa-lungs-virus', 'question': 'Что помогает от кашля?'},
        {'name': 'Боль в горле', 'icon': 'fas fa-teeth-open', 'question': 'Что принимать при боли в горле?'},
        {'name': 'Обезболивающие', 'icon': 'fas fa-pills', 'question': 'Какие обезболивающие самые эффективные?'},
        {'name': 'Витамины', 'icon': 'fas fa-capsules', 'question': 'Какие витамины вы рекомендуете?'},
    ]
    return render(request, 'consultation.html', {'symptoms': symptoms})

def pharmacy(request):
    try:
        products = Product.objects.all()
    except:
        products = []
    return render(request, 'pharmacy.html', {'products': products})

def documents(request):
    try:
        hospitals = Hospital.objects.all()
        doctors = DoctorProfile.objects.filter(is_active=True)
    except:
        hospitals = []
        doctors = []
    return render(request, 'documents.html', {'hospitals': hospitals, 'doctors': doctors})

def about(request):
    return render(request, 'about.html')

@login_required
def delivery(request):
    return render(request, 'delivery.html')

@login_required
def profile(request):
    try:
        user_consultations = Consultation.objects.filter(user=request.user).order_by('-created_at')[:10]
    except:
        user_consultations = []
    return render(request, 'profile.html', {'user_consultations': user_consultations})

def terms(request):
    return render(request, 'terms.html', {'title': 'Условия использования'})

def privacy(request):
    return render(request, 'privacy.html', {'title': 'Политика конфиденциальности'})

@login_required
def book_consultation(request):
    return redirect('documents')

# ==================== АВТОРИЗАЦИЯ ====================

def login_view(request):
    """Страница входа"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if not username or not password:
            return render(request, 'login.html', {'error': 'Заполните все поля'})
        
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('profile')
        else:
            return render(request, 'login.html', {'error': 'Неправильное имя пользователя или пароль'})
    
    return render(request, 'login.html')

def logout_view(request):
    """Выход из системы"""
    logout(request)
    return redirect('index')

def password_reset_view(request):
    """Временная страница восстановления пароля"""
    return HttpResponse('''
    <html>
    <body style="font-family: Arial; padding: 20px; text-align: center;">
        <h1>📧 Восстановление пароля</h1>
        <p>Функция восстановления пароля временно недоступна.</p>
        <p>Обратитесь к администратору для сброса пароля.</p>
        <a href="/login/">Вернуться к входу</a>
    </body>
    </html>
    ''')

def test_simple_register(request):
    """Простая тестовая регистрация"""
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password1 = request.POST.get('password1', '').strip()
        password2 = request.POST.get('password2', '').strip()
        terms = request.POST.get('terms')
        
        if username and email and password1 and password2 and terms:
            if User.objects.filter(username=username).exists():
                return HttpResponse(f'''
                    <h1>Ошибка</h1>
                    <p>Пользователь {username} уже существует</p>
                    <a href="/test-simple-register/">Назад</a>
                ''')
            
            try:
                user = User.objects.create_user(username=username, email=email, password=password1)
                user = authenticate(username=username, password=password1)
                if user:
                    login(request, user)
                    return HttpResponse(f'''
                        <h1>Успех! 🎉</h1>
                        <p>Пользователь {username} создан!</p>
                        <p><a href="/profile/">Перейти в профиль</a></p>
                        <p><a href="/">На главную</a></p>
                    ''')
            except Exception as e:
                return HttpResponse(f'''
                    <h1>Ошибка</h1>
                    <p>{str(e)}</p>
                    <a href="/test-simple-register/">Назад</a>
                ''')
    
    return render(request, 'simple_register.html')

def test_nojs_register(request):
    """Тестовая регистрация без JavaScript"""
    if request.method == 'POST':
        return HttpResponse(f'''
            <h1>✅ ФОРМА ОТПРАВЛЕНА!</h1>
            <p>Данные получены успешно!</p>
            <p>username: {request.POST.get('username', 'не указано')}</p>
            <p>email: {request.POST.get('email', 'не указано')}</p>
            <p><a href="/test-nojs/">Вернуться к форме</a></p>
        ''')
    
    return HttpResponse('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Тест без JavaScript</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                input { display: block; margin: 10px 0; padding: 10px; width: 300px; }
            </style>
        </head>
        <body>
            <h1>Тестовая форма БЕЗ JavaScript</h1>
            <form method="post">
                <input type="text" name="username" placeholder="Имя пользователя" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password1" placeholder="Пароль" required>
                <input type="password" name="password2" placeholder="Повторите пароль" required>
                <label><input type="checkbox" name="terms" required> Согласен</label>
                <button type="submit" style="padding: 10px 20px; margin-top: 20px;">
                    Отправить
                </button>
            </form>
        </body>
        </html>
    ''')

def test_db_view(request):
    """Тест базы данных"""
    users_count = User.objects.count()
    latest_users = User.objects.order_by('-id')[:5]
    
    html = f'''
    <html>
    <body>
        <h1>📊 Тест базы данных</h1>
        <p><strong>Всего пользователей:</strong> {users_count}</p>
        
        <h3>Последние 5 пользователей:</h3>
        <ul>
    '''
    
    for user in latest_users:
        html += f'<li>{user.id}: {user.username} - {user.email} (дата: {user.date_joined.strftime("%d.%m.%Y %H:%M")})</li>'
    
    html += '''
        </ul>
        
        <h3>Действия:</h3>
        <ul>
            <li><a href="/register/">Регистрация</a></li>
            <li><a href="/test-nojs/">Тест без JS</a></li>
            <li><a href="/admin/">Админка</a></li>
            <li><a href="/">Главная</a></li>
        </ul>
    </body>
    </html>
    '''
    
    return HttpResponse(html)

# ==================== РЕАЛЬНАЯ РЕГИСТРАЦИЯ (ОДНА ФУНКЦИЯ) ====================

def register_view(request):
    """Страница регистрации — единая реализация.
    Возвращает 'errors' (список строк) для совместимости с register.html шаблоном."""
    errors = []
    form = None

    if request.method == 'POST':
        form = RegisterForm(request.POST)

        # Проверка согласия с условиями (если есть чекбокс 'terms' в форме)
        if not request.POST.get('terms'):
            errors.append('Пожалуйста, согласитесь с условиями использования и политикой конфиденциальности')
            return render(request, 'register.html', {'form': form, 'errors': errors})

        if form.is_valid():
            user = form.save(commit=True)
            user = authenticate(username=form.cleaned_data['username'],
                                password=form.cleaned_data['password1'])
            if user:
                login(request, user)
                return redirect('profile')
            else:
                errors.append('Ошибка аутентификации после создания пользователя')
                return render(request, 'register.html', {'form': form, 'errors': errors})
        else:
            # Собираем удобочитаемые ошибки в список строк (совместимость с шаблоном)
            for field, field_errors in form.errors.items():
                for e in field_errors:
                    if field == '__all__':
                        errors.append(e)
                    else:
                        errors.append(f"{field}: {e}")
            return render(request, 'register.html', {'form': form, 'errors': errors})

    # GET
    form = RegisterForm()
    return render(request, 'register.html', {'form': form})

# ==================== УПРОЩЕННЫЕ API ====================

@csrf_exempt
@require_POST
def api_consultation(request):
    return JsonResponse({
        'success': True,
        'response': 'Функция временно отключена',
        'medicines': []
    })

@csrf_exempt
@require_POST
def api_book_consultation(request):
    return JsonResponse({
        'success': True,
        'message': 'Функция временно отключена'
    })

@login_required
def doctor_dashboard(request):
    return render(request, 'doctor_dashboard.html')

@login_required
@require_POST
def process_order(request):
    return JsonResponse({
        'success': True,
        'message': 'Функция временно отключена'
    })

@login_required
def certificates_list(request):
    certs = MedicalCertificate.objects.filter(patient=request.user)
    return render(request, 'certificates/certificates_list.html', {'certs': certs})

@login_required
def certificate_request(request):
    if request.method == 'POST':
        form = CertificateRequestForm(request.POST, user=request.user)
        if form.is_valid():
            cert = form.save(commit=False)
            cert.patient = request.user

            # защита: нельзя привязать чужую консультацию
            if cert.consultation and cert.consultation.user != request.user:
                messages.error(request, "Нельзя выбрать чужую консультацию.")
                return redirect('certificate_request')

            cert.status = 'new'
            cert.save()
            messages.success(request, "Заявка отправлена. Врач рассмотрит её после консультации.")
            return redirect('certificates_list')
    else:
        form = CertificateRequestForm(user=request.user)

    return render(request, 'certificates/certificate_request.html', {'form': form})

@login_required
def doctor_certificates(request):
    # простой доступ: врач = пользователь у которого есть doctor_profile
    if not hasattr(request.user, 'doctor_profile'):
        return HttpResponse("Доступ только для врачей", status=403)

    doctor = request.user.doctor_profile

    # врач видит: все новые без врача + те что назначены ему
    certs = MedicalCertificate.objects.filter(doctor=doctor) | MedicalCertificate.objects.filter(doctor__isnull=True)
    certs = certs.order_by('-created_at')

    return render(request, 'certificates/doctor_certificates.html', {'certs': certs})

@login_required
def doctor_issue_certificate(request, pk):
    if not hasattr(request.user, 'doctor_profile'):
        return HttpResponse("Доступ только для врачей", status=403)

    cert = get_object_or_404(MedicalCertificate, pk=pk)
    doctor = request.user.doctor_profile

    # если заявка ещё никому не назначена — назначаем текущему врачу
    if cert.doctor is None:
        cert.doctor = doctor
        cert.status = 'review'
        cert.save()

    if request.method == 'POST':
        form = CertificateIssueForm(request.POST, request.FILES, instance=cert)
        if form.is_valid():
            updated = form.save(commit=False)

            # если выдано — ставим дату выдачи
            if updated.status == 'issued' and not updated.issued_at:
                updated.issued_at = timezone.now()

            updated.doctor = doctor
            updated.save()
            messages.success(request, "Справка обновлена.")
            return redirect('doctor_certificates')
    else:
        form = CertificateIssueForm(instance=cert)

    return render(request, 'certificates/doctor_issue_certificate.html', {'form': form, 'cert': cert})