#!/usr/bin/env python3
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Set the default value for the DJANGO_SETTINGS_MODULE environment variable
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legalbackend.settings')

    try:
        # Try to import Django's execute_from_command_line function
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Raise an informative ImportError if Django could not be imported
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Execute the command-line utility with the supplied arguments
    execute_from_command_line(sys.argv)


# Check if this script is being run as the main program
if __name__ == '__main__':
    main()
