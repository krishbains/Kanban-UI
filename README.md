# Kanban UI 🎯

A modern, feature-rich Kanban board application built with Next.js, featuring drag-and-drop functionality, AI-powered template generation, and real-time collaboration capabilities.

![Kanban UI](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-11.10.0-FFCA28?style=for-the-badge&logo=firebase)

## ✨ Features

### 🎨 **Interactive Kanban Board**
- **Drag & Drop**: Smooth drag-and-drop functionality for tasks and columns
- **Color Customization**: Customize column and task colors with an intuitive color wheel
- **Zoom Controls**: Pinch-to-zoom and scroll-to-zoom functionality for better navigation
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🤖 **AI-Powered Templates**
- **Smart Template Generation**: Use natural language to create custom Kanban boards
- **Gemini AI Integration**: Powered by Google's Gemini AI for intelligent template suggestions
- **Instant Generation**: Get fully configured boards with tasks and columns in seconds

### 💾 **Data Persistence**
- **Firebase Integration**: Real-time data synchronization across devices
- **Local Storage Fallback**: Works offline with local storage when Firebase is unavailable
- **Multiple Workspaces**: Create, save, and switch between different board configurations
- **Auto-save**: Automatic saving of your board state

### 🎯 **Advanced Task Management**
- **Task Operations**: Add, edit, delete, and move tasks between columns
- **Bulk Operations**: Select and manage multiple tasks at once
- **Column Management**: Create, rename, delete, and reorder columns
- **Visual Organization**: Color-coded tasks and columns for better organization

### 🔧 **Developer Experience**
- **TypeScript**: Full type safety and better development experience
- **Modern Stack**: Built with Next.js 15, React 18, and Tailwind CSS 4
- **Component Library**: Custom UI components with Radix UI primitives
- **Animation**: Smooth animations powered by Framer Motion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (optional, for cloud sync)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Kanban-UI.git
   cd Kanban-UI
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   # Firebase Configuration (optional)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Gemini AI API Key (for template generation)
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating Your First Board

1. **Use AI Templates**: Click the AI input button and describe your desired board (e.g., "A project management board with Todo, In Progress, and Done columns")
2. **Manual Setup**: Start with the default board and customize it to your needs
3. **Import Existing**: Load a previously saved workspace

### Managing Tasks

- **Add Tasks**: Click the "+" button in any column
- **Edit Tasks**: Double-click on a task to edit its title
- **Move Tasks**: Drag and drop tasks between columns
- **Delete Tasks**: Select tasks and use the delete button
- **Color Tasks**: Right-click on a task to change its color

### Customizing Columns

- **Add Columns**: Use the "+" button in the header
- **Rename Columns**: Double-click on column titles
- **Change Colors**: Use the color wheel to customize column appearance
- **Reorder Columns**: Drag columns to reorder them
- **Delete Columns**: Use the column menu to remove columns

### Using AI Templates

1. Click the AI input button in the sidebar
2. Describe your desired board structure in natural language
3. Wait for the AI to generate your template
4. Review and customize the generated board

### Saving and Loading Workspaces

- **Save**: Click the save button to store your current board
- **Load**: Use the workspace selector to switch between saved boards
- **Delete**: Remove unwanted workspaces from the sidebar

## 🏗️ Project Structure

```
Kanban-UI/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages and API routes
│   │   │   ├── Board.tsx    # Main Kanban board component
│   │   │   └── api/         # API routes for AI integration
│   │   ├── components/      # React components
│   │   │   ├── KanbanBox.tsx
│   │   │   ├── Task.tsx
│   │   │   ├── AIInput.tsx
│   │   │   └── ui/          # UI primitives
│   │   └── lib/             # Utilities and configurations
│   │       ├── firebase.ts  # Firebase configuration
│   │       └── workspace.ts # Workspace management
│   ├── public/              # Static assets
│   └── package.json         # Dependencies and scripts
├── netlify.toml             # Netlify deployment configuration
└── README.md               # This file
```

## 🔧 Configuration

### Firebase Setup
For cloud synchronization, follow the [Firebase Setup Guide](frontend/FIREBASE_SETUP.md) to:
1. Create a Firebase project
2. Enable Realtime Database
3. Configure environment variables
4. Set up database rules

### Deployment
The app is configured for deployment on Netlify. See the [Netlify Deployment Guide](frontend/NETLIFY_DEPLOYMENT.md) for detailed instructions.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

### Key Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Backend**: Firebase Realtime Database
- **AI**: Google Gemini API
- **Deployment**: Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Firebase](https://firebase.google.com/) for real-time database capabilities
- [Google Gemini](https://ai.google.dev/) for AI-powered features
- [@dnd-kit](https://dndkit.com/) for drag-and-drop functionality
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/Kanban-UI/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

**Happy organizing! 🎉**
