4.3.3 Class Diagram
1.User Class: This class represents system users. It contains all the essential attributes required to authenticate and categorize users.
Methods: login(): Validates user credentials for authentication, and manageProfile(): Allows the user to update profile information.
2.Document Class: This class holds metadata and content for uploaded contracts.
Methods: upload(): Allows the user to upload a document, and submitForAnalysis(): Sends the document for clause extraction and review.
3.Analysis Class: This class stores analysis results derived from the uploaded document.
Method: generateReport(): Compiles the analysis result into a structured report.

4.5 Database Design

4.5.1 Tables
The database for the system has 3 tables, which are User, Document, and Analysis, which store data of users and the activity, like analysis, on the contracts.

1. Users Table
This table holds all the user account details for the system. It distinguishes between different types of users, such as clients, legal professionals, and administrative staff, using the account_type field. Each user is uniquely identified by an id, and their login credentials and profile information are stored securely. The created_at field tracks when the account was registered.
Use in the system:
Handles authentication and access control
Links users to their uploaded documents
Allows role-based interactions (for example, only legal professionals can view analysis reports)

Field Name	Data Type	Description
id	INTEGER (PK)	Unique identifier for each user
username	VARCHAR(150)	User's login name
email	VARCHAR(254)	User's email address
password	VARCHAR(128)	Hashed password for authentication
account_type	VARCHAR(50)	Role of the user (e.g.user, client, lawfirm, admin)
created_at	TIMESTAMP	Date the user account was created
Table 4.1: User
2. Documents Table
This table stores all uploaded legal contracts, including their metadata such as title, status, and upload date. The content field contains the extracted text of the document (from PDF, DOCX, image). Each document is associated with a user (user_id), indicating who uploaded it.
Use in the system:
Manages document submissions from users
Stores scanned or text documents for analysis
Tracks the progress/status of each document (for example in review, completed)

Field Name	Data Type	Description
id	INTEGER (PK)	Unique identifier for each document
title	VARCHAR(200)	Name/title of the uploaded contract
content	TEXT	Full extracted text of the contract
upload_date	TIMESTAMP	Date and time of upload
status	VARCHAR(50)	Current status (e.g., pending, analyzed)
user_id	INTEGER (FK)	Link to the user who uploaded the document
Table 4.2: Documents

3.Analysis Table
This table contains the output of the system's clause extraction and sentiment analysis. Each record links back to a specific document via document_id. The result field stores detailed structured results, which may include extracted clauses, flagged risks, and compliance summaries. The analysis_date logs when the analysis was performed.
Use in the system:
Displays clause extraction results to users
Enables reporting and compliance checks
Supports search and filtering for historical analyses.
Field Name	Data Type	Description
id	INTEGER (PK)	Unique identifier for each analysis record
document_id	INTEGER (FK)	References the related document
result	TEXT	JSON or structured text of the analysis result
analysis_date	TIMESTAMP	Date the analysis was completed
Table 4.3: Analysis


4.7.2 Network Security
To protect data transmission and prevent unauthorized access to system services, the following network security measures are implemented:
1.SSL/TLS Encryption: All data exchanged between users and the system is encrypted using HTTPS protocols via SSL/TLS certificates. This ensures that contract uploads, analysis results, and login credentials remain secure during transmission.
2.Firewall and Endpoint Protection: The hosting environment is configured with strict firewall rules to filter and block unauthorized traffic. Endpoint protection tools monitor server access, detect intrusions, and mitigate threats in real-time.
3.Secure API Authentication: The system uses JWT (JSON Web Token) authentication for secure access to all API endpoints. Each request is validated using tokens issued upon successful login, ensuring that only authorized users interact with protected services.

4.7.3Operational Security
Operational security focuses on enforcing secure practices during the system's day-to-day use, including access control and system monitoring:
1.Role-Based Access Control (RBAC): The system defines clear roles such as admin, legal professional, and client. Each role has limited access based on its privileges to prevent unauthorized access to documents or sensitive features.
