from django.db import models

class DocumentAnalysis(models.Model):
    content = models.TextField()
    analysis_result = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)