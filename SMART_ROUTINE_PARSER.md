# 📋 Smart Routine Parser Feature

## Overview
The Smart Routine Parser automatically extracts class information from pasted university routine data, saving you time from manual entry.

## How It Works

### 1. Access the Feature
- Navigate to **Academic Planner** → **Semester Setup** tab
- Complete semester configuration first
- Click **"📋 Smart Paste"** button

### 2. Paste Your Routine
Copy your routine from:
- University portal
- Excel/Google Sheets
- Email notifications
- PDF documents (as tab-separated text)

### 3. Automatic Parsing
The system recognizes:
- **Course codes** (e.g., CSE310, HRM460)
- **Course names** (e.g., Electronics II, Neural Networks)
- **Day patterns** using university abbreviations
- **Time slots** (e.g., 13:00-14:30)
- **Locations** (e.g., BC6012, CENLAB2)

### 4. Review & Confirm
- Preview all extracted classes
- Verify accuracy
- Click "✓ Confirm & Add All" to save

## Supported Format

### Required Format
Tab-separated values (TSV) with columns:
```
CourseCode  CourseName  Credit  Location  Schedule  Enrollment  Section
```

### Example Input
```
CSE310	Electronics II	4	BC6012	MW:13:00-14:30	15 / 16	Z
CSE310L	Labwork based on CSE 310	5	CENLAB2	W:14:40-16:10	5 / 5	Z
CSE424	Neural Networks	1	BC6013	S:18:30-21:30	8 / 9	Z
HRM460	International Human Resource Management	2	BC2013	MW:16:20-17:50	14 / 17	Z
```

### Parsed Output
Each line becomes multiple class entries (one per day):
- **CSE310** on Monday: 13:00-14:30 at BC6012
- **CSE310** on Wednesday: 13:00-14:30 at BC6012
- **CSE310L** on Wednesday: 14:40-16:10 at CENLAB2
- **CSE424** on Sunday: 18:30-21:30 at BC6013
- And so on...

## Day Code Mapping

### University Standard Codes
- **ST** → Sunday + Tuesday
- **MW** → Monday + Wednesday
- **AR** → Thursday + Saturday (A=Saturday, R=Thursday)

### Individual Day Codes
- **S** → Sunday
- **M** → Monday
- **T** → Tuesday
- **W** → Wednesday
- **R** → Thursday
- **F** → Friday
- **A** → Saturday

### Schedule Format
Pattern: `DAYCODE:START-END`

Examples:
- `MW:13:00-14:30` → Monday & Wednesday, 1:00 PM - 2:30 PM
- `S:18:30-21:30` → Sunday, 6:30 PM - 9:30 PM
- `AR:09:00-10:30` → Thursday & Saturday, 9:00 AM - 10:30 AM

## Features

### 🎯 Automatic Detection
- Course type detection (Lab vs Lecture based on name)
- Random color assignment for visual distinction
- Multiple class entries for multi-day schedules

### ✅ Smart Validation
- Checks for valid time formats
- Recognizes all day codes
- Filters empty lines
- Shows parsing errors if format is incorrect

### 🎨 Visual Preview
- See all parsed classes before saving
- Color-coded indicators
- Full details: subject, day, time, location, type
- Confirm or cancel before adding to schedule

## Usage Tips

### ✓ Best Practices
1. Copy directly from Excel/Sheets (preserves tabs)
2. Include all columns even if some are empty
3. One course per line
4. Use consistent formatting

### ✗ Common Issues
- **Spaces instead of tabs**: Won't parse correctly
- **Missing schedule column**: Classes will be skipped
- **Invalid day codes**: Use standard university codes
- **Wrong time format**: Must be HH:MM-HH:MM (24-hour)

## Error Handling

### No Classes Parsed
**Alert**: "Could not parse the routine. Please check the format and try again."

**Solutions**:
- Verify tab-separated format (not spaces)
- Check schedule column format: `DAYCODE:HH:MM-HH:MM`
- Ensure at least 5 columns present
- Remove any header rows

### Partial Parsing
Some classes might be skipped if:
- Schedule format is invalid
- Day code is unrecognized
- Required columns are missing

Review the preview carefully before confirming.

## Examples

### Example 1: Full Week Schedule
```
CSE101	Programming Fundamentals	3	Room 201	MW:09:00-10:30	30/30	A
CSE101L	Programming Lab	1	Lab 1	T:14:00-16:00	30/30	A
MAT105	Calculus I	3	Room 305	ST:11:00-12:30	45/50	B
PHY110	Physics I	3	Room 102	AR:13:00-14:30	40/40	C
```

**Parsed Result**: 8 class entries
- CSE101: Monday, Wednesday
- CSE101L: Tuesday
- MAT105: Sunday, Tuesday
- PHY110: Thursday, Saturday

### Example 2: Mixed Schedule
```
ENG203	Business Communication	2	BC1015	M:10:00-11:30	25/30	X
ENG203	Business Communication	2	BC1015	W:10:00-11:30	25/30	X
```

**Parsed Result**: 2 class entries (same course, separate entries)

### Example 3: Evening Classes
```
MBA501	Strategic Management	3	BC5012	S:18:00-21:00	15/20	E
FIN420	Investment Analysis	3	BC5013	R:18:00-21:00	20/25	E
```

**Parsed Result**: 2 evening class entries

## Technical Details

### Parser Logic
```javascript
1. Split input by newlines
2. For each line:
   - Split by tabs
   - Extract: courseCode, courseName, location, schedule
   - Parse schedule: DAYCODE:START-END
   - Map day code to actual day names
   - Create class entry for each day
3. Return array of all classes
```

### Color Assignment
Randomly assigns from 8 gradient colors:
- Blue → Indigo
- Purple → Pink
- Green → Teal
- Orange → Red
- Cyan → Blue
- Pink → Rose
- Indigo → Purple
- Teal → Green

## Benefits

### ⏱️ Time Savings
- Add entire semester schedule in seconds
- No manual entry for each class
- No repetitive typing

### 🎯 Accuracy
- Reduces human error
- Consistent formatting
- Automatic validation

### 📊 Organization
- All classes properly formatted
- Color-coded automatically
- Ready for use immediately

## Future Enhancements
- PDF upload support
- Image OCR parsing
- More day code formats
- Custom parser rules
- Export parsed data
- Undo/redo functionality

## Support

### Need Help?
- Ensure your data is tab-separated
- Check day codes match university format
- Verify time format is 24-hour (HH:MM)
- Use preview to verify before saving

### Contact
For issues or suggestions about the Smart Routine Parser, please open an issue on the project repository.
