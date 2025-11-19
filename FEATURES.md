# Task & Money Management App

A comprehensive web application for managing tasks, expenses, and debts with user authentication and profile management.

## 🚀 Features

### Authentication System
- **User Registration**: Create a new account with name, email, and password
- **User Login**: Secure login system
- **Profile Management**: Update your profile information
- **User-Specific Data**: All tasks, transactions, wallets, and debts are stored per user

### Task Management
- ✅ Create, complete, and delete tasks
- 🎯 Set task priorities (Low, Medium, High)
- 📅 Set due dates for tasks
- 📊 View task history with advanced filters:
  - Filter by status (All, Completed, Pending)
  - Filter by priority (All, Low, Medium, High)
  - Filter by date range
  - Search tasks by title

### Money Management
- 💰 Track income and expenses
- 📊 View total balance across all wallets
- 🔍 View transaction history with filters:
  - Filter by type (Income/Expense)
  - Filter by date range
  - Search transactions
  - Export to CSV
- 💳 **Multi-Wallet Support**:
  - Cash
  - Bank Account
  - Credit/Debit Card
  - Mobile Banking
  - Create custom wallets
  - Track balance for each wallet
  - Transactions linked to specific wallets

### Debt & Loan Management
- 💵 Track money you've lent to others
- 💳 Track money you've borrowed
- 📅 Set loan dates and due dates
- 🔔 Send payment reminders via email
- ✅ Mark debts as paid (full or partial)
- ⏰ Overdue tracking with day counter
- 📝 Add descriptions/notes for each debt

### Dashboard
- 📊 Overview of all activities
- 📈 Quick stats on tasks and finances
- 💵 Total balance display
- 📋 Pending tasks preview
- 💰 Income and expense summary

### User Profile
- 👤 View and edit profile information
- 📊 Personal statistics:
  - Total tasks and completion rate
  - Transaction count and amounts
  - Debt/loan summary
- 🚪 Sign out functionality

## 🛠️ Technology Stack

- **Frontend**: React 19
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Storage**: Local Storage (client-side)

## 📦 Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

## 🎮 Usage

### Getting Started
1. **Sign Up**: Create an account with your name, email, and password
2. **Login**: Access your personalized dashboard

### Managing Tasks
1. Navigate to the **Tasks** tab
2. Click the **+** button to add a new task
3. Fill in task details (title, priority, due date)
4. Click tasks to mark them as complete
5. Delete tasks using the **X** button
6. View full task history in **Task History** (More menu)

### Managing Money
1. Navigate to the **Money** tab
2. Click **+** to add a transaction
3. Choose transaction type (Income/Expense)
4. Enter amount and description
5. Select a wallet (optional)
6. View transaction history in **Transactions** (More menu)

### Managing Wallets
1. Open the **More** menu (bottom navigation)
2. Select **Wallets**
3. Click **+** to create a new wallet
4. Choose wallet type and set initial balance
5. Edit or delete wallets as needed

### Managing Debts & Loans
1. Open the **More** menu
2. Select **Debts & Loans**
3. Click **+** to add a new record
4. Choose type:
   - "I Lent Money" - Track money you gave to others
   - "I Borrowed Money" - Track money you owe
5. Enter person's name, amount, dates, and notes
6. Use **Remind** button to send payment reminders
7. Use **Mark Paid** to record payments

### Viewing History
- **Task History**: Filter and search through all your tasks
- **Transaction History**: Filter transactions by type, date, and search terms
- Export transaction data to CSV

## 📱 Navigation

### Bottom Tab Bar
- **Overview**: Dashboard with summary
- **Tasks**: Quick task management
- **Money**: Transaction tracking
- **More**: Access additional features

### More Menu
- Task History
- Wallets
- Transactions
- Debts & Loans
- Profile

## 💾 Data Storage

All data is stored locally in your browser using LocalStorage:
- Data persists between sessions
- User-specific data isolation
- No server required
- Privacy-focused (data stays on your device)

## 🔒 Security Note

**Important**: This is a demonstration application. In a production environment:
- Passwords should be properly hashed (not stored in plain text)
- Use a backend server with secure authentication
- Implement proper session management
- Add data validation and sanitization
- Use HTTPS for all connections

## 🎨 Features Highlights

### User Experience
- 🎭 Smooth animations and transitions
- 📱 Mobile-responsive design
- 🎯 Intuitive navigation
- 💫 Modern, clean interface
- 🌈 Color-coded priorities and categories

### Data Management
- 🔄 Real-time updates
- 💾 Automatic data persistence
- 🗑️ Soft delete functionality
- 📊 Comprehensive statistics
- 🔍 Powerful search and filter options

## 🚀 Future Enhancements

Potential features for future versions:
- Cloud synchronization
- Multi-device support
- Budget planning and goals
- Recurring transactions
- Transaction categories
- Data backup and restore
- Dark mode
- Email/SMS notifications
- Receipt photo uploads
- Reports and analytics
- Currency conversion
- Multi-language support

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💬 Support

If you have any questions or need help, feel free to open an issue.

---

Made with ❤️ for personal finance and productivity management
