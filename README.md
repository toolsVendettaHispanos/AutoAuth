# AutoAuth

This is a Next.js application that demonstrates automatic authentication.

## Features

- **Automatic Authentication**: When visiting the root page, the app automatically attempts to log in with hardcoded credentials.
- **Loading State**: A loading screen is displayed during the authentication process.
- **Secure Dashboard**: Upon successful authentication, the user is redirected to a secure `/overview` dashboard.

## Getting Started

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The app will automatically attempt to authenticate and redirect you to `/overview`.
