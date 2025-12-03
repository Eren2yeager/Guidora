# Digital Guidance Platform for Students

> A comprehensive web application addressing the critical gap in career awareness and educational guidance for students in government degree colleges.

## 🎯 Problem Statement

The decline in student enrollment in government degree colleges stems from a critical awareness gap. Students and parents often don't understand:
- The importance of graduation and career opportunities different degrees unlock
- How to choose subject streams based on personal interests and future prospects
- What degree programs are available in nearby government colleges
- Career paths and higher education options after specific courses

This confusion leads to poor academic decisions, dropouts, and migration to private institutions. **This platform bridges that gap.**

## 💡 Solution Overview

A one-stop personalized career and education advisor that empowers students to make informed academic decisions through:

- **Aptitude-based recommendations** using interactive quizzes
- **Career path mapping** showing real-world outcomes for each degree
- **Government college directory** with location-based search
- **Timeline tracking** for admissions and scholarships
- **AI-driven personalization** tailored to each student's profile

## 🌟 Key Features

### For Students
- **Interest & Aptitude Assessment**: Short quizzes to identify strengths and personality traits
- **Smart Course Suggestions**: Personalized recommendations for Arts, Science, Commerce, or Vocational streams
- **Career Path Visualization**: Detailed charts showing industries, jobs, and higher education options for each degree
- **College Discovery**: Location-based listing of government colleges with eligibility, facilities, and cut-offs
- **Scholarship Finder**: Comprehensive database of scholarship opportunities
- **Timeline Notifications**: Never miss admission dates, scholarship windows, or entrance test schedules

### For Administrators
- **Bulk Data Import**: Efficiently manage interests, careers, colleges, courses, and scholarships
- **Content Management**: Full CRUD operations for all educational resources
- **User Management**: Role-based access control and user oversight
- **Analytics Dashboard**: Track platform usage and student engagement

## 🎨 Live Demo
https://guidora-three.vercel.app

## 📸 Screenshots

### Home Page
![Home Page](/screenshots/home.png)

### Dashboard
![User Dashboard](/screenshots/dashboard.png)

### Career Exploration
![Career Exploration](/screenshots/careers.png)

### College Discovery
![College Discovery](/screenshots/colleges.png)

### Course Browsing
![Course Browsing](/screenshots/courses.png)

### Degree Programs
![Degree Programs](/screenshots/degrees.png)

### Interactive Quizzes
![Interactive Quizzes](/screenshots/quizes.png)

### Scholarship Finder
![Scholarship Finder](/screenshots/scholarships.png)

### Counselor Support
![Counselor Support](/screenshots/counselors.png)

## 🚀 Features & Tech Stack

This platform is built using a modern and robust tech stack, leveraging the power of Next.js for a performant and scalable application.

### Core Technologies

*   **Frontend Framework:** Next.js (App Router) & React.js
    *   Utilizes the latest Next.js App Router for efficient routing, server components for data fetching, and client components for interactive UI.
    *   React.js forms the foundation for building dynamic and responsive user interfaces.
*   **Styling:** Tailwind CSS
    *   A utility-first CSS framework for rapidly building custom designs.
*   **Database:** MongoDB with Mongoose
    *   MongoDB serves as the NoSQL database for flexible data storage.
    *   Mongoose is used as an elegant ODM (Object Data Modeling) library for MongoDB in a Node.js environment.
*   **Authentication:** NextAuth.js & Firebase
    *   NextAuth.js provides a complete open-source authentication solution for Next.js applications.
    *   Firebase is integrated for robust phone authentication capabilities.
*   **Animations:** Framer Motion
    *   A production-ready motion library for React, used to create smooth and engaging UI animations.

### Feature-Specific Tech Stack Breakdown

#### 1. User Authentication & Authorization

*   **Tech Stack:** NextAuth.js, Firebase (for Phone Auth), MongoDB (for user data storage), `lib/auth.js`, `providers/authProvider.js`.
*   **Description:** Secure user registration, login, password reset (email and phone-based), and session management. Role-Based Access Control (RBAC) is implemented to manage user permissions.
*   **Key Files:**
    *   `app/auth/signin/page.js`
    *   `app/auth/signup/page.js`
    *   `app/auth/forgot-password/page.js`
    *   `app/auth/phone-forgot-password/page.js`
    *   `lib/auth.js`
    *   `lib/firebaseAdmin.js`
    *   `lib/firebaseClient.js`
    *   `lib/rbac.js`
    *   `models/User.js`

#### 2. Admin Panel

*   **Tech Stack:** Next.js (Server & Client Components), React.js, Tailwind CSS, MongoDB, Mongoose, `lib/rbac.js`.
*   **Description:** A protected administrative interface for managing various aspects of the platform, including:
    *   **Data Import:** Bulk import of interests, careers, colleges, courses, and other educational data.
    *   **Data Management:** CRUD operations for all entities (users, careers, colleges, scholarships, quizzes, etc.).
    *   **User Management:** Overseeing user accounts and roles.
    *   **Reporting & Analytics:** (Assumed) Displaying key metrics and insights.
