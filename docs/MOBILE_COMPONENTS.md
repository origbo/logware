# Mobile Security Components Documentation

This document provides detailed technical documentation for the mobile security components in the Logware platform.

## Overview

The mobile security components provide a responsive, touch-friendly interface for monitoring security events and managing incidents on mobile devices. These components are designed to work seamlessly across different screen sizes and device types.

## Component Architecture

```
MobileSecurityDashboard
├── MobileSecurityOverview
├── MobileAlertsList
│   └── AlertDetailDialog
├── MobileAnomalyList
│   └── AnomalyDetailDialog
└── IncidentResponseTraining (mobile mode)
```

## Components

### MobileSecurityDashboard

**Purpose**: Main container for the mobile security interface, managing navigation and layout.

**Key Properties**:
- `userId` (string): The current user's ID
- `theme` (object): Theme object for styling

**Usage Example**:
```jsx
import MobileSecurityDashboard from './components/security/mobile/MobileSecurityDashboard';

function SecurityApp() {
  return <MobileSecurityDashboard userId="user123" />;
}
```

**Implementation Details**:
- Uses Material UI's `BottomNavigation` for mobile-friendly tab switching
- Implements responsive layout adjustments based on screen size
- Handles authentication state and user preferences

**Code Structure**:
```javascript
const MobileSecurityDashboard = ({ userId }) => {
  // Tab state management
  const [activeTab, setActiveTab] = useState('overview');
  
  // Notification badge state
  const [alertCount, setAlertCount] = useState(0);
  
  // Fetch alert count on component mount
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const response = await axios.get(`/api/alerts/count?userId=${userId}&status=unread`);
        setAlertCount(response.data.count);
      } catch (error) {
        console.error('Error fetching alert count:', error);
      }
    };
    
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId]);
  
  return (
    <Box sx={{ pb: 7 }}> {/* Bottom padding for navigation */}
      {/* Content based on active tab */}
      {activeTab === 'overview' && <MobileSecurityOverview userId={userId} />}
      {activeTab === 'alerts' && <MobileAlertsList userId={userId} />}
      {activeTab === 'anomalies' && <MobileAnomalyList userId={userId} />}
      {activeTab === 'training' && <IncidentResponseTraining userId={userId} mobile={true} />}
      
      {/* Bottom navigation */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <BottomNavigationAction 
            label="Overview" 
            value="overview" 
            icon={<DashboardIcon />} 
          />
          <BottomNavigationAction 
            label="Alerts" 
            value="alerts" 
            icon={
              <Badge badgeContent={alertCount} color="error">
                <NotificationsIcon />
              </Badge>
            } 
          />
          <BottomNavigationAction 
            label="Anomalies" 
            value="anomalies" 
            icon={<WarningIcon />} 
          />
          <BottomNavigationAction 
            label="Training" 
            value="training" 
            icon={<SchoolIcon />} 
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
```

### MobileSecurityOverview

**Purpose**: Displays a condensed summary of security metrics and status.

**Key Properties**:
- `userId` (string): The current user's ID
- `timeframe` (string, optional): Time period for metrics calculation, default is '24h'

**Events**:
- `onRefresh`: Triggered when the user pulls down to refresh
- `onMetricSelect`: Triggered when a specific metric is selected

**Usage Example**:
```jsx
import MobileSecurityOverview from './components/security/mobile/MobileSecurityOverview';

function SecurityOverview() {
  return <MobileSecurityOverview userId="user123" timeframe="7d" />;
}
```

**Implementation Details**:
- Uses compact cards for displaying key metrics
- Implements pull-to-refresh functionality
- Shows sparklines for trend visualization
- Color-coded indicators for status (green, amber, red)

### MobileAlertsList

**Purpose**: Displays a mobile-friendly list of security alerts with filtering and details.

**Key Properties**:
- `userId` (string): The current user's ID
- `initialFilters` (object, optional): Initial filtering criteria
- `maxItems` (number, optional): Maximum number of items to display, default is 50

**Events**:
- `onAlertAction`: Triggered when an action is taken on an alert
- `onFilterChange`: Triggered when filters are modified

