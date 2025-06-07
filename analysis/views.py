from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from openai import OpenAI
from .models import User, Document, Analysis, DocumentAnalysis, Report, Notification
import os
import PyPDF2
import docx
from PIL import Image
import pytesseract
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import ReportSerializer
from django.core.mail import send_mail

# Initialize OpenAI client
api_key = settings.OPENAI_API_KEY
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in settings")
client = OpenAI(api_key=api_key)
# Contract prompt template
CONTRACT_PROMPT = """
You are LECUA, the Legal Extraction & Compliance Understanding Assistant specializing in Zimbabwean contract law. Analyze the contract text provided and produce a structured **Legal Officer Report**. Use clear numbered headings and sub‑sections, and avoid using asterisks in the report and provide a full report based on the following template:

---REPORT---

1. Parties Identification
   1.1 First Party
       • Name: [Name]
       • Role: [Role]
   1.2 Second Party
       • Name: [Name]
       • Role: [Role]

2. Clause Extraction and Analysis
For each of the following categories and add a number, include and write every clause in the contract that falls under it. For each clause, provide and if not available do not display it:
   i. Extracted Text (verbatim): "[Extract Contract text]"
   ii. Legal Basis: [Act Name] [Chapter] §[Section]
   iii. Requirements Summary: [Plain‑language explanation]
   iv. Risk Assessment: [Low/Medium/High] – [Rationale]
   **Categories to cover**:
- Commencement & Duration

- Position & Duties
- Remuneration Structure
- Working Hours & Overtime
- Leave Entitlement
- Termination Conditions
- NSSA & NEC Clauses
- Training & Indigenisation
- Governing Law


3. Statutory Compliance Mapping
For each statute cited in the contract:
   • Act: [Act Name] [Chapter]
   • Compliance Status: [Compliant/Partial/Non‑compliant]

4. Risk Log
List each identified risk as a bullet point:
   - [Clause Name] – 
   [Risk Type] – Severity (1–5): [Score] – Mitigation: [Actionable advice]

5. Contract Summary
   5.1 Purpose of Contract: [One‑sentence overview]
   5.2 Key Obligations and Timeline:
       • [Party A]: [Obligation] by [Date]
       • [Party B]: [Obligation] by [Date]
   5.3 Critical Dates:
       • Effective Date: [Date]
       • Review Period: [Start Date] to [End Date]
       • Termination Window: [Start Date] to [End Date]

6. Compliance Checklist
Indicate ✓ for compliant and ✗ for non‑compliant.
   • Stamp Duties Act [Chapter 23:09]
   • Income Tax Act [Chapter 23:06] (PAYE)
   • Data Protection Act [Chapter 11:12]
   • VAT Act [Chapter 23:12]
   • Consumer Protection Act [Chapter 14:44]

7. Summary
Provide a comprehensive paragraph summarizing the entire contract. The summary must include the following with dates and numbers stated in the contract:
The purpose of the contract (e.g., nature of employment or agreement)
The start date and duration or end date of the contract
The obligations and responsibilities of each party involved
The critical contractual dates (e.g., probation period end, salary payment schedule, renewal or termination conditions)
Any key terms or conditions that define the rights, duties, and expectations of the parties
The paragraph should be detailed, specific, and based directly on the content of the contract, avoiding vague or general statements.

---END OF REPORT---
Contract Text:
{text}
"""
# Utility functions for file processing
def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text
def extract_text_from_docx(file):
    doc = docx.Document(file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text
def extract_text_from_image(file):
    image = Image.open(file)
    text = pytesseract.image_to_string(image)
    return text
def process_uploaded_file(file):
    file_extension = file.name.lower().split('.')[-1]
    if file_extension == 'pdf':
        return extract_text_from_pdf(file)
    elif file_extension in ['doc', 'docx']:
        return extract_text_from_docx(file)
    elif file_extension in ['png', 'jpg', 'jpeg']:
        return extract_text_from_image(file)
    elif file_extension == 'txt':
        return file.read().decode('utf-8')
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")
# API endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    """
    Return the current user's information.
    """
    user = request.user
    return Response({
        'email': user.email,
        'username': user.username,
        'account_type': user.account_type,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
    })
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_text(request):
    """
    Analyze the provided text using OpenAI and return the analysis result.
    """
    try:
        # Get text from request data
        text = request.data.get('text')
        if not text:
            return Response({
                'error': 'No text provided for analysis',
                'message': 'Please provide text to analyze'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process the document content for analysis
        response = client.chat.completions.create(
            model="ft:gpt-3.5-turbo-0125:personal:legal-assistance:BFR7HUPE",
            messages=[{
                "role": "user",
                "content": CONTRACT_PROMPT.format(text=text)
            }],
            temperature=1,
            max_tokens=2048,
            top_p=1
        )
        analysis_result = response.choices[0].message.content
        # Save to database
        DocumentAnalysis.objects.create(
            content=text,
            analysis_result=analysis_result,
            user=request.user
        )
        return Response({
            'result': analysis_result,
            'message': 'Analysis completed successfully'
        }, status=status.HTTP_200_OK)
    except Exception as openai_error:
        error_message = str(openai_error)
        if "API key" in error_message.lower():
            error_message = "Invalid or missing OpenAI API key"
        elif "model" in error_message.lower():
            error_message = "Invalid model configuration"
        return Response({
            'error': error_message,
            'message': 'Failed to analyze text due to API error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'An unexpected error occurred during analysis'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request):
    """
    Handle document upload and initial processing.
    """
    try:
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        file = request.FILES['file']
        title = request.POST.get('title', file.name)
        content = process_uploaded_file(file)
        document = Document.objects.create(
            title=title,
            content=content,
            user=request.user
        )
        return Response({
            'id': document.id,
            'title': document.title,
            'content': content,
            'status': document.status,
            'upload_date': document.upload_date
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_documents(request):
    """
    Get all documents for the current user.
    """
    documents = Document.objects.filter(user=request.user).order_by('-upload_date')
    return Response([{
        'id': doc.id,
        'title': doc.title,
        'status': doc.status,
        'upload_date': doc.upload_date
    } for doc in documents])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_document_content(request, document_id):
    """
    Get content of a specific document.
    """
    try:
        document = Document.objects.get(id=document_id, user=request.user)
        return Response({
            'id': document.id,
            'title': document.title,
            'content': document.content,
            'status': document.status,
            'upload_date': document.upload_date
        })
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analysis_history(request):
    """
    Get all analyses for the current user.
    """
    analyses = DocumentAnalysis.objects.filter(user=request.user).order_by('-created_at')
    return Response([{
        'id': analysis.id,
        'content': analysis.content,
        'analysis_result': analysis.analysis_result,
        'created_at': analysis.created_at
    } for analysis in analyses])
# Authentication and registration views
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['username'] = user.username
        data['email'] = user.email
        data['account_type'] = user.account_type
        return data
class EmailTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            data = request.data
            email = data.get('email')
            username = data.get('username')
            password = data.get('password')
            account_type = data.get('account_type', 'user')
            if not all([email, username, password]):
                return Response({'error': 'Please provide all required fields'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
            user_obj = User.objects.create_user(
                email=email,
                username=username,
                password=password,
                account_type=account_type
            )
            refresh = RefreshToken.for_user(user_obj)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user_obj.id,
                    'username': user_obj.username,
                    'email': user_obj.email,
                    'account_type': user_obj.account_type
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
class FrontendAppView(APIView):
    """
    Serves the frontend application.
    """
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            with open(os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html'), 'r') as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse(
                "Frontend application not found. Please build the frontend first.",
                status=status.HTTP_404_NOT_FOUND
            )
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard(request):
    """
    Get dashboard statistics for admin users.
    """
    # Get total users count
    total_users = User.objects.count()
    
    # Get total documents count
    total_documents = Document.objects.count()
    
    # Get reports statistics
    reports = Report.objects.all()
    pending_reports = reports.filter(status='pending').count()
    resolved_reports = reports.filter(status='resolved').count()
    
    # Get recent activity
    recent_users = User.objects.order_by('-created_at')[:5]
    recent_reports = Report.objects.order_by('-created_at')[:5]
    
    return Response({
        'stats': {
            'total_users': total_users,
            'total_documents': total_documents,
            'pending_reports': pending_reports,
            'resolved_reports': resolved_reports,
        },
        'recent_users': [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at,
        } for user in recent_users],
        'recent_reports': [{
            'id': report.id,
            'title': report.title,
            'status': report.status,
            'created_at': report.created_at,
        } for report in recent_reports],
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_users(request):
    """
    Get all users for admin management.
    """
    users = User.objects.all()
    return Response([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'account_type': user.account_type,
        'is_active': user.is_active,
        'created_at': user.created_at,
        'last_login': user.last_login,
    } for user in users])

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_user_detail(request, user_id):
    """
    Get, update, or delete a specific user.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
    if request.method == 'GET':
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'account_type': user.account_type,
            'is_active': user.is_active,
            'created_at': user.created_at,
            'last_login': user.last_login,
        })
    
    elif request.method == 'PATCH':
        data = request.data
        if 'account_type' in data:
            user.account_type = data['account_type']
        if 'is_active' in data:
            user.is_active = data['is_active']
        user.save()
        return Response({'message': 'User updated successfully'})
    
    elif request.method == 'DELETE':
        user.delete()
        return Response({'message': 'User deleted successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_reports(request):
    """
    Get all reports for admin management.
    """
    reports = Report.objects.all().order_by('-created_at')
    return Response([{
        'id': report.id,
        'title': report.title,
        'description': report.description,
        'status': report.status,
        'priority': report.priority,
        'created_at': report.created_at,
        'updated_at': report.updated_at,
        'user': {
            'id': report.user.id,
            'username': report.user.username,
            'email': report.user.email,
        } if report.user else None,
    } for report in reports])

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_report_detail(request, report_id):
    """
    Get or update a specific report.
    """
    try:
        report = Report.objects.get(id=report_id)
    except Report.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)
    
    if request.method == 'GET':
        return Response({
            'id': report.id,
            'title': report.title,
            'description': report.description,
            'status': report.status,
            'priority': report.priority,
            'created_at': report.created_at,
            'updated_at': report.updated_at,
            'user': {
                'id': report.user.id,
                'username': report.user.username,
                'email': report.user.email,
            } if report.user else None,
        })
    
    elif request.method == 'PATCH':
        data = request.data
        if 'status' in data:
            report.status = data['status']
        if 'priority' in data:
            report.priority = data['priority']
        report.save()
        return Response({'message': 'Report updated successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_analytics(request):
    """
    Get analytics data for admin dashboard.
    """
    # Get user registration stats for the last 7 days
    today = timezone.now()
    seven_days_ago = today - timedelta(days=7)
    
    user_registrations = User.objects.filter(
        created_at__gte=seven_days_ago
    ).extra(
        select={'day': 'date(created_at)'}
    ).values('day').annotate(count=Count('id'))
    
    # Get document upload stats for the last 7 days
    document_uploads = Document.objects.filter(
        upload_date__gte=seven_days_ago
    ).extra(
        select={'day': 'date(upload_date)'}
    ).values('day').annotate(count=Count('id'))
    
    # Get report submission stats for the last 7 days
    report_submissions = Report.objects.filter(
        created_at__gte=seven_days_ago
    ).extra(
        select={'day': 'date(created_at)'}
    ).values('day').annotate(count=Count('id'))
    
    return Response({
        'user_registrations': list(user_registrations),
        'document_uploads': list(document_uploads),
        'report_submissions': list(report_submissions),
        'total_users': User.objects.count(),
        'total_documents': Document.objects.count(),
        'total_reports': Report.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password.
    """
    try:
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Verify old password
        if not user.check_password(old_password):
            return Response(
                {'message': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify new passwords match
        if new_password != confirm_password:
            return Response(
                {'message': 'New passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate new password
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {'message': e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """
    Create a new notification.
    """
    try:
        notification_type = request.data.get('type')
        title = request.data.get('title')
        report_id = request.data.get('report_id')
        priority = request.data.get('priority')

        # Create notification
        notification = Notification.objects.create(
            type=notification_type,
            title=title,
            message=f"New {notification_type} report: {title} (Priority: {priority})",
            report_id=report_id if report_id else None
        )

        return Response({
            'id': notification.id,
            'type': notification.type,
            'title': notification.title,
            'message': notification.message,
            'created_at': notification.created_at
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """
    Get all notifications for the current user.
    """
    try:
        notifications = Notification.objects.all().order_by('-created_at')
        return Response([{
            'id': notification.id,
            'type': notification.type,
            'title': notification.title,
            'message': notification.message,
            'is_read': notification.is_read,
            'created_at': notification.created_at
        } for notification in notifications])
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    """
    Create a new report.
    """
    try:
        # Get data from request
        title = request.data.get('title')
        description = request.data.get('description')
        report_type = request.data.get('type')
        priority = request.data.get('priority')
        steps = request.data.get('steps')

        # Validate required fields
        if not all([title, description, report_type, priority]):
            return Response({
                'message': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create report
        report = Report.objects.create(
            title=title,
            description=description,
            type=report_type,
            priority=priority,
            steps=steps,
            user=request.user,
            status='pending'
        )

        # Create notification for admins
        try:
            Notification.objects.create(
                type='new_report',
                title=title,
                message=f"New {report_type} report: {title} (Priority: {priority})",
                report=report
            )
        except Exception as notify_error:
            print(f"Failed to create notification: {notify_error}")
            # Continue even if notification fails

        return Response({
            'id': report.id,
            'title': report.title,
            'type': report.type,
            'priority': report.priority,
            'status': report.status,
            'created_at': report.created_at
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        report = serializer.save(user=self.request.user)
        # Notify admin about new report
        admin_users = User.objects.filter(is_staff=True)
        admin_emails = [admin.email for admin in admin_users if admin.email]
        
        if admin_emails:
            subject = f'New Issue Report: {report.title}'
            message = f"""
            A new issue has been reported:
            
            Title: {report.title}
            Type: {report.type}
            Priority: {report.priority}
            Description: {report.description}
            
            Steps to Reproduce:
            {report.steps or 'No steps provided'}
            
            Reported by: {report.user.username if report.user else 'Anonymous'}
            """
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    admin_emails,
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email notification: {str(e)}")

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Report.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        report.status = new_status
        report.save()
        
        # Notify user about status update
        if report.user and report.user.email:
            subject = f'Issue Status Updated: {report.title}'
            message = f"""
            Your reported issue has been updated:
            
            Title: {report.title}
            New Status: {report.status}
            
            You can view the full details in your dashboard.
            """
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [report.user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email notification: {str(e)}")
        
        return Response({'status': 'success'})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_database(request):
    """
    Get database information for admin dashboard
    """
    try:
        # Get all models from the analysis app
        from django.apps import apps
        models = apps.get_app_config('analysis').get_models()
        
        database_info = []
        for model in models:
            try:
                count = model.objects.count()
                database_info.append({
                    'name': model.__name__,
                    'description': model._meta.verbose_name,
                    'recordCount': count,
                    'lastUpdated': model.objects.latest('updated_at').updated_at if hasattr(model, 'updated_at') else None
                })
            except Exception as e:
                continue
        
        return Response(database_info)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_settings(request):
    """
    Get or update system settings
    """
    if request.method == 'GET':
        try:
            # Get settings from database or return defaults
            settings = {
                'system': {
                    'maintenanceMode': False,
                    'maxLoginAttempts': 5,
                    'sessionTimeout': 30,
                },
                'security': {
                    'passwordMinLength': 8,
                    'requireSpecialChars': True,
                    'requireNumbers': True,
                    'requireUppercase': True,
                },
                'notifications': {
                    'emailNotifications': True,
                    'reportNotifications': True,
                    'userNotifications': True,
                }
            }
            return Response(settings)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            # Update settings in database
            settings = request.data
            # Here you would typically save these settings to your database
            # For now, we'll just return success
            return Response({'success': True, 'message': 'Settings updated successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)