*   **Key Files:**
    *   `app/admin/(protected)/page.js`
    *   `app/(protected)/api/admin/import/interests/route.js` (and similar for other data types)
    *   `components/admin/DataTable.jsx`
    *   `components/admin/ActionCard.jsx`
    *   `components/admin/ConfirmDialog.jsx`

#### 3. Career & Educational Resource Management

*   **Tech Stack:** Next.js (API Routes), MongoDB, Mongoose, React.js, Tailwind CSS.
*   **Description:** Comprehensive sections for exploring careers, discovering colleges and universities, browsing courses and degree programs, and finding scholarship opportunities.
*   **Key Files:**
    *   `app/(protected)/careers/page.js`
    *   `app/(protected)/colleges/page.js`
    *   `app/(protected)/courses/page.js`
    *   `app/(protected)/programs/page.js`
    *   `app/(protected)/scholarships/page.js`
    *   `models/Career.js`, `models/College.js`, `models/Course.js`, `models/DegreeProgram.js`, `models/Scholarship.js`, `models/University.js`

#### 4. Interactive Quizzes

*   **Tech Stack:** Next.js, MongoDB, Mongoose, React.js, Tailwind CSS.
*   **Description:** Users can take quizzes to assess their interests and aptitudes, which can then be used to provide personalized recommendations.
*   **Key Files:**
    *   `app/(protected)/quizzes/page.js`
    *   `models/QuizQuestion.js`
    *   `models/QuizResult.js`
    *   `components/onboarding/QuizRedirect.jsx`

#### 5. User Dashboard & Profile Management

*   **Tech Stack:** Next.js, MongoDB, Mongoose, React.js, Tailwind CSS.
*   **Description:** A personalized dashboard for each user to view their progress, saved items, quiz results, and manage their profile information.
*   **Key Files:**
    *   `app/(protected)/dashboard/page.js`
    *   `app/(protected)/profile/page.js`
    *   `models/SavedItem.js`
    *   `models/Recemondation.js`

#### 6. Global State & Notifications

*   **Tech Stack:** React Context API.
*   **Description:** Manages global application state, including user authentication status and toast notifications for user feedback.
*   **Key Files:**
    *   `contexts/ToastContext.js`
    *   `providers/authProvider.js`

#### 7. SMS Service Integration

*   **Tech Stack:** Node.js.
*   **Description:** A service for sending SMS messages, primarily used for phone authentication and potentially for notifications.
*   **Key Files:**
    *   `lib/smsService.js`

#### 8. Data Seeding & Initialization

*   **Tech Stack:** Node.js scripts.
*   **Description:** Scripts to populate the database with initial data, useful for development and deployment.
*   **Key Files:**
    *   `scripts/seed.mjs`
    *   `data/templates/*.json`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Firebase account (for phone authentication)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd sih-problem-educational-advisor
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    
    # Firebase Configuration
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    FIREBASE_APP_ID=your_firebase_app_id
    ```

4.  **Seed the database (optional):**
    ```bash
    node scripts/seed.mjs
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```
.
├── app/                      # Next.js App Router
│   ├── (protected)/          # Protected routes (requires authentication)
│   │   ├── careers/          # Career exploration pages
│   │   ├── colleges/         # College discovery
│   │   ├── courses/          # Course browsing
│   │   ├── dashboard/        # User dashboard
│   │   ├── quizzes/          # Interactive assessments
│   │   └── scholarships/     # Scholarship finder
│   ├── admin/                # Admin panel
│   ├── auth/                 # Authentication pages
│   └── api/                  # API routes
├── components/               # Reusable React components
│   ├── admin/                # Admin UI components
│   ├── dashboard/            # Dashboard widgets
│   ├── quiz/                 # Quiz components
│   └── ui/                   # Shared UI elements
├── lib/                      # Core utilities
│   ├── auth.js               # NextAuth configuration
│   ├── mongodb.js            # Database connection
│   ├── rbac.js               # Role-based access control
│   └── firebaseClient.js     # Firebase setup
├── models/                   # Mongoose schemas
│   ├── User.js               # User model
│   ├── Career.js             # Career data
│   ├── College.js            # College information
│   └── QuizResult.js         # Quiz results
└── scripts/                  # Utility scripts
    └── seed.mjs              # Database seeding
```

## 🎓 Impact & Benefits

### For Students
- **Informed Decision Making**: Clear understanding of career paths and course outcomes
- **Reduced Dropouts**: Better alignment between interests and chosen streams
- **Equal Access**: Democratized career guidance regardless of location or economic status
- **Time Savings**: Centralized information eliminates hours of research

### For Government Colleges
- **Increased Enrollment**: Better visibility and awareness among target students
- **Improved Perception**: Positioned as viable career-building institutions
- **Data-Driven Insights**: Analytics on student interests and trends

### Measurable Outcomes
- Improved enrollment rates in government degree colleges
- Reduced post-Class 10/12 dropouts
- Increased scholarship application rates
- Higher student satisfaction with course selection

## 🔐 Security Features

- **NextAuth.js Integration**: Secure session management
- **Role-Based Access Control (RBAC)**: Granular permission system
- **Firebase Phone Authentication**: Multi-factor authentication support
- **Environment Variable Protection**: Sensitive data kept secure
- **MongoDB Security**: Encrypted connections and secure queries

## 🧪 Testing

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


