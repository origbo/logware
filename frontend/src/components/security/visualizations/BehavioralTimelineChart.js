import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, Divider, 
  Box, Typography, FormControl, InputLabel, 
  Select, MenuItem, Tooltip
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import moment from 'moment';

/**
 * Behavioral Timeline Chart Component
 * Visualizes user behavioral patterns over time
 */
const BehavioralTimelineChart = ({ timelineData, title }) => {
  const [selectedUser, setSelectedUser] = useState('all');
  
  if (!timelineData || Object.keys(timelineData).length === 0) {
    return (
      <Card>
        <CardHeader title={title || 'Behavioral Timeline'} />
        <Divider />
        <CardContent>
          <Typography>No behavioral timeline data available</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Get list of users from timelineData
  const users = Object.keys(timelineData).map(userId => {
    const events = timelineData[userId];
    // Get username from first event if available
    const username = events.length > 0 && events[0].user ? events[0].user.name : userId;
    return { id: userId, name: username };
  });
  
  // Get events to display based on selectedUser
  let eventsToDisplay = [];
  if (selectedUser === 'all') {
    // Combine events from all users and sort by timestamp
    Object.values(timelineData).forEach(userEvents => {
      eventsToDisplay = [...eventsToDisplay, ...userEvents];
    });
  } else if (timelineData[selectedUser]) {
    eventsToDisplay = timelineData[selectedUser];
  }
  
  // Sort events by timestamp (newest first)
  eventsToDisplay.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Limit the number of events shown
  const limitedEvents = eventsToDisplay.slice(0, 20);
  
  // Get color based on anomaly/behavioral score
  const getScoreColor = (anomalyScore, behavioralScore) => {
    const maxScore = Math.max(anomalyScore || 0, behavioralScore || 0);
    
    if (maxScore >= 90) return '#d32f2f';  // red
    if (maxScore >= 70) return '#f57c00';  // orange
    if (maxScore >= 50) return '#ffb74d';  // light orange
    return '#90caf9';  // light blue
  };
  
  // Get icon based on anomaly/behavioral score
  const getScoreIcon = (anomalyScore, behavioralScore) => {
    const maxScore = Math.max(anomalyScore || 0, behavioralScore || 0);
    
    if (maxScore >= 70) {
      return <ErrorIcon color="error" fontSize="small" />;
    } else if (maxScore >= 50) {
      return <WarningIcon color="warning" fontSize="small" />;
    }
    return <TimeIcon color="info" fontSize="small" />;
  };
  
  // Format the event description
  const getEventDescription = (event) => {
    let description = `${event.eventType || 'Event'} (${event.category})`;
    
    if (event.anomalyScore >= 70 || event.behavioralScore >= 70) {
      description += ' - SUSPICIOUS';
    }
    
    return description;
  };
  
  return (
    <Card>
      <CardHeader 
        title={title || 'Behavioral Timeline'}
        action={
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="timeline-user-select-label">User</InputLabel>
            <Select
              labelId="timeline-user-select-label"
              id="timeline-user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="User"
            >
              <MenuItem value="all">All Users</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name || user.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This timeline shows user behavior patterns over time. Red and orange events indicate anomalous behavior.
          </Typography>
        </Box>
        
        {/* Timeline visualization */}
        <Box sx={{ position: 'relative', ml: 2, mt: 4 }}>
          {/* Vertical line */}
          <Box 
            sx={{ 
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: '#e0e0e0',
            }}
          />
          
          {/* Events */}
          {limitedEvents.map((event, index) => {
            const scoreColor = getScoreColor(event.anomalyScore, event.behavioralScore);
            const icon = getScoreIcon(event.anomalyScore, event.behavioralScore);
            const description = getEventDescription(event);
            const timeAgo = moment(event.timestamp).fromNow();
            const formattedTime = moment(event.timestamp).format('YYYY-MM-DD HH:mm:ss');
            
            // Include username if showing all users
            const showUsername = selectedUser === 'all' && event.user;
            
            return (
              <Box 
                key={event.id || index}
                sx={{ 
                  position: 'relative',
                  ml: 5,
                  mb: 4,
                  pl: 2
                }}
              >
                {/* Timeline node */}
                <Box 
                  sx={{
                    position: 'absolute',
                    left: -24,
                    top: 0,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    border: `2px solid ${scoreColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}
                >
                  {icon}
                </Box>
                
                {/* Event content */}
                <Box 
                  sx={{
                    p: 2,
                    borderLeft: `3px solid ${scoreColor}`,
                    borderRadius: 1,
                    bgcolor: '#f5f5f5',
                    maxWidth: 500
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {description}
                    </Typography>
                    <Tooltip title={formattedTime}>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo}
                      </Typography>
                    </Tooltip>
                  </Box>
                  
                  {showUsername && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      User: {event.user.name || event.user.id}
                    </Typography>
                  )}
                  
                  {/* Event scores */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    {event.anomalyScore && (
                      <Box>
                        <Typography variant="caption" fontWeight="bold">
                          Anomaly Score:
                        </Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            ml: 1, 
                            color: event.anomalyScore >= 70 ? 'error.main' : 
                                   event.anomalyScore >= 50 ? 'warning.main' : 'text.primary',
                            fontWeight: 'bold'
                          }}
                        >
                          {event.anomalyScore}
                        </Box>
                      </Box>
                    )}
                    
                    {event.behavioralScore && (
                      <Box>
                        <Typography variant="caption" fontWeight="bold">
                          Behavioral Score:
                        </Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            ml: 1, 
                            color: event.behavioralScore >= 70 ? 'error.main' : 
                                   event.behavioralScore >= 50 ? 'warning.main' : 'text.primary',
                            fontWeight: 'bold'
                          }}
                        >
                          {event.behavioralScore}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BehavioralTimelineChart;
