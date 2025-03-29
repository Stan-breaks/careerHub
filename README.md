# CareerHub

CareerHub is a career assessment and guidance platform that helps students discover potential career paths based on their skills, interests, and personality traits.

## Features

- **User Verification System**: Admin-controlled verification process for new user accounts
- **Assessments**: Take various assessments to identify career matches
- **Career Paths**: Explore different career options based on assessment results
- **Admin Dashboard**: Manage users, assessments, and platform settings

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/careerhub.git
   cd careerhub
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
careerhub/
├── src/
│   ├── app/                  # Next.js App Router files
│   │   ├── admin/            # Admin-specific pages
│   │   ├── api/              # API routes
│   │   ├── assessments/      # Assessment pages
│   │   ├── career-paths/     # Career paths pages 
│   │   └── dashboard/        # User dashboard
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities and configurations
│   └── models/               # MongoDB models
└── public/                   # Static files
```

## User Flow

1. User registers for an account
2. Admin verifies the user's account
3. User can take assessments once verified
4. Assessment results guide users to potential career paths
5. Users can explore recommended courses and resources

## Admin Features

- User management (verification, role assignment)
- Assessment creation and management
- Platform statistics and insights

## API Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin-specific endpoints
- `/api/users/*` - User management endpoints
- `/api/assessments/*` - Assessment endpoints
- `/api/career-paths/*` - Career paths endpoints

## License

This project is licensed under the MIT License.
