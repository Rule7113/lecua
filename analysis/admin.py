# Register your models here.
# legalbackend/analysis/admin.py

# Import necessary classes from Django
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Import models from the current application
from .models import User, Document, Analysis, DocumentAnalysis, Report

# Customize the admin interface for the User model
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Specify the fields to be displayed in the list view
    list_display = ('username', 'email', 'account_type', 'is_active', 'is_staff', 'created_at')
    # Add filters based on these fields in the list view
    list_filter = ('account_type', 'is_active', 'is_staff')
    # Enable search functionality for these fields
    search_fields = ('username', 'email')
    # Set default ordering for the list view
    ordering = ('-created_at',)
    
    # Define fieldsets for displaying and editing user details
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('account_type',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    
    # Define fields for the user creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'account_type'),
        }),
    )


    # Explicitly define empty filter_horizontal to avoid unintentional UI options
    filter_horizontal = ()

# Customize the admin interface for the Document model
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    # Specify the fields to be displayed in the list view
    list_display = ('title', 'user', 'status', 'upload_date')
    # Add filters based on these fields in the list view
    list_filter = ('status', 'upload_date')
    # Enable search functionality for these fields
    search_fields = ('title', 'user__username')
    # Set default ordering for the list view
    ordering = ('-upload_date',)

# Customize the admin interface for the Analysis model
@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    # Specify the fields to be displayed in the list view
    list_display = ('document', 'created_at')
    # Add filters based on these fields in the list view
    list_filter = ('created_at',)
    # Enable search functionality for these fields
    search_fields = ('document__title',)
    # Set default ordering for the list view
    ordering = ('-created_at',)

@admin.register(DocumentAnalysis)
class DocumentAnalysisAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username',)
    ordering = ('-created_at',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('title', 'user__username', 'description')
    ordering = ('-created_at',)