# Equipment Request System

## Overview

The Equipment Request System is a web-based application designed to streamline the process of requesting, approving, and managing equipment loans within an educational institution. It provides an intuitive interface for users to submit equipment requests, and for administrators to manage inventory and approve or decline requests.

## Features

- User authentication and authorization
- Equipment request submission
- Admin dashboard for managing equipment and requests
- Inventory management
- Equipment return tracking
- Email notifications for request status updates
- Multi-campus support

## Technologies Used

- Next.js (React framework)
- TypeScript
- Prisma (ORM)
- SQLite (Database)
- Tailwind CSS
- Shadcn UI components
- Kinde Auth (Authentication)
- Zod (Form validation)
- React Hook Form
- Framer Motion (Animations)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm or yarn
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/equipment-request-system.git
   ```

2. Navigate to the project directory:
   ```
   cd equipment-request-system
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or if you're using yarn:
   ```
   yarn install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```
   DATABASE_URL="file:./dev.db"
   KINDE_CLIENT_ID=your_kinde_client_id
   KINDE_CLIENT_SECRET=your_kinde_client_secret
   KINDE_ISSUER_URL=your_kinde_issuer_url
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Set up the database:
   ```
   npx prisma migrate dev
   ```

6. Run the development server:
   ```
   npm run dev
   ```
   or with yarn:
   ```
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- Users can log in and submit equipment requests through the request form.
- Administrators can access the dashboard to manage equipment, view and process requests, and monitor inventory.
- The system will send email notifications (when fully implemented) for various stages of the request process.

## Contributing

Contributions to the Equipment Request System are welcome. Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

If you have any questions or feedback, please contact the project maintainers at [maintainer@gmail.com](mailto:maintainer@gmail.com).

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Kinde Auth](https://kinde.com/)
- [Shadcn UI](https://ui.shadcn.com/)# Fleming-ERM
# Fleming-ERM
