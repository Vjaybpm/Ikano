import { Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip } from '@mui/material';
import React from 'react';

type RoomStatus = 'free' | 'booked' | 'partially booked';
type RoomMap = { [key: string]: RoomStatus };
type TimeSlot = {
  time: string;
  rooms: RoomMap;
};

function generateSchedule(startTime: string, endTime: string, intervalMinutes: number): TimeSlot[] {
  const statuses: RoomStatus[] = ['free', 'booked', 'partially booked'];
  const rooms: string[] = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105'];
  const schedule: TimeSlot[] = [];

  // Helper function to add minutes to a time string
  function addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0);
    return date.toTimeString().substring(0, 5);
  }

  // Generate timeslots
  let currentTime = startTime;
  while (currentTime !== addMinutes(endTime, intervalMinutes)) {
    const timeSlot: TimeSlot = {
      time: currentTime,
      rooms: {}
    };

    // Assign random statuses to each room for the current time slot
    rooms.forEach(room => {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      timeSlot.rooms[room] = randomStatus;
    });

    schedule.push(timeSlot);
    currentTime = addMinutes(currentTime, intervalMinutes);
  }

  return schedule;
}

// Example usage: Generate a schedule from 8:00 AM to 6:00 PM with 15-minute intervals
const schedule = generateSchedule('08:00', '18:00', 15);
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'free':
      return '#8bc34a'; // Green
    case 'booked':
      return '#f44336'; // Red
    case 'partially booked':
      return 'linear-gradient(to top right, #f44336 50%, #8bc34a 50%)'; // Diagonal line from top left to bottom right, half red, half green

    default:
      return '#e0e0e0'; // Grey for undefined status
  }
};

// Props for your component, if needed
interface ScheduleProps {
}
export const BookingGrid2: React.FC<ScheduleProps> = ({}) => (
  <TableContainer component={Paper} style={{ border: '1px solid black' }}>
    <Table size="small" aria-label="booking schedule table" style={{ borderCollapse: 'collapse' }}>
      <TableHead>
        <TableRow>
          <TableCell style={{ border: '1px solid black' }}>Time</TableCell>
          {Object.keys(schedule[0].rooms).map(room => (
            <TableCell key={room} style={{ border: '1px solid black' }}>{room}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {schedule.map((slot, index) => (
          <TableRow key={index}>
            <TableCell style={{ border: '1px solid black' }}>{slot.time}</TableCell>
            {Object.entries(slot.rooms).map(([room, status]) => (
              <TableCell key={room} style={{
                border: '1px solid black',
                backgroundImage: status === 'partially booked' ? 'linear-gradient(to bottom right, #f44336 50%, #8bc34a 50%)' : '',
                backgroundColor: status !== 'partially booked' ? getStatusColor(status) : '',
              }}>
                <Tooltip title={`${room} is ${status}`}>
                  <span>{status !== 'partially booked' ? status : ''}</span>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
