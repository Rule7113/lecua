from django.apps import AppConfig  # Import the AppConfig class from django.apps


class AnalysisConfig(AppConfig):  # Define a new class AnalysisConfig that inherits from AppConfig
    default_auto_field = 'django.db.models.BigAutoField'  # Set the default type for auto fields to BigAutoField
    name = 'analysis'  # Specify the name of the app as 'analysis'
