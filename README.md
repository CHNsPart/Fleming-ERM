# Equipment Request System

## Overview

The Equipment Request System is a web-based application that manages equipment lending in educational institutions. Built with modern web technologies, it features a clean interface for users to request equipment and an administrative dashboard for inventory management.

## Key Features

- **User Authentication**: Secure login through Kinde Auth integration
- **Equipment Management**: 
  - View available equipment with real-time inventory tracking
  - Image support for equipment items
  - Quantity and availability tracking
- **Request System**:
  - Intuitive request form with validation
  - Support for multiple campuses (Sutherland and Frost)
  - Purpose specification and date selection
  - Equipment return tracking
- **Admin Dashboard**:
  - Comprehensive request management (approve/decline)
  - Equipment type management with image uploads
  - Analytics dashboard with usage statistics
  - Equipment inventory monitoring
- **Real-time Status Updates**: Track request status from pending to return

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS with custom theming
- Shadcn UI components
- React Hook Form with Zod validation
- Recharts for analytics visualization
- Framer Motion for animations

### Backend
- Next.js API routes
- Prisma ORM
- SQLite database
- Sharp for image processing
- UUID for unique identifiers

### Authentication
- Kinde Auth with Next.js integration
- Role-based access control

## Prerequisites

- Node.js (version specified in package.json)
- npm or yarn
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   KINDE_CLIENT_ID=your_kinde_client_id
   KINDE_CLIENT_SECRET=your_kinde_client_secret
   KINDE_ISSUER_URL=your_kinde_issuer_url
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/app` - Next.js 14 app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and database configuration
- `/prisma` - Database schema and migrations
- `/public` - Static assets and uploaded files

## Development Notes

### API Routes
- Equipment management: `/api/equipment-types`
- Request handling: `/api/requests`
- Image uploads: `/api/upload`

### Admin Access
- Admin email: projectapplied02@gmail.com
- Admin features are restricted to this account

### Database
- Uses SQLite for development
- Automatic seeding with sample equipment data
- Production database stored in `/tmp` for Vercel deployment

## Deployment

The project is configured for deployment on Vercel with:
- Custom memory allocation (1024MB)
- Maximum function duration of 10 seconds
- Automatic database initialization
- Image upload support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License (see LICENSE file)