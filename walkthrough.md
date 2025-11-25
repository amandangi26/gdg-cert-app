# GDG Certificate Downloader Walkthrough

This application allows organizers to upload attendee data and certificate templates, and allows attendees to download their personalized certificates.

## Features

- **Admin Panel**: Upload Excel/CSV files and PDF templates.
- **Public Lookup**: Search by email and download certificates.
- **PDF Generation**: Automatically overlays the attendee's name on the uploaded template.

## How to Use

### 1. Setup (First Time)
The application uses a local SQLite database (`dev.db`). It has been initialized with the schema.

### 2. Admin Panel
Navigate to `/admin` (e.g., `http://localhost:3000/admin`).

1.  **Upload Attendee Data**:
    - Prepare an Excel (`.xlsx`) or CSV file.
    - **Format**: No headers.
        - Column 1: Full Name
        - Column 2: Email Address
    - Upload the file using the "Attendee Data" form.

2.  **Upload Certificate Template**:
    - Upload a PDF file that will serve as the background.
    - The system will overlay the name in the center of the first page.
    - **Note**: You can adjust the font size and position in `lib/pdf-generator.ts` if needed.

### 3. Public Certificate Lookup
Navigate to the home page `/` (e.g., `http://localhost:3000`).

1.  Enter the email address used during registration.
2.  Click "Find Certificate".
3.  If found, a download button will appear.

## Configuration

- **Name Placement**: Edit `lib/pdf-generator.ts` to change `fontSize`, `yOffset`, or `color`.
- **Database**: The database is located at `prisma/dev.db`. You can view it using `npx prisma studio`.

## Development

- Run `npm run dev` to start the development server.
- Run `npx prisma studio` to manage the database via UI.