**Usage Example**:
```jsx
import MobileAlertsList from './components/security/mobile/MobileAlertsList';

function AlertsPage() {
  return (
    <MobileAlertsList 
      userId="user123" 
      initialFilters={{ severity: 'high' }} 
      maxItems={20} 
    />
  );
}
```

**Implementation Details**:
- Virtual scrolling for performance with large lists
- Pull-to-refresh functionality
- Swipe actions for quick alert management
- Detailed modal view on alert tap
- Severity-based color coding
- Local filtering capabilities

**API Endpoints Used**:
- `GET /api/alerts` - Fetches alerts with filtering
- `POST /api/alerts/:id/acknowledge` - Acknowledges an alert
- `POST /api/alerts/:id/resolve` - Resolves an alert
- `POST /api/alerts/:id/escalate` - Escalates an alert

**Code Structure**:
```javascript
const MobileAlertsList = ({ userId, initialFilters = {}, maxItems = 50 }) => {
  // State for alerts data
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering and pagination
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // State for selected alert (details view)
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // Fetch alerts based on current filters and pagination
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          userId,
          page,
          limit: 20,
          ...filters
        });
        
        const response = await axios.get(`/api/alerts?${params}`);
        
        if (page === 0) {
          setAlerts(response.data.alerts);
        } else {
          setAlerts(prev => [...prev, ...response.data.alerts]);
        }
        
        setHasMore(response.data.alerts.length === 20);
        setLoading(false);
      } catch (err) {
        setError('Failed to load alerts');
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, [userId, filters, page]);
  
  // Handle refresh (pull-to-refresh)
  const handleRefresh = () => {
    setPage(0);
    setHasMore(true);
  };
  
  // Handle load more (infinite scroll)
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };
  
  // Handle alert action (acknowledge, resolve, etc.)
  const handleAlertAction = async (alertId, action) => {
    try {
      await axios.post(`/api/alerts/${alertId}/${action}`);
      // Update local state to reflect the change
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: action === 'acknowledge' ? 'acknowledged' : 'resolved' } 
          : alert
      ));
    } catch (err) {
      setError(`Failed to ${action} alert`);
    }
  };
  
  return (
    <Box sx={{ height: '100%' }}>
      {/* Filter panel */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity || ''}
                label="Severity"
                onChange={(e) => setFilters({...filters, severity: e.target.value})}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Alerts list with virtual scrolling */}
      <List sx={{ p: 0 }}>
        {alerts.map(alert => (
          <ListItem 
            key={alert.id}
            button
            onClick={() => setSelectedAlert(alert)}
            secondaryAction={
              <IconButton edge="end" onClick={(e) => {
                e.stopPropagation();
                handleAlertAction(alert.id, 'acknowledge');
              }}>
                <DoneIcon />
              </IconButton>
            }
          >
            <ListItemIcon>
              <SecurityAlertIcon 
                color={
                  alert.severity === 'critical' ? 'error' :
                  alert.severity === 'high' ? 'error' :
                  alert.severity === 'medium' ? 'warning' : 'info'
                } 
              />
            </ListItemIcon>
            <ListItemText 
              primary={alert.title}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                  {` — ${alert.description.substring(0, 60)}...`}
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
        
        {loading && <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress /></Box>}
      </List>
      
      {/* Alert detail dialog */}
      <Dialog
        open={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SecurityAlertIcon 
                  color={
                    selectedAlert.severity === 'critical' ? 'error' :
                    selectedAlert.severity === 'high' ? 'error' :
                    selectedAlert.severity === 'medium' ? 'warning' : 'info'
                  }
                  sx={{ mr: 1 }}
                />
                {selectedAlert.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Severity: {selectedAlert.severity.toUpperCase()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Status: {selectedAlert.status.toUpperCase()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Time: {new Date(selectedAlert.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Source: {selectedAlert.source}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {selectedAlert.description}
              </Typography>
              
              {selectedAlert.details && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Details:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedAlert.details, null, 2)}
                  </Typography>
                </Paper>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAlert(null)}>Close</Button>
              {selectedAlert.status === 'new' && (
                <Button 
                  onClick={() => {
                    handleAlertAction(selectedAlert.id, 'acknowledge');
                    setSelectedAlert(null);
                  }}
                  color="primary"
                >
                  Acknowledge
                </Button>
              )}
              {(selectedAlert.status === 'new' || selectedAlert.status === 'acknowledged') && (
                <Button 
                  onClick={() => {
                    handleAlertAction(selectedAlert.id, 'resolve');
                    setSelectedAlert(null);
                  }}
                  color="primary"
                  variant="contained"
                >
                  Resolve
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
```

