from django.contrib import admin
from django.urls import path, include
from analysis.views import (
    user_view, upload_document, get_user_documents,
    get_document_content, analyze_text, EmailTokenObtainPairView, RegisterView, FrontendAppView, get_analysis_history,
    create_report
)
from django.conf import settings
from django.conf.urls.static import static

# Define URL patterns for the application
urlpatterns = [
    # URL pattern for admin site
    path('admin/', admin.site.urls),
    # Include admin API endpoints
    path('api/', include('analysis.urls')),
    # URL pattern for accessing user information
    path('api/user/', user_view, name='user'),
    # URL pattern for uploading documents
    path('api/documents/upload/', upload_document, name='upload_document'),
    # URL pattern for retrieving user documents
    path('api/documents/', get_user_documents, name='get_user_documents'),
    # URL pattern for retrieving content of a specific document
    path('api/documents/<int:document_id>/', get_document_content, name='get_document_content'),
    # URL pattern for analyzing a specific document
    path('api/documents/<int:document_id>/analysis/', analyze_text, name='get_document_analysis'),
    # URL pattern for text analysis
    path('api/analyze-text/', analyze_text, name='analyze_text'),  # Updated endpoint for text analysis
    # URL pattern for obtaining token using email
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # URL pattern for user registration
    path('api/register/', RegisterView.as_view(), name='register'),
    # URL pattern for retrieving analysis history
    path('api/analyses/', get_analysis_history, name='analysis-history'),
    # URL pattern for creating reports
    path('api/reports/', create_report, name='create_report'),
    # URL pattern for rendering frontend application
    path('', FrontendAppView.as_view(), name='frontend'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)  # Serve media files during development
