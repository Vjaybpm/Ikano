import { NameAnd } from '@laoban/utils';
import { Grid, Card, Typography, Tooltip } from '@mui/material';

// Sample data structure for minute-to-minute bookings
const rooms = ['Room 101', 'Room 102', 'Room 103'];
const times = ['9:00', '9:15', '9:30', '9:45', '10:00'];  // Time blocks of 15 minutes

const bookings: NameAnd<any> = {
  'Room 101': [{ time: '9:15', duration: 15, user: 'Alice' }],
  'Room 102': [{ time: '9:00', duration: 30, user: 'Bob' }, { time: '9:30', duration: 15, user: 'Charlie' }],
  'Room 103': [],
};

const BookingSystem = () => {
  const checkBookings = (room:any, time: any) => {
    // Converts time like '9:00' to minutes since start of day for comparison
    const startTime = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    return bookings[room].filter((booking: any) => {
      const bookingStart = parseInt(booking.time.split(':')[0]) * 60 + parseInt(booking.time.split(':')[1]);
      const bookingEnd = bookingStart + booking.duration;
      return bookingStart < startTime + 15 && bookingEnd > startTime;  // Overlap check
    });
  };

  return (
    <Grid container spacing={2}>
    <Grid item xs={12}>
  <Typography variant="h4" gutterBottom>
  Room Booking System
  </Typography>
  </Grid>
  {times.map((time) => (
    <Grid item xs={3} key={time}>
  <Typography variant="h6">{time}</Typography>
    {rooms.map((room) => {
      const currentBookings = checkBookings(room, time);
      return (
        <Card key={room} style={{ margin: '8px 0', padding: '16px', backgroundColor: currentBookings.length ? '#f44336' : '#8bc34a' }}>
      <Typography variant="body1">{room}</Typography>
      {currentBookings.length > 0 ? (
        currentBookings.map((booking: any)=> (
          <Tooltip title={`Booked by ${booking.user} for ${booking.duration} minutes`} key={booking.user}>
      <Typography variant="body2" style={{ marginTop: '4px' }}>
        {`${booking.user}: ${booking.time} for ${booking.duration}m`}
        </Typography>
        </Tooltip>
      ))
      ) : (
        <Typography variant="body2">Available</Typography>
      )}
      </Card>
    );
    })}
    </Grid>
  ))}
  </Grid>
);
};

export default BookingSystem;
