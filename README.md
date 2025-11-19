# Student Life Manager 📚💰🎓

A comprehensive student management application built with React - your all-in-one solution for academic success, financial management, and productivity tracking. Designed specifically for college and university students.

![Built with React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Styled with Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)
![Animated with Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0080)

## ✨ Features

### 🔐 User Authentication
- **Sign Up & Login**: Secure user registration and authentication
- **User Profiles**: Personalized user profiles with statistics
- **Data Isolation**: Each user has their own separate data (tasks, transactions, wallets, debts)
- **Profile Management**: Update your name and email anytime

### ✅ Task Management
- Create, edit, and delete tasks
- Set task priorities (Low, Medium, High) with color coding
- Add due dates to stay organized
- Mark tasks as complete/incomplete
- Complete task history with advanced filters
- Search tasks by title
- Filter by status, priority, and date range

### 💰 Money Management
- Track income and expenses
- View real-time balance across all wallets
- Link transactions to specific wallets
- Visual categorization (income in green, expenses in red)
- Transaction history with search and filters
- Export transaction data to CSV
- Quick transaction creation with type toggle

### 💳 Multi-Wallet Support
- **4 Wallet Types**: Cash, Bank Account, Credit/Debit Card, Mobile Banking
- Create and manage multiple wallets
- Track individual wallet balances
- Edit wallet names and balances
- View total balance across all wallets
- See wallet usage in transaction history

### 💸 Debt & Loan Tracking
- Track money you've **lent to others**
- Track money you've **borrowed**
- Record loan dates and due dates
- Add descriptions/notes for context
- Mark debts as paid (full or partial payments)
- **Overdue tracking** with day counter
- **Email reminders** for outstanding debts
- Separate views for lent vs borrowed money
- Visual status indicators (Paid, Partial, Overdue)

### 🎓 Comprehensive Academic Planner (Merged Semester & Timetable)
- **Semester Setup**: Configure entire semester at once
  - Set semester name, start/end dates
  - Bangladesh public holidays pre-loaded (15 holidays)
  - Select applicable holidays for your institution
- **Bulk Class Schedule**: Add all weekly classes at once
  - Subject name, day, time, location, instructor
  - Color-coded for visual organization
  - Automatic weekly repetition
- **Class Schedule Tab**: Weekly view of all classes
  - Day-wise organization (Sunday-Saturday)
  - Edit/delete individual classes
  - Shows class type, time, location, instructor
- **Deadlines Tab**: Track all semester deadlines
  - Exams, assignments, semester end
  - Real-time countdown (days/hours)
  - Color-coded urgency
  - Link deadlines to specific courses

### 💸 Wallet-to-Wallet Transfer
- Transfer money between your wallets
- Automatic balance updates for both wallets
- Transaction logging with transfer type
- Prevents same-wallet transfers
- Shows only when you have 2+ wallets
- Optional description for each transfer

### ⏰ Focus Timer (Pomodoro)
- 25 and 50-minute study sessions
- Subject/topic tracking
- Start, pause, and reset controls
- Visual timer with gradient design
- Today's focus time statistics
- Session history tracking
- Study session counter
- Helps fight procrastination

### 💰 Shared Expenses
- Split bills with friends (Splitwise-style)
- Track who owes whom
- Multiple participants per expense
- Auto-calculate splits (equal or custom)
- Settlement recommendations
- Export expense summaries
- Filter by paid/unpaid status

### 📝 Notes Organizer
- Subject-based note organization
- File attachments support
- Pin important notes
- Color-coded subjects
- Rich text descriptions
- Filter by subject
- Quick note cards view
- Search functionality

### 🎯 Habit Tracker
- Daily habit tracking
- Visual streak counter
- Week grid view
- Quick-add preset habits
- Custom habit creation
- Completion statistics
- Color-coded status
- Motivational streaks

### 🎓 College Events Calendar
- Track campus events
- Event categories (Workshop, Seminar, Sports, etc.)
- Registration links
- Location and time details
- Countdown to events
- Filter by event type
- Color-coded categories
- RSVP tracking

