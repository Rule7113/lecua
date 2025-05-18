# legalbackend/legalbackend/urls.py
from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from analysis.views import (
    analyze_document,
    user_view,
    login_view,
    EmailTokenObtainPairView,
    RegisterView,
    FrontendAppView  # Import from analysis.views
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/analyze/', analyze_document, name='analyze_document'),
    path('api/auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/user/', user_view, name='user_view'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
]

# Serve uploaded media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all route to serve React frontend (must come last)
urlpatterns += [
    re_path(r'^.*$', FrontendAppView.as_view()),
]