# Planio - Student Life Manager

Production-ready full-stack application with MongoDB Atlas integration.

## Environment Setup

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://planioadmin-Dip:Dipayon441MongoDBPlanio@planiodatabase.lh8qbcu.mongodb.net/planio?retryWrites=true&w=majority
JWT_SECRET=7c20684dd8176a8bd9ce280ffc795b740845dbe3a3011ca452961c2b04816d865685494230fe416af245bfeeaa4874418ab3625714405f3a03fa117bb86b82c2
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### 1. Start Backend
```bash
cd backend
npm start
```
Backend runs on: http://localhost:5000

### 2. Start Frontend
```bash
npm run dev
```
Frontend runs on: http://localhost:5174

## Features Connected to Backend

✅ **Authentication System**
- Sign up with email/password
- Login with JWT tokens
- Secure token management
- Auto-logout on token expiration

✅ **Tasks Management**
- Create, read, update, delete tasks
- Toggle task completion
- All data synced with MongoDB

✅ **Money Management**
- Track income and expenses
- Multiple wallet support
- Transaction history
- Wallet-to-wallet transfers

✅ **Academic Planning**
- Semester configuration
- Timetable management
- Assignment tracking
- Exam scheduling

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user profile

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Transactions
- GET /api/transactions - Get all transactions
- POST /api/transactions - Create transaction
- PUT /api/transactions/:id - Update transaction
- DELETE /api/transactions/:id - Delete transaction

### Wallets
- GET /api/wallets - Get all wallets
- POST /api/wallets - Create wallet
- PUT /api/wallets/:id - Update wallet
- DELETE /api/wallets/:id - Delete wallet

### Semester
- GET /api/semester/config - Get semester configuration
- PUT /api/semester/config - Update semester configuration
- GET /api/semester/events - Get semester events
- POST /api/semester/events - Create semester event
- DELETE /api/semester/events/:id - Delete semester event

### Timetable
- GET /api/timetable - Get all classes
- POST /api/timetable - Create class
- PUT /api/timetable/:id - Update class
- DELETE /api/timetable/:id - Delete class

### Assignments
- GET /api/assignments - Get all assignments
- POST /api/assignments - Create assignment
- PUT /api/assignments/:id - Update assignment
- DELETE /api/assignments/:id - Delete assignment

### Exams
- GET /api/exams - Get all exams
- POST /api/exams - Create exam
- PUT /api/exams/:id - Update exam
- DELETE /api/exams/:id - Delete exam

## Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Protected API routes with middleware
- Token auto-refresh and expiration handling
- Secure MongoDB connection with Atlas

## Database

Using MongoDB Atlas cloud database:
- Cluster: planiodatabase.lh8qbcu.mongodb.net
- Database: planio
- Collections: users, tasks, transactions, wallets, semesterconfigs, timetables, assignments, exams

## Production Deployment Notes

### Backend
1. Update NODE_ENV to 'production'
2. Use environment variables for sensitive data
3. Enable CORS only for your frontend domain
4. Add rate limiting and security headers
5. Set up MongoDB indexes for better performance

### Frontend
1. Update VITE_API_URL to your production backend URL
2. Build for production: `npm run build`
3. Deploy dist folder to hosting service (Vercel, Netlify, etc.)

### MongoDB Atlas
- Already configured with connection string
- Ensure IP whitelist includes your server IPs
- Monitor database usage and performance
- Set up automated backups

## Technologies Used

**Frontend:**
- React 19
- Vite 7.2.2
- Tailwind CSS v4
- Framer Motion 12
- Axios for API calls
- date-fns for date handling

**Backend:**
- Node.js
- Express 4.18.2
- MongoDB with Mongoose 8.0.0
- JWT authentication
- bcryptjs for password hashing

## Status

🟢 Backend: Running on port 5000
🟢 MongoDB: Connected to Atlas cluster
🟢 Authentication: Fully functional
🟢 API Integration: Complete
🟢 Data Persistence: Working