### 📊 Enhanced Dashboard
- **Semester Countdown**: Next 3 upcoming deadlines
- **Today's Classes**: Quick view of today's schedule
- **Focus Time**: Today's total study minutes
- **Habit Streaks**: Track your daily habits
- Personalized greeting with user name
- Quick overview of all activities
- Task completion statistics
- Income vs expense summary
- Pending tasks preview
- Total balance display

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd to-do-list
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### First Time Setup
1. Click **Sign Up** to create a new account
2. Enter your name, email, and password
3. Start adding tasks, transactions, and wallets!

## 🎯 Usage Guide

### Managing Your Semester
1. Open **More** → **Semester Tracker**
2. Click **+** to add an event
3. Choose type: Exam, Assignment, or Semester End
4. Set date and optional time
5. View countdown on dashboard
6. Get visual warnings for urgent deadlines

### Setting Up Your Timetable
1. Open **More** → **Timetable**
2. Click **+** to add a class
3. Enter subject name
4. Select type (Lecture, Lab, Tutorial)
5. Choose day and set start/end times
6. Add location and instructor (optional)
7. Pick a color for the subject
8. View today's classes on dashboard
9. Switch between Today and Weekly views

### Using the Focus Timer
1. Open **More** → **Focus Timer**
2. Choose session length (25 or 50 minutes)
3. Enter what you're studying
4. Click **Start** to begin
5. Focus on your work without distractions
6. Timer alerts you when session ends
7. View today's total study time
8. Track your productivity over time

### Adding Tasks/Assignments
1. Go to **Tasks** tab
2. Click the **+** button
3. Enter task title, select priority, and set due date
4. Click **Add Task**
5. Check off when complete

### Managing Money
1. Go to **Money** tab
2. Click **+** to add a transaction
3. Select transaction type (Income/Expense)
4. Enter description and amount
5. Select a wallet (Cash, Bank, Card, Mobile Banking)
6. Click **Add Transaction**
7. View balance updates in real-time

### Managing Wallets
1. Open **More** menu → **Wallets**
2. Click **+** to create a new wallet
3. Choose wallet type and name
4. Set initial balance
5. Track spending per wallet

### Tracking Debts & Loans
1. Open **More** menu → **Debts & Loans**
2. Click **+** to add a record
3. Choose type:
   - **I Lent Money**: Track money you gave to others
   - **I Borrowed Money**: Track money you owe
4. Enter person's name, amount, and dates
5. Use **Remind** button to send payment reminders
6. Use **Mark Paid** to record payments

### Viewing History & Reports
- **Task History**: Complete task archive with advanced filters
- **Transaction History**: Financial history with CSV export
- **Dashboard**: Quick overview of all activities

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Storage**: LocalStorage (client-side)

## 📱 Navigation

### Bottom Tab Bar
- **Overview**: Dashboard with comprehensive student widgets
- **Tasks**: Quick access to task and assignment management
- **Money**: Transaction tracking and balance
- **More**: Access all academic and productivity features

### More Menu
- 🎓 **Semester Tracker**: Exam and assignment countdowns
- 📅 **Timetable**: Weekly class schedule
- ⏰ **Focus Timer**: Pomodoro study sessions
- 📋 **Task History**: Complete task archive with filters
- 💳 **Wallets**: Multi-wallet money management
- 📊 **Transactions**: Financial history with export
- 💸 **Debts & Loans**: Track money lent/borrowed
- 👤 **Profile**: User settings and statistics

## 🔒 Data Storage & Privacy

- All data is stored **locally** in your browser using LocalStorage
- Data persists between sessions
- **User-specific isolation**: Each user's data is completely separate
- No server or internet connection required
- Your data never leaves your device

## ⚠️ Security Notice

**Important**: This is a demonstration/learning application. For production use:
- Implement proper backend authentication
- Hash passwords using bcrypt or similar
- Use JWT or session tokens
- Add server-side validation
- Implement HTTPS
- Add rate limiting
- Use environment variables for sensitive data

