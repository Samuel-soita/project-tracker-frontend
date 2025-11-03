# Moringa Project Planner - Frontend

A modern React-based frontend application for managing student projects, cohorts, and classes at Moringa School.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (Student/Admin)
- Protected routes

### Student Dashboard
- **My Projects Section**: View, edit, delete, and track your own projects
- **Other Students' Projects Section**: View projects created by other students (read-only)
- Create new projects with member invitations via email
- Drag-and-drop Kanban board for project progress tracking

### Admin Dashboard
- **Projects Tab**: View and manage all projects
- **Cohorts Tab**: Create, edit, and delete cohorts
- **Classes Tab**: Create, edit, and delete classes (Fullstack, Android, Data Science, etc.)
- Full CRUD operations on all resources

### Project Management
- Create projects with description, GitHub link, and tags
- Invite team members via email (they receive email invitations)
- Track project progress with a drag-and-drop Kanban board
  - To Do
  - In Progress
  - Done
- View project details and team members
- Edit/delete projects (owner or admin only)

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **@dnd-kit** - Drag and drop functionality for Kanban board
- **Lucide React** - Icon library
- **Fetch API** - HTTP client

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update `.env` file with your backend API URL
```
VITE_API_URL=http://localhost:5000
```

5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage

### As a Student

1. **Register/Login**
   - Create an account or login with existing credentials
   - Select "Student" as your role during registration

2. **Dashboard**
   - View your projects in the "My Projects" section
   - View other students' projects in the "Other Students' Projects" section

3. **Create a Project**
   - Click "New Project" button
   - Fill in project details (name, description, GitHub link, tags)
   - Add team members by email (they'll receive invitations)
   - Click "Create Project"

4. **Manage Your Projects**
   - Edit or delete your own projects
   - View project details and progress
   - Track tasks with the Kanban board (drag and drop)

5. **View Other Projects**
   - Browse projects from other students
   - View their progress (read-only)

### As an Admin

1. **Login as Admin**
   - Use admin credentials to login

2. **Manage Projects**
   - View all projects
   - Create, edit, or delete any project
   - Track progress for all projects

3. **Manage Cohorts**
   - Switch to "Cohorts" tab
   - Create new cohorts
   - Edit or delete existing cohorts

4. **Manage Classes**
   - Switch to "Classes" tab
   - Create new classes (e.g., Fullstack, Android, Data Science)
   - Edit or delete existing classes

## API Integration

The frontend communicates with the backend API using the Fetch API. All API calls are centralized in the `src/api` directory.

### Authentication
- JWT tokens are stored in localStorage
- Tokens are automatically attached to requests via the API client
- Automatic redirect to login on 401 Unauthorized

### Error Handling
- API errors are caught and displayed to users
- Network errors are handled gracefully

## Design

The UI is designed to match the Figma specifications with:
- Clean, modern interface
- Responsive design for mobile and desktop
- Consistent color scheme and typography
- Smooth transitions and hover effects

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
