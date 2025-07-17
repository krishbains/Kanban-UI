# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "kanban-ui-demo")
4. Follow the setup wizard (you can disable Google Analytics for now)

## 2. Enable Realtime Database

1. In your Firebase project console, go to "Realtime Database"
2. Click "Create Database"
3. Choose a location (pick the closest to your users)
4. Start in test mode (for development)

## 3. Get Firebase Configuration

1. In Firebase console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and choose "Web"
4. Register your app with a nickname (e.g., "kanban-ui-web")
5. Copy the firebaseConfig object

## 4. Update Environment Variables

Create a `.env.local` file in the `frontend` directory with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Update Database Rules

In Firebase Realtime Database, go to "Rules" tab and update the rules to:

```json
{
  "rules": {
    "workspaces": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 6. Test the Application

1. Start the development server: `npm run dev`
2. Open your browser and navigate to `http://localhost:3000`
3. Try creating, editing, and saving workspaces
4. Check the browser console for any Firebase-related errors

## Features

- **Save Button**: Saves the current board state to Firebase
- **Workspace Selector**: Switch between different saved workspaces
- **Real-time Updates**: Changes are immediately reflected in the console
- **Auto-load**: Workspaces are automatically loaded on page refresh

## Troubleshooting

- If you see Firebase connection errors, check your configuration in `.env.local`
- Make sure your Firebase project has Realtime Database enabled
- Verify the database rules allow read/write access
- Check the browser console for detailed error messages 