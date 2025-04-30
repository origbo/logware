import React from 'react';
import { 
  Card, CardContent, CardHeader, Divider, 
  Box, Typography, Grid, Chip
} from '@mui/material';
import { 
  red, orange, blue, grey
} from '@mui/material/colors';

/**
 * Location Activity Map Component
 * Visualizes geographic access patterns
 * Note: In a production app, this would use a real mapping library
 * like Leaflet, Google Maps, or react-simple-maps
 */
const LocationActivityMap = ({ locationData, title }) => {
  if (!locationData || locationData.length === 0) {
    return (
      <Card>
        <CardHeader title={title || 'Geographic Access Patterns'} />
        <Divider />
        <CardContent>
          <Typography>No location data available</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Group countries by region for our simple visualization
  const regions = {
    'North America': ['US', 'Canada', 'Mexico'],
    'Europe': ['UK', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Belgium', 'Switzerland'],
    'Asia': ['China', 'Japan', 'India', 'Russia', 'South Korea', 'Singapore', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam'],
    'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
    'Africa': ['South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco'],
    'Oceania': ['Australia', 'New Zealand'],
    'Other': []
  };
  
  // Count locations by region and flag suspicious activity
  const regionActivity = Object.keys(regions).map(region => {
    const countriesInRegion = regions[region];
    const locationsInRegion = locationData.filter(loc => 
      countriesInRegion.includes(loc.location) || 
      (region === 'Other' && !Object.values(regions).flat().includes(loc.location))
    );
    
    const suspiciousCount = locationsInRegion.filter(loc => loc.isSuspicious).length;
    const totalCount = locationsInRegion.reduce((sum, loc) => sum + loc.count, 0);
    
    return {
      region,
      locations: locationsInRegion,
      suspiciousCount,
      totalCount,
      hasSuspiciousActivity: suspiciousCount > 0
    };
  }).filter(region => region.locations.length > 0);
  
  // Find the max count for scaling
  const maxCount = Math.max(...regionActivity.map(r => r.totalCount), 1);
  
  return (
    <Card>
      <CardHeader title={title || 'Geographic Access Patterns'} />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Geographic distribution of user access locations. Red indicators show suspicious locations not typically accessed by these users.
          </Typography>
        </Box>
        
        {/* Simple map visualization */}
        <Box sx={{ 
          bgcolor: grey[100], 
          borderRadius: 2, 
          p: 2, 
          position: 'relative',
          height: 300,
          mb: 3,
          border: '1px solid',
          borderColor: grey[300],
          overflow: 'hidden'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              left: 8, 
              color: grey[500],
              fontStyle: 'italic'
            }}
          >
            World Map Visualization
          </Typography>
          
          {/* Region blocks */}
          {regionActivity.map(region => {
            const size = Math.max(20, Math.min(60, (region.totalCount / maxCount) * 50 + 10));
            const position = getRegionPosition(region.region);
            const color = region.hasSuspiciousActivity ? red[400] : blue[400];
            const borderColor = region.hasSuspiciousActivity ? red[700] : blue[700];
            
            return (
              <Chip
                key={region.region}
                label={
                  <Typography variant="caption" fontWeight="bold">
                    {region.region} ({region.totalCount})
                    {region.suspiciousCount > 0 && <span style={{ color: red[500] }}> !{region.suspiciousCount}</span>}
                  </Typography>
                }
                sx={{
                  position: 'absolute',
                  top: position.top,
                  left: position.left,
                  bgcolor: color,
                  height: size,
                  minWidth: size * 1.5,
                  border: '2px solid',
                  borderColor: borderColor,
                  fontWeight: 'bold',
                  zIndex: region.hasSuspiciousActivity ? 10 : 1
                }}
              />
            );
          })}
        </Box>
        
        {/* Location details */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Top Access Locations</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {locationData
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map(loc => (
                  <Chip 
                    key={loc.location}
                    label={`${loc.location} (${loc.count})`}
                    size="small"
                    color={loc.isSuspicious ? "error" : "primary"}
                    variant={loc.isSuspicious ? "outlined" : "filled"}
                  />
                ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="error" gutterBottom>Suspicious Locations</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {locationData
                .filter(loc => loc.isSuspicious)
                .map(loc => (
                  <Chip 
                    key={loc.location}
                    label={`${loc.location} (${loc.count})`}
                    size="small"
                    color="error"
                  />
                ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Helper function to get region positions on our simple map
const getRegionPosition = (region) => {
  const positions = {
    'North America': { top: 100, left: 80 },
    'Europe': { top: 80, left: 220 },
    'Asia': { top: 120, left: 320 },
    'South America': { top: 200, left: 150 },
    'Africa': { top: 170, left: 230 },
    'Oceania': { top: 220, left: 380 },
    'Other': { top: 250, left: 40 }
  };
  
  return positions[region] || { top: 150, left: 150 };
};

export default LocationActivityMap;