## 🎨 Key Features Highlights

### User Experience
- 🎭 Smooth animations and transitions with Framer Motion
- 📱 Fully responsive mobile-first design
- 🎯 Intuitive navigation with sliding menu
- 💫 Modern, clean interface with gradient accents
- 🌈 Color-coded priorities and categories
- ⚡ Real-time updates without page refresh

### Data Management
- 🔄 Automatic data persistence
- 💾 LocalStorage for offline functionality
- 🗑️ Easy delete and edit operations
- 📊 Comprehensive statistics and summaries
- 🔍 Powerful search and filter capabilities
- 📤 CSV export for financial records

## 📂 Project Structure

```
src/
├── components/
│   ├── Layout.jsx           # Main layout wrapper
│   ├── Navbar.jsx           # Bottom navigation with sliding menu
│   └── TaskItem.jsx         # Task card component
├── context/
│   ├── AppContext.jsx       # Global app state (tasks, money, wallets, debts)
│   └── AuthContext.jsx      # Authentication state and user management
├── hooks/
│   └── useLocalStorage.js   # Custom hook for localStorage
├── pages/
│   ├── Dashboard.jsx        # Main overview page
│   ├── ToDo.jsx             # Task management
│   ├── Money.jsx            # Transaction management
│   ├── Wallets.jsx          # Wallet management
│   ├── Debts.jsx            # Debt & loan tracking
│   ├── TaskHistory.jsx      # Complete task history with filters
│   ├── TransactionHistory.jsx  # Transaction history with export
│   ├── Profile.jsx          # User profile and settings
│   └── Login.jsx            # Authentication page
├── App.jsx                  # Main app component
└── main.jsx                 # App entry point
```

## 🎓 Why Students Love This App

### Academic Success
- Never miss an exam or assignment deadline
- Stay organized with color-coded timetables
- Build focus habits with Pomodoro timer
- Track study hours for better time management

### Financial Control
- Manage multiple wallets (perfect for students with various accounts)
- Track hostel expenses and shared bills
- Monitor lending and borrowing with friends
- Export financial reports for parents

### Productivity
- Visual countdown creates urgency
- Habit tracking builds discipline
- Dashboard shows everything at a glance
- Mobile-first design for on-the-go use

## 🚀 Future Enhancements

Planned features for upcoming versions:
- [ ] **Shared Expenses**: Splitwise-style bill splitting with roommates
- [ ] **Notes Organizer**: Subject-wise notes with PDF/image upload
- [ ] **Habit Tracker**: Daily habits with streak visualization
- [ ] **College Events Calendar**: Track hackathons, seminars, and cultural events
- [ ] **Hostel Expense Mode**: Daily mess tracking and monthly summaries
- [ ] **Google Calendar Integration**: Auto-sync classes and deadlines
- [ ] Cloud synchronization with backend
- [ ] Multi-device support
- [ ] Budget planning and financial goals
- [ ] Recurring transactions
- [ ] Data backup and restore
- [ ] Dark mode theme
- [ ] Push notifications for classes and deadlines
- [ ] Charts and analytics
- [ ] Group study sessions
- [ ] AI-powered study recommendations

## 📄 Available Scripts

```bash
# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 💬 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the FEATURES.md file for detailed documentation

## 🎯 Perfect For

- 🎓 College & University Students
- 📚 High School Students  
- 🏠 Hostel & PG Residents
- 💼 Students with Part-time Jobs
- 🌍 International Students managing finances
- 👥 Students sharing expenses with roommates

## 📱 Mobile-First Design

This app is specifically designed for mobile users:
- ✅ Touch-optimized interface
- ✅ Responsive layout for all screen sizes
- ✅ Fast loading and smooth animations
- ✅ Works offline (LocalStorage)
- ✅ PWA-ready (can be installed on phone)
- ✅ One-handed navigation
- ✅ Clean, distraction-free UI

---

**Made with ❤️ for students, by understanding student needs**

*Study smart. Manage money. Achieve goals.* 🎓💰✨
# planio-academic-suite
