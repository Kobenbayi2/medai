# main/middleware.py
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages

class AdminAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Проверяем, пытается ли пользователь получить доступ к админке
        if request.path.startswith('/admin/'):
            # Разрешаем доступ только суперпользователям
            if not request.user.is_superuser:
                messages.error(request, 'Доступ к админке запрещен для обычных пользователей')
                return redirect('index')
        
        response = self.get_response(request)
        return response