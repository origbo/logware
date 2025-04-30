import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Tooltip } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

/**
 * SecurityMetricsCard Component
 * Displays a key security metric with current value, trend, and threshold indicators
 */
const SecurityMetricsCard = ({ title, value, previousValue, unit, threshold, thresholdType, description }) => {
  // Calculate change percentage
  const changePercentage = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositiveChange = changePercentage >= 0;
  
  // Determine if the current value has crossed the threshold
  const isOverThreshold = thresholdType === 'max' 
    ? value > threshold 
    : value < threshold;
  
  // Calculate progress value for the progress bar (0-100)
  const progressValue = thresholdType === 'max'
    ? Math.min((value / threshold) * 100, 100)
    : Math.min((threshold ? (value / threshold) * 100 : 0), 100);
  
  // Determine color based on threshold status
  const getColor = () => {
    if (thresholdType === 'max') {
      if (value > threshold) return 'error.main';
      if (value > threshold * 0.8) return 'warning.main';
      return 'success.main';
    } else {
      if (value < threshold) return 'error.main';
      if (value < threshold * 1.2) return 'warning.main';
      return 'success.main';
    }
  };
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {unit && (
            <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
              {unit}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: isPositiveChange 
              ? (thresholdType === 'max' ? 'error.main' : 'success.main') 
              : (thresholdType === 'max' ? 'success.main' : 'error.main') 
          }}>
            {isPositiveChange ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {Math.abs(changePercentage).toFixed(1)}%
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            vs previous period
          </Typography>
        </Box>
        
        <Tooltip title={`Threshold: ${threshold} ${unit}`} arrow>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={progressValue} 
              color={isOverThreshold ? "error" : "primary"}
              sx={{ 
                height: 8, 
                borderRadius: 5,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getColor()
                }
              }}
            />
          </Box>
        </Tooltip>
        
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityMetricsCard;
