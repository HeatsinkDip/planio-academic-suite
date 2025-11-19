# Comprehensive Semester Academic Planner

## Overview
The Semester page has been transformed into a comprehensive academic planner that combines semester configuration, class scheduling, and deadline management into a single unified interface.

## Features Implemented

### 1. **Semester Setup Tab**
- Configure entire semester at once
- **Fields:**
  - Semester name (e.g., "Spring 2025")
  - Start date and end date
  - Bangladesh public holidays selection
- **Bangladesh Holidays Integrated (2025):**
  - International Mother Language Day (Feb 21)
  - Sheikh Mujibur Rahman's Birthday (Mar 17)
  - Independence Day (Mar 26)
  - Eid-ul-Fitr (Mar 31 - approx)
  - Bengali New Year / Pohela Boishakh (Apr 14)
  - May Day (May 1)
  - Buddha Purnima (May 23)
  - Eid-ul-Adha (Jun 7-8 - approx)
  - National Mourning Day (Aug 15)
  - Ashura (Sep 5 - approx)
  - Durga Puja (Oct 4)
  - Victory Day (Dec 16)
  - Christmas Day (Dec 25)

### 2. **Bulk Class Schedule Setup**
- Add multiple weekly classes at once
- **Each class includes:**
  - Subject/Course name
  - Day of the week
  - Start time and end time
  - Location/Room
  - Instructor name
  - Color coding for visual identification
- All classes automatically repeat weekly
- Can add/remove classes before saving

### 3. **Class Schedule Tab** (formerly Timetable)
- Weekly view of all classes
- Day-wise organization (Sunday to Saturday)
- Color-coded class cards
- Shows: Subject, type (Lecture/Lab/Tutorial), time, location, instructor
- Individual class editing and deletion

### 4. **Deadlines Tab**
- Track all semester deadlines
- **Types:**
  - Exams
  - Assignments
  - Semester End
- Each deadline shows:
  - Countdown (days/hours remaining)
  - Date and time
  - Course/Title
  - Description
- Color-coded by urgency

## Data Structure

### Semester Configuration Storage
```javascript
semesterConfig = {
  name: "Spring 2025",
  startDate: "2025-01-15",
  endDate: "2025-05-30",
  holidays: [
    "2025-02-21",
    "2025-03-26",
    "2025-04-14",
    // ... more holiday dates
  ]
}
```

### Class Schedule Storage (Timetable)
```javascript
timetable = [
  {
    id: 1234567890,
    subject: "Data Structures",
    type: "lecture",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 301",
    instructor: "Dr. Rahman",
    color: "from-blue-500 to-indigo-600"
  },
  // ... more classes
]
```

### Deadlines Storage (Semester)
```javascript
semester = [
  {
    id: 1234567890,
    title: "Midterm Exam - Data Structures",
    type: "exam",
    date: "2025-03-15",
    time: "10:00",
    description: "Chapters 1-5"
  },
  // ... more deadlines
]
```

## Context API Updates

### New Functions Added to AppContext
- `updateSemesterConfig(config)` - Save/update semester configuration
- `deleteSemesterConfig()` - Reset semester configuration
- All existing timetable and semester deadline functions remain

### New State Variables
- `semesterConfig` - Stores semester setup (name, dates, holidays)
- `semester` - Stores deadlines (exams, assignments)
- `timetable` - Stores weekly class schedule

## User Flow

1. **First Time Setup:**
   - User navigates to Academic Planner
   - Lands on "Semester Setup" tab
   - Fills in semester name, start/end dates
   - Selects applicable Bangladesh holidays
   - Saves configuration

2. **Add Classes in Bulk:**
   - After setup, clicks "Add Multiple Classes"
   - Adds all classes for the week:
     - Subject name
     - Day and time
     - Location and instructor
   - Saves all at once

3. **View Weekly Schedule:**
   - Switches to "Class Schedule" tab
   - Sees all classes organized by day
   - Can edit/delete individual classes
   - Can add more classes anytime

4. **Manage Deadlines:**
   - Switches to "Deadlines" tab
   - Adds exams, assignments with dates
   - Sees countdown to each deadline
   - Can link deadlines to specific courses

## Dashboard Integration

The Dashboard already displays:
- Today's classes from timetable
- Upcoming semester deadlines
- Both widgets automatically update with new data

## Benefits

1. **One-time Setup:** Configure entire semester at once instead of adding classes one by one
2. **Cultural Context:** Bangladesh-specific holidays pre-loaded
3. **Unified View:** All academic information in one place
4. **Automatic Scheduling:** Classes repeat weekly automatically
5. **Visual Organization:** Color-coded classes and urgency-based deadline colors
6. **Real-time Updates:** All changes immediately reflect in Dashboard widgets

## Technical Implementation

- **React 19** with hooks (useState, useMemo)
- **Context API** for global state management
- **LocalStorage** for data persistence (per user)
- **date-fns** for date formatting and calculations
- **Framer Motion** for smooth animations
- **Lucide React** for icons

## File Modified
- `/src/pages/Semester.jsx` - Complete rewrite with 3-tab interface
- `/src/context/AppContext.jsx` - Added semesterConfig state and functions

## Testing Checklist
- ✅ Semester setup form validation
- ✅ Bangladesh holidays selection
- ✅ Bulk class addition
- ✅ Class schedule display by day
- ✅ Deadline countdown calculations
- ✅ Data persistence across sessions
- ✅ Dashboard widget updates
- ✅ Edit/delete operations for classes and deadlines

## Future Enhancements (Optional)
- Automatic semester progress tracker
- Class attendance tracking
- Integration with Notes page (link notes to courses)
- Export schedule as PDF/image
- Notifications for upcoming classes/deadlines
- Class conflict detection
- GPA calculator linked to courses
