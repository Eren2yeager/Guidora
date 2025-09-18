# Educational Advisor Platform

This project is a comprehensive educational advisor platform designed to guide students through their academic and career journeys. It provides features for career exploration, college and course discovery, scholarship opportunities, and interactive quizzes, all managed through an intuitive administrative interface.

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

## 🛠️ Development Setup

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
    Create a `.env.local` file in the root directory and add the following:
    ```
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret
    FIREBASE_API_KEY=your_firebase_api_key
    # ... other Firebase related environment variables
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
.
├── app/                      # Next.js App Router (pages, API routes)
│   ├── (protected)/          # Protected routes requiring authentication
│   │   ├── api/              # API routes for various features
│   │   ├── admin/            # Admin panel routes and API
│   │   └── ...               # Other protected features (careers, colleges, etc.)
│   ├── admin/                # Admin specific pages
│   ├── auth/                 # Authentication related pages
│   └── ...                   # Other public pages and global layouts
├── components/               # Reusable React components
│   ├── admin/                # Admin-specific UI components
│   ├── home/                 # Homepage specific components
│   ├── layout/               # Layout components (Navbar, Footer)
│   └── onboarding/           # Onboarding related components
├── contexts/                 # React Context API for global state
├── data/                     # Static data or templates
├── lib/                      # Utility functions and configurations
│   ├── auth.js               # NextAuth.js configuration
│   ├── firebaseAdmin.js      # Firebase Admin SDK setup
│   ├── firebaseClient.js     # Firebase Client SDK setup
│   ├── mongodb.js            # MongoDB connection utility
│   ├── rbac.js               # Role-Based Access Control logic
│   └── smsService.js         # SMS sending service
├── models/                   # Mongoose schemas and models
├── public/                   # Static assets (images, fonts)
├── scripts/                  # Utility scripts (e.g., data seeding)
└── ...                       # Other configuration files (package.json, next.config.mjs, etc.)
```
