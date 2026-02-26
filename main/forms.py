from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs.update({'class': 'form-control'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control'})
        from django import forms
from .models import MedicalCertificate, Consultation

class CertificateRequestForm(forms.ModelForm):
    class Meta:
        model = MedicalCertificate
        fields = ['certificate_type', 'consultation', 'reason']
        widgets = {
            'certificate_type': forms.Select(attrs={'class': 'form-control'}),
            'consultation': forms.Select(attrs={'class': 'form-control'}),
            'reason': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        }

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        # показываем в выборе только консультации текущего пользователя
        if user is not None:
            self.fields['consultation'].queryset = Consultation.objects.filter(user=user).order_by('-created_at')

class CertificateIssueForm(forms.ModelForm):
    class Meta:
        model = MedicalCertificate
        fields = ['status', 'doctor_comment', 'pdf_file']
        widgets = {
            'status': forms.Select(attrs={'class': 'form-control'}),
            'doctor_comment': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
        }
