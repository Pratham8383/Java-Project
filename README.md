# Smart Study Planner 📚

An intelligent, AI-powered study timetable generator designed to help students optimize their exam preparation. Smart Study Planner prioritizes subjects based on exam dates, generates personalized study schedules using the Gemini API, and tracks daily progress.

![App Screenshot](https://picsum.photos/seed/study/1200/600)

## ✨ Features

- **🤖 AI Schedule Generation**: Uses Google's Gemini API to create a balanced study plan tailored to your exam dates and priorities.
- **📅 Subject Management**: Track all your subjects, exam dates, and priority levels in one place.
- **⏱️ Task Tracking**: Stay on top of your study sessions with a detailed daily schedule.
- **✅ Integrated To-Do List**: Manage non-study tasks and general reminders alongside your academic schedule.
- **📊 Progress Dashboard**: Get a high-level view of your daily focus, pending tasks, and upcoming exam priorities.
- **🌓 Dark/Light Mode**: Beautifully crafted editorial-style UI that adapts to your preference.
- **📱 Responsive Design**: Fully optimized for both desktop and mobile devices.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide React.
- **Backend**: Node.js, Express.
- **Database**: SQLite (Better-SQLite3).
- **AI**: Google Gemini API (@google/genai).
- **Build Tool**: Vite.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/smart-study-planner.git
   cd smart-study-planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to `http://localhost:3000` in your browser.

## 📖 Usage

1. **Add Subjects**: Go to the "Subjects" tab and enter your subject names and exam dates.
2. **Generate Schedule**: Navigate to the "Schedule" tab and click "Generate Schedule". The AI will analyze your subjects and create a plan.
3. **Manage To-Dos**: Use the "To-Do List" tab for general tasks.
4. **Track Progress**: Check the "Dashboard" daily to see your "Today's Focus" and upcoming priorities.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Sahil, Pratham, Raghav, Nitin.
