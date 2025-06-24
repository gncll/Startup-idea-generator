# Startup Idea Generator

A Next.js application that generates comprehensive startup ideas using AI, with user authentication powered by Clerk.

## Features

- 🔐 **User Authentication** - Secure sign-in/sign-up with Clerk
- 🤖 **AI-Powered Idea Generation** - Generate detailed startup ideas using OpenAI GPT-4
- 📊 **Comprehensive Business Plans** - MVP features, market analysis, roadmaps
- 🎯 **Validation Strategies** - Platform-specific content strategies
- 📈 **Weekly Development Plans** - Customizable timeline roadmaps
- 📄 **Export to PDF** - Download your startup ideas as HTML/PDF reports
- 🔄 **Section Rewriting** - Regenerate specific sections of your idea

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd startup-idea-generator
npm install
```

### 2. Set up Clerk Authentication

1. Go to [Clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. From your Clerk dashboard, copy your API keys

### 3. Set up OpenAI API

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key from your account settings

### 4. Environment Variables

Create a `.env.local` file in your project root and add:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Clerk Keys (get these from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## How to Use

1. **Sign Up/Sign In** - Create an account or sign in to access the generator
2. **Fill the Form** - Describe your problem, solution, target audience, and preferences
3. **Generate Ideas** - Click "Generate Startup Idea" to get your AI-powered business plan
4. **Customize** - Use the "Rewrite" buttons to regenerate specific sections
5. **Export** - Download your idea as an HTML file that can be converted to PDF

## Project Structure

```
├── components/
│   └── StartupIdeaGenerator.js  # Main component with authentication
├── pages/
│   ├── _app.js                  # App wrapper with ClerkProvider
│   ├── index.js                 # Home page
│   ├── sign-in/[[...index]].js  # Sign-in page
│   ├── sign-up/[[...index]].js  # Sign-up page
│   └── api/
│       ├── generate-idea.js     # Protected API for idea generation
│       └── rewrite-section.js   # Protected API for section rewriting
├── middleware.js                # Clerk authentication middleware
└── styles/
    └── globals.css              # Global styles with Tailwind
```

## Authentication Features

- **Protected Routes** - All main functionality requires authentication
- **User Profile** - Display user information in the header
- **Secure APIs** - All API endpoints are protected with Clerk authentication
- **Sign Out** - Easy sign-out functionality

## Tech Stack

- **Next.js** - React framework
- **Clerk** - Authentication and user management
- **OpenAI GPT-4** - AI-powered idea generation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Deployment

1. Deploy to Vercel, Netlify, or your preferred platform
2. Add your environment variables to the deployment platform
3. Make sure to update Clerk's allowed origins in your Clerk dashboard

## Support

If you encounter any issues:
1. Check that all environment variables are set correctly
2. Verify your Clerk and OpenAI API keys are valid
3. Ensure your deployment platform has the correct environment variables

## License

MIT License - feel free to use this project for your own applications! 