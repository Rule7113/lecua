from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from openai import OpenAI
from .models import DocumentAnalysis
import os
import logging
import PyPDF2
import docx
from PIL import Image
import pytesseract
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate, login
from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from django.views import View
from django.http import HttpResponse
import os
from django.conf import settings

# Setup logging
logger = logging.getLogger(__name__)
# Get User model
User = get_user_model()
# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
# Contract prompt template
CONTRACT_PROMPT = """
You are **LECUA**, the Legal Extraction & Compliance Understanding Assistant specializing in Zimbabwean contract law.
Analyze the contract text below and produce a **Kira‑style report**. Use numbered headings, clear sub‑sections, and **no asterisks**.
---REPORT ---
1. Parties Identification
1.1 First Party: [Name] | Role: [Role] | Jurisdiction: [Location]
1.2 Second Party: [Name] | Role: [Role] | Jurisdiction: [Location]
2. Clause Extraction & Analysis
For each category, provide:
2.x Clause Category: [Type]
i. Extracted Text: "[Verbatim contract text]"
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
3.x [Act Name] [Chapter]
• Applicable Sections: §[X], §[Y]
• Compliance Status: [Compliant/Partial/Non‑compliant]
• Source: [ZimLII URL or Official Gazette citation]
4. Risk Log
List each identified risk as a bullet:
- [Section X.Y] – [Risk Type] – Severity: [1–5] – Mitigation: [Actionable advice]
- [Section A.B] – [Risk Type] – Severity: [1–5] – Mitigation: [Actionable advice]
5. Contract Summary
5.1 Purpose of Contract: [1‑sentence overview]
5.2 Key Obligations & Timeline:
- [Party A]: [Obligation] by [Date]
- [Party B]: [Obligation] by [Date]
5.3 Critical Dates: Effective [Date]; Review [Date Range]; Termination Window [Date Range]
6. Additions
6.1 Cross‑Contract Comparison:
- [%] match with standard [Industry] templates
- Notable Deviations: [Top 3 differences]
6.2 Document Health Score: [X]/100
6.3 Compliance Checklist:
- [✓/✗] Stamp Duties Act [Chapter 23:09]
- [✓/✗] Income Tax Act [Chapter 23:06] (PAYE)
- [✓/✗] Data Protection Act [Chapter 11:12]
- [✓/✗] VAT Act [Chapter 23:12]
- [✓/✗] Consumer Protection Act [Chapter 14:44]
7. Additional Statutory Considerations
Identify any relevant statutes not cited, and for each:
• Why it applies
• Key requirements
• Source reference
--- Conclusion---
Contract Text:
{text}
"""
def extract_text_from_pdf(file):
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise
def extract_text_from_docx(file):
    try:
        doc = docx.Document(file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        raise
def extract_text_from_image(file):
    try:
        image = Image.open(file)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image: {str(e)}")
        raise
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
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    """Return the current user's information."""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
    })
@csrf_exempt
def analyze_document(request):
    if request.method == 'POST':
        try:
            document_content = ""
            scanned_text = ""
            # Handle file upload
            if 'file' in request.FILES:
                file = request.FILES['file']
                scanned_text = process_uploaded_file(file)
                document_content = scanned_text
            # Handle text content
            elif 'content' in request.POST:
                document_content = request.POST['content']
            # Handle JSON content (for backward compatibility)
            elif request.content_type == 'application/json':
                data = json.loads(request.body)
                document_content = data.get('content', '')
            if not document_content:
                return JsonResponse({'error': 'No content provided'}, status=400)
            # If this is just a file upload for scanning, return the scanned text
            if 'file' in request.FILES and not request.POST.get('analyze'):
                return JsonResponse({
                    'scanned_text': scanned_text,
                    'message': 'Document scanned successfully'
                })
            # Process the document content for analysis
            response = client.chat.completions.create(
                model="ft:gpt-3.5-turbo-0125:personal:legal-assistance:BFR7HUPE",
                messages=[{
                    "role": "user", 
                    "content": CONTRACT_PROMPT.format(text=document_content)
                }],
                temperature=1,
                max_tokens=2048,
                top_p=1
            )
            analysis_result = response.choices[0].message.content
            # Save to database
            DocumentAnalysis.objects.create(
                content=document_content,
                analysis_result=analysis_result
            )
            return JsonResponse({
                'analysis': analysis_result,
                'scanned_text': scanned_text
            })
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except ValueError as ve:
            logger.error(f"Value error: {str(ve)}")
            return JsonResponse({'error': str(ve)}, status=400)
        except Exception as e:
            logger.exception("Analysis failed")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=400)
# Custom serializer for email-based login
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise AuthenticationFailed({
                'error': 'Both email and password are required.'
            })

        try:
            user = User.objects.get(email=email)
            if not check_password(password, user.password):
                raise AuthenticationFailed({
                    'error': 'Invalid password. Please try again.'
                })

            refresh = RefreshToken.for_user(user)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            }
            return data

        except User.DoesNotExist:
            raise AuthenticationFailed({
                'error': 'No account found with this email address.'
            })
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            raise AuthenticationFailed({
                'error': 'An error occurred during login. Please try again.'
            })
# Custom token view for email-based login
class EmailTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer
# User registration view
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            password2 = request.data.get('password2')
            # Validate required fields
            if not all([username, email, password, password2]):
                return Response(
                    {'error': 'All fields are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if password != password2:
                return Response(
                    {'error': 'Passwords do not match'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    logger.info(f"Login attempt with email: {email}")
    if not email or not password:
        return Response(
            {'error': 'Both email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        # First check if user exists
        user = User.objects.get(email=email)
        logger.info(f"User found: {user.username}")
        
        # Authenticate user
        user = authenticate(username=user.username, password=password)
        if user is None:
            logger.error("Authentication failed: Invalid password or inactive user")
            return Response(
                {'error': 'Invalid password. Please try again.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Log the user in
        login(request, user)
        logger.info(f"User {user.username} logged in successfully")
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })
    except User.DoesNotExist:
        logger.error("User does not exist")
        return Response(
            {'error': 'No account found with this email address.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response(
            {'error': 'An error occurred during login. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
class FrontendAppView(View):
    def get(self, request):
        try:
            # Assumes React index.html is in frontend/dist/index.html
            index_file_path = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')

            with open(index_file_path, 'r', encoding='utf-8') as file:
                return HttpResponse(file.read(), content_type='text/html')
        except FileNotFoundError:
            return HttpResponse(
                "React build not found. Please run `npm run build` in your React project.",
                status=501,
            )
        except Exception as e:
            return HttpResponse(f"Frontend Error: {str(e)}", status=500)
