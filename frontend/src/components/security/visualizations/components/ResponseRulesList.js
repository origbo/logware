import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardHeader, CardContent, 
  Divider, Switch, Chip, List, ListItem, 
  ListItemText, ListItemSecondaryAction,
  IconButton, Tooltip, Paper, Collapse
} from '@mui/material';

import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Security as SecurityIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * ResponseRulesList Component
 * Displays configured automated response rules
 */
const ResponseRulesList = ({ rules = [], onToggleRule, onEditRule, onDeleteRule }) => {
  const [expandedRules, setExpandedRules] = useState({});
  
  // Toggle rule expansion
  const handleToggleExpand = (ruleId) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };
  
  // Handle rule toggle (enable/disable)
  const handleToggleRule = (ruleId, newState) => {
    if (onToggleRule) {
      onToggleRule(ruleId, newState);
    }
  };
  
  // Format conditions for display
  const formatConditions = (conditions) => {
    const parts = [];
    
    if (conditions.anomalySeverity) {
      parts.push(`Severity: ${conditions.anomalySeverity.join(', ')}`);
    }
    
    if (conditions.anomalyTypes) {
      const types = conditions.anomalyTypes.map(type => 
        type === '*' ? 'All Types' : type.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      );
      parts.push(`Types: ${types.join(', ')}`);
    }
    
    return parts.join(' | ');
  };
  
  // Format actions for display
  const formatActions = (actions) => {
    return actions.map(action => 
      action.split(/(?=[A-Z])/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    );
  };
  
  // Get color for action chip
  const getActionColor = (action) => {
    switch (action) {
      case 'lockAccount':
      case 'revokePrivileges':
        return 'error';
      case 'blockIP':
      case 'tempLockAccount':
        return 'warning';
      case 'notifyAdmin':
      case 'notifyUser':
        return 'info';
      case 'createIncident':
        return 'secondary';
      case 'requireMFA':
        return 'success';
      default:
        return 'default';
    }
  };
  
  return (
    <Card>
      <CardHeader 
        title="Automated Response Rules" 
        subheader="Configure how the system responds to security events"
        avatar={<SecurityIcon />}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <List sx={{ width: '100%' }}>
          {rules.length > 0 ? (
            rules.map((rule) => (
              <React.Fragment key={rule.id}>
                <ListItem 
                  button 
                  onClick={() => handleToggleExpand(rule.id)}
                  sx={{
                    bgcolor: rule.enabled ? 'background.paper' : 'action.disabledBackground',
                    transition: 'background-color 0.3s'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="div">
                        {rule.name}
                        <Switch
                          edge="end"
                          size="small"
                          checked={rule.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleRule(rule.id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ ml: 2, verticalAlign: 'middle' }}
                        />
                      </Typography>
                    }
                    secondary={rule.description}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit Rule">
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditRule) onEditRule(rule);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Rule">
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteRule) onDeleteRule(rule.id);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    {expandedRules[rule.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Collapse in={expandedRules[rule.id]} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 4, pr: 4, pb: 2, pt: 1 }}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        <InfoIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                        Conditions
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {formatConditions(rule.conditions)}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        <InfoIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                        Actions
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {rule.actions.map((action, index) => (
                          <Chip 
                            key={index}
                            label={action}
                            color={getActionColor(action)}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                </Collapse>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No response rules configured" />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default ResponseRulesList;
