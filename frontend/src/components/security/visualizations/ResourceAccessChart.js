import React from 'react';
import { 
  Card, CardContent, CardHeader, Divider, 
  Box, Typography, Tooltip
} from '@mui/material';
import { 
  blue, red, purple, grey
} from '@mui/material/colors';

/**
 * Resource Access Chart Component
 * Visualizes patterns in resource access
 */
const ResourceAccessChart = ({ resourceData, title, suspiciousAccesses }) => {
  if (!resourceData || resourceData.length === 0) {
    return (
      <Card>
        <CardHeader title={title || 'Resource Access Patterns'} />
        <Divider />
        <CardContent>
          <Typography>No resource access data available</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Sort resources by access count
  const sortedResources = [...resourceData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10 resources
    
  // Find max count for scaling
  const maxCount = Math.max(...sortedResources.map(r => r.count));
  
  // Check if a resource has suspicious accesses
  const hasSuspiciousAccess = (resourceId) => {
    if (!suspiciousAccesses) return false;
    return suspiciousAccesses.some(access => access.resourceId === resourceId);
  };
  
  // Get bar color based on suspicious status
  const getBarColor = (resourceId) => {
    return hasSuspiciousAccess(resourceId) ? red[600] : blue[600];
  };
  
  return (
    <Card>
      <CardHeader title={title || 'Resource Access Patterns'} />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Resources ranked by access frequency. Red bars indicate resources with suspicious access patterns.
          </Typography>
        </Box>
        
        {sortedResources.map((resource) => {
          const width = `${(resource.count / maxCount) * 100}%`;
          const isSuspicious = hasSuspiciousAccess(resource.id);
          
          return (
            <Box key={resource.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Tooltip title={resource.id}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                    {resource.id}
                  </Typography>
                </Tooltip>
                <Typography variant="body2">
                  {resource.count}
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 12,
                  bgcolor: grey[200],
                  borderRadius: 1
                }}
              >
                <Tooltip title={`${resource.count} accesses${isSuspicious ? ' - Suspicious access detected' : ''}`}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: width,
                      height: '100%',
                      bgcolor: getBarColor(resource.id),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end'
                    }}
                  >
                    {isSuspicious && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          mr: 0.5
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              </Box>
              
              {isSuspicious && (
                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                  Unusual access detected
                </Typography>
              )}
            </Box>
          );
        })}
        
        {/* Resource type breakdown section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Resource Type Distribution
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* This would normally compute the distribution of resource types */}
            {['data', 'file', 'api', 'admin', 'application'].map((type, index) => (
              <Box 
                key={type}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center'
                }}
              >
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: index % 3 === 0 ? blue[400] : index % 3 === 1 ? purple[400] : blue[700],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" color="white" fontWeight="bold">
                    {Math.floor(Math.random() * 60) + 10}%
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {type}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResourceAccessChart;
