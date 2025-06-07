from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.user_view, name='user'),
    path('analyze-text/', views.analyze_text, name='analyze_text'),
    path('documents/upload/', views.upload_document, name='upload_document'),
    path('documents/', views.get_user_documents, name='get_user_documents'),
    path('documents/<int:document_id>/', views.get_document_content, name='get_document_content'),
    path('analyses/', views.get_analysis_history, name='get_analysis_history'),
    path('token/', views.EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/users/<int:user_id>/', views.admin_user_detail, name='admin_user_detail'),
    path('admin/reports/', views.admin_reports, name='admin_reports'),
    path('admin/reports/<int:report_id>/', views.admin_report_detail, name='admin_report_detail'),
    path('admin/analytics/', views.admin_analytics, name='admin_analytics'),
    path('admin/database/', views.admin_database, name='admin_database'),
    path('admin/settings/', views.admin_settings, name='admin_settings'),
    path('user/change-password/', views.change_password, name='change_password'),
    path('notifications/', views.create_notification, name='create_notification'),
    path('notifications/list/', views.get_notifications, name='get_notifications'),
] 