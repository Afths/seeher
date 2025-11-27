# SeeHer - Talent Discovery Platform

**SeeHer** is a talent discovery platform designed to help users find and connect with talented women professionals. The platform allows users to search, filter, and discover women professionals across various fields including speakers, panelists, and board members.

## Project Overview

### What is SeeHer?

SeeHer is a web application that serves as a directory and search platform for women professionals. It enables:

-   **Search & Discovery**: Users can search for professionals by name, bio, expertise, keywords, and more
-   **Advanced Filtering**: Filter by interest type (Speaker, Panelist, Board Member), languages, areas of expertise, and memberships
-   **Profile Management**: Users can submit profiles for review, and admins can approve/reject them
-   **Admin Dashboard**: Admins can review submissions, approve profiles, and manage the platform

### Key Features

1. **Search Functionality**

    - Text search across multiple fields (name, bio, job title, company, keywords, expertise)
    - Real-time filtering as users adjust criteria
    - Results sorted by profile completeness

2. **Filtering System**

    - Filter by interest type (All, Speaker, Panelist, Board Member)
    - Filter by languages (OR logic - shows profiles with any selected language)
    - Filter by areas of expertise (OR logic)
    - Filter by memberships (OR logic)

3. **Profile Submission**

    - Public form for submitting new profiles
    - Profiles require admin approval before appearing in search results
    - Status tracking: PENDING_APPROVAL → APPROVED or NOT_APPROVED

4. **Admin Features**

    - Review pending and rejected submissions
    - Approve profiles (automatically sends welcome email)
    - Reject profiles
    - AI-powered expertise suggestions

5. **Authentication**
    - Email-based authentication via Supabase
    - Magic link sign-in
    - Admin role-based access control

### Architecture

The application follows a modern React architecture:

-   **Frontend**: React + TypeScript + Vite
-   **UI Components**: shadcn-ui (Radix UI components) + Tailwind CSS
-   **Backend**: Supabase (PostgreSQL database, Authentication, Edge Functions)
-   **State Management**: React Context API for auth, React Query for server state
-   **Routing**: React Router for client-side routing

### Project Structure

```
seeher/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn-ui components
│   │   ├── TalentCard.tsx   # Profile card component
│   │   ├── SearchFilters.tsx # Filter component
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useTalentSearch.ts # Search functionality hook
│   │   ├── useIsAdmin.ts    # Admin check hook
│   │   └── ...
│   ├── integrations/        # External service integrations
│   │   └── supabase/        # Supabase client and types
│   ├── lib/                 # Utility functions
│   │   ├── validation.ts    # Zod schemas for validation
│   │   └── utils.ts         # Helper functions
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Main search page
│   │   ├── AdminDashboard.tsx # Admin dashboard
│   │   └── NotFound.tsx     # 404 page
│   ├── App.tsx              # Main app component with routing
│   └── main.tsx             # Application entry point
├── supabase/                # Supabase configuration
│   ├── functions/           # Edge functions
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

### Data Flow

1. **Search Flow**:

    - User enters search term or adjusts filters
    - `useTalentSearch` hook triggers search
    - Query Supabase `women` table with explicit field selection (excludes sensitive data, filters out own profile)
    - Apply text search and array filters client-side
    - Sort by completeness and display results

2. **Profile Submission Flow**:

    - User fills out submission form
    - Profile saved with status `PENDING_APPROVAL`
    - Admin reviews in dashboard
    - Admin approves → status becomes `APPROVED`, welcome email sent
    - Profile now appears in search results

3. **Authentication Flow**:
    - User requests magic link via email
    - Supabase sends email with sign-in link
    - User clicks link → authenticated session created
    - Session persisted in localStorage
    - Auth state managed via `AuthContext`

## Project info

**URL**: https://lovable.dev/projects/ff219910-7672-45d0-b021-5058e4c6f7e2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ff219910-7672-45d0-b021-5058e4c6f7e2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

-   Navigate to the desired file(s).
-   Click the "Edit" button (pencil icon) at the top right of the file view.
-   Make your changes and commit the changes.

**Use GitHub Codespaces**

-   Navigate to the main page of your repository.
-   Click on the "Code" button (green button) near the top right.
-   Select the "Codespaces" tab.
-   Click on "New codespace" to launch a new Codespace environment.
-   Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

-   Vite
-   TypeScript
-   React
-   shadcn-ui
-   Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ff219910-7672-45d0-b021-5058e4c6f7e2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
