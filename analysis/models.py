from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    # Function to create a basic user
    def create_user(self, email, username, password=None, **extra_fields):
        # Ensure that an email is provided
        if not email:
            raise ValueError('The Email field must be set')
        # Normalize the email address by lowercasing the domain part
        email = self.normalize_email(email)
        # Create a new user instance
        user = self.model(email=email, username=username, **extra_fields)
        # Set the user's password
        user.set_password(password)
        # Save the user in the database
        user.save(using=self._db)
        return user

    # Function to create a superuser
    def create_superuser(self, email, username, password=None, **extra_fields):
        # Ensure superuser fields are set to True
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # Call the create_user function with extra fields
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser):
    # Unique username for each user
    username = models.CharField(max_length=150, unique=True)
    # Unique email for each user
    email = models.EmailField(unique=True, max_length=254)
    # Account type with predefined choices
    account_type = models.CharField(max_length=20, default='user')
    # Date and time when the user was created
    created_at = models.DateTimeField(auto_now_add=True)
    # Boolean field to check if user is active
    is_active = models.BooleanField(default=True)
    # Boolean field to check if user is staff
    is_staff = models.BooleanField(default=False)
    # Boolean field to check if user is superuser
    is_superuser = models.BooleanField(default=False)

    # Use UserManager for creating users and superusers
    objects = UserManager()

    # Use email as the unique identifier for authentication
    USERNAME_FIELD = 'email'
    # Fields that are required when creating a user via createsuperuser
    REQUIRED_FIELDS = ['username', 'account_type']

    # Return user's email as string representation
    def __str__(self):
        return self.email

    # Permissions checking for superuser
    def has_perm(self, perm, obj=None):
        return self.is_superuser

    # Permission check for modules
    def has_module_perms(self, app_label):
        return self.is_superuser

class Document(models.Model):
    # Title of the document
    title = models.CharField(max_length=255)
    # Content of the document
    content = models.TextField()
    # Date and time when the document was uploaded
    upload_date = models.DateTimeField(auto_now_add=True)
    # Status of the document with choices
    status = models.CharField(max_length=20, default='pending')

    # ForeignKey linking to User; one-to-many relationship
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Return document's title as string representation
    def __str__(self):
        return self.title

class Analysis(models.Model):
    # ForeignKey linking to Document; one-to-many relationship
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    # Result of the analysis
    result = models.TextField()
    # Date and time when the analysis was performed
    created_at = models.DateTimeField(auto_now_add=True)

    # Return a formatted string representation
    def __str__(self):
        return f"Analysis for {self.document.title}"

class DocumentAnalysis(models.Model):
    # Content of the analysis
    content = models.TextField()
    # Result of the document analysis
    analysis_result = models.TextField()
    # Date and time when the analysis was created
    created_at = models.DateTimeField(auto_now_add=True)
    # ForeignKey linking to User; one-to-many relationship
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Return a formatted string representation
    def __str__(self):
        return f"Analysis for {self.user.username} at {self.created_at}"

class Report(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    TYPE_CHOICES = [
        ('bug', 'Bug'),
        ('feature', 'Feature Request'),
        ('improvement', 'Improvement'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='bug')
    steps = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.status}"

class Notification(models.Model):
    TYPE_CHOICES = [
        ('new_report', 'New Report'),
        ('report_update', 'Report Update'),
        ('system', 'System Notification'),
    ]
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    report = models.ForeignKey(Report, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.type} - {self.title}"