### MobileAnomalyList

**Purpose**: Displays a mobile-friendly list of detected anomalies.

**Key Properties**:
- `userId` (string): The current user's ID
- `initialFilters` (object, optional): Initial filtering criteria
- `maxItems` (number, optional): Maximum number of items to display, default is 50

**Events**:
- `onAnomalyAction`: Triggered when an action is taken on an anomaly
- `onFilterChange`: Triggered when filters are modified

**Implementation Details**:
- Similar structure to MobileAlertsList but focused on anomalies
- Displays machine learning confidence scores
- Includes visualization of anomaly detection results
- Groups related anomalies together

### MobileRouteRedirect

**Purpose**: Detects device type and redirects to the appropriate interface.

**Key Properties**:
- None (automatically detects device type)

**Implementation Details**:
- Uses user agent and screen size detection
- Provides manual override for interface selection
- Remembers user preference for future visits

## Integration Points

### API Endpoints

The mobile components interact with the following backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/security/overview` | GET | Fetches summary metrics for the security overview |
| `/api/alerts` | GET | Retrieves alerts with filtering and pagination |
| `/api/alerts/:id` | GET | Gets detailed information about a specific alert |
| `/api/alerts/:id/:action` | POST | Performs actions on alerts (acknowledge, resolve, escalate) |
| `/api/anomalies` | GET | Retrieves anomalies with filtering and pagination |
| `/api/anomalies/:id` | GET | Gets detailed information about a specific anomaly |
| `/api/training/scenarios` | GET | Retrieves available training scenarios |
| `/api/training/scenarios/:id/start` | POST | Starts a training scenario |
| `/api/training/scenarios/:id/complete` | POST | Completes a training scenario with results |

### Event Handling

The mobile components emit and listen for the following events:

| Event | Description |
|-------|-------------|
| `alert:new` | Fired when a new alert is received |
| `alert:updated` | Fired when an alert's status changes |
| `anomaly:detected` | Fired when a new anomaly is detected |
| `training:completed` | Fired when a training scenario is completed |

## Performance Considerations

### Optimization Techniques

The mobile components implement several optimization techniques:

1. **Virtual Scrolling**: For large lists of alerts and anomalies
2. **Lazy Loading**: Components are loaded only when needed
3. **Image Optimization**: Icons and images are optimized for mobile
4. **Throttling and Debouncing**: For search and filter operations
5. **Local Storage Caching**: For frequently accessed data
6. **Reduced Network Requests**: Batching API calls where possible

### Device Compatibility

The mobile interface is tested and compatible with:

- iOS 12+ (Safari)
- Android 7+ (Chrome)
- iPadOS 13+ (Safari)
- Modern mobile browsers (Chrome, Firefox, Safari)

## Extending Mobile Components

### Creating New Mobile Components

To create a new mobile component:

1. Follow the naming convention `Mobile[ComponentName].js`
2. Use responsive Material UI components
3. Implement touch-friendly interaction patterns
4. Add the component to the appropriate tab in `MobileSecurityDashboard`

### Adding New Mobile Features

To add new features to the mobile interface:

1. Create the necessary backend API endpoints
2. Implement the mobile UI components
3. Add navigation links or tabs as needed
4. Update documentation and tests

## Testing Mobile Components

### Test Strategy

The mobile components should be tested using:

1. **Unit Tests**: For component logic
2. **Integration Tests**: For API interactions
3. **Responsive Tests**: For layout across device sizes
4. **Performance Tests**: For ensuring smooth operation
5. **User Acceptance Tests**: For validating usability

### Testing Tools

- Jest for unit testing
- React Testing Library for component testing
- Cypress for E2E testing
- Chrome DevTools Mobile Emulation for device testing
- Lighthouse for performance testing
