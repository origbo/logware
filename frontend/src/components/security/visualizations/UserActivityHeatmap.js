import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, Divider, 
  Box, Typography, FormControl, InputLabel, 
  Select, MenuItem, Tooltip
} from '@mui/material';
import { 
  blue, green, orange, red, grey 
} from '@mui/material/colors';

/**
 * User Activity Heatmap Component
 * Visualizes time-based activity patterns for users
 */
const UserActivityHeatmap = ({ data, title }) => {
  const [selectedUser, setSelectedUser] = useState('all');
  
  if (!data || !data.userHourlyActivity) {
    return (
      <Card>
        <CardHeader title={title || 'User Activity Heatmap'} />
        <Divider />
        <CardContent>
          <Typography>No activity data available</Typography>
        </CardContent>
      </Card>
    );
  }
  
  const users = Object.entries(data.userHourlyActivity).map(([userId, userData]) => ({
    id: userId,
    name: userData.username
  }));
  
  // Determine which hourly activity data to use
  let hourlyData;
  let activeHours = [];
  
  if (selectedUser === 'all') {
    hourlyData = data.aggregatedHourly;
    
    // Find hours that are active for most users
    const userCount = Object.keys(data.userHourlyActivity).length;
    const activeHourCounts = new Array(24).fill(0);
    
    Object.values(data.userHourlyActivity).forEach(userData => {
      userData.activeHours.forEach(hour => {
        activeHourCounts[hour]++;
      });
    });
    
    activeHours = activeHourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > userCount / 2) // Active for at least half of users
      .map(h => h.hour);
  } else {
    const selectedUserData = data.userHourlyActivity[selectedUser];
    if (selectedUserData) {
      hourlyData = selectedUserData.hourlyActivity;
      activeHours = selectedUserData.activeHours;
    } else {
      hourlyData = new Array(24).fill(0);
    }
  }
  
  // Find the max value for scaling
  const maxValue = Math.max(...hourlyData);
  
  // Helper function to get color based on activity level and active state
  const getColor = (value, hour, isActive) => {
    if (value === 0) return grey[200];
    
    const intensity = Math.min(value / maxValue, 1);
    
    if (isActive) {
      if (intensity > 0.7) return green[900];
      if (intensity > 0.4) return green[700];
      return green[500];
    } else {
      if (intensity > 0.7) return blue[900];
      if (intensity > 0.4) return blue[700];
      return blue[500];
    }
  };
  
  // Highlight anomalous activity (recent vs baseline)
  const getAnomalyHighlight = (hour) => {
    if (!data.recentActivity) return false;
    
    const recentHourActivity = data.recentActivity.find(item => item.hour === hour);
    if (!recentHourActivity) return false;
    
    // Calculate the expected baseline activity for this hour
    const baselineActivity = hourlyData[hour];
    const recentActivity = recentHourActivity.total;
    
    // Check if recent activity is significantly higher than baseline
    return recentActivity > baselineActivity * 1.5 && recentHourActivity.anomalies > 0;
  };
  
  return (
    <Card>
      <CardHeader 
        title={title || 'User Activity Heatmap'}
        action={
          <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
            <InputLabel id="user-select-label">User</InputLabel>
            <Select
              labelId="user-select-label"
              id="user-select"
              value={selectedUser}
              label="User"
              onChange={e => setSelectedUser(e.target.value)}
            >
              <MenuItem value="all">All Users</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This heatmap shows user activity patterns by hour of day. 
            {selectedUser !== 'all' ? 
              ' Green blocks represent active hours for this user.' :
              ' Green blocks represent hours that are active for most users.'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 3 }}>
          <Typography variant="caption">Midnight</Typography>
          <Typography variant="caption">6 AM</Typography>
          <Typography variant="caption">Noon</Typography>
          <Typography variant="caption">6 PM</Typography>
          <Typography variant="caption">Midnight</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          {hourlyData.map((value, hour) => {
            const isActive = activeHours.includes(hour);
            const isAnomaly = getAnomalyHighlight(hour);
            const color = getColor(value, hour, isActive);
            
            // Calculate the height based on activity level
            const height = Math.max(20, Math.min(100, (value / maxValue) * 80 + 20));
            
            return (
              <Tooltip 
                key={hour}
                title={`${hour}:00 - ${hour + 1}:00: ${value} events
${isActive ? 'Active hour' : 'Inactive hour'}
${isAnomaly ? 'Anomalous activity detected' : ''}`}
              >
                <Box
                  sx={{
                    width: 12,
                    height: height,
                    bgcolor: color,
                    borderRadius: 1,
                    border: isAnomaly ? '2px solid red' : 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end'
                  }}
                >
                  {isAnomaly && (
                    <Box 
                      sx={{ 
                        width: 6, 
                        height: 6, 
                        bgcolor: 'error.main', 
                        borderRadius: '50%',
                        mb: '2px'
                      }} 
                    />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: blue[700], mr: 1 }} />
            <Typography variant="caption">Normal Activity</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: green[700], mr: 1 }} />
            <Typography variant="caption">Active Hours</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'white', border: '2px solid red', mr: 1 }} />
            <Typography variant="caption">Anomalous Activity</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserActivityHeatmap;
