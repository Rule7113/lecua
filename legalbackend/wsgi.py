
# Import the os module for interacting with the operating system
import os

# Import the get_wsgi_application function to create the WSGI application object
from django.core.wsgi import get_wsgi_application

# Set the default settings module for the 'DJANGO_SETTINGS_MODULE' environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legalbackend.settings')

application = get_wsgi_application()