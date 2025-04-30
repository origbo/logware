import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stepper, Step, StepLabel, Button,
  Card, CardContent, CardActions, Grid, Divider, Alert,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  LinearProgress, CircularProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import axios from 'axios';

// Training scenario object structure
const exampleScenarios = [
  {
    id: 1,
    title: 'Phishing Attack Response',
    description: 'Learn how to identify and respond to phishing attacks targeting your organization.',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    steps: [
      {
        title: 'Scenario Introduction',
        content: 'A suspicious email claiming to be from your IT department asks users to click a link and verify their credentials due to a "security update." Several employees have reported receiving it.',
        type: 'information'
      },
      {
        title: 'Initial Assessment',
        content: 'Based on the information provided, what is your first action?',
        type: 'multiple_choice',
        options: [
          {
            text: 'Immediately shut down the email server to prevent further spread',
            correct: false,
            feedback: 'This is too drastic and would disrupt business operations unnecessarily.'
          },
          {
            text: 'Ask all employees to delete the email and ignore it',
            correct: false,
            feedback: 'Simply deleting the email doesn\'t address the potential compromise that may have already occurred.'
          },
          {
            text: 'Analyze the email headers and link destination to confirm it\'s a phishing attempt',
            correct: true,
            feedback: 'Correct! First validate the threat before taking action.'
          },
          {
            text: 'Reply to the email asking for more information',
            correct: false,
            feedback: 'Never engage with suspicious emails, as this confirms your address is active.'
          }
        ]
      },
      {
        title: 'Analysis Results',
        content: 'Your analysis confirms it\'s a phishing attempt. The link leads to a fake login page hosted on a recently registered domain.',
        type: 'information'
      },
      {
        title: 'Response Actions',
        content: 'Which actions should you take now? (Select all that apply)',
        type: 'multiple_select',
        options: [
          {
            text: 'Send an organization-wide notification about the phishing attempt',
            correct: true,
            feedback: 'Good choice. Informing users helps prevent additional victims.'
          },
          {
            text: 'Block the malicious domain at the firewall/proxy level',
            correct: true,
            feedback: 'Correct! This prevents access to the malicious site.'
          },
          {
            text: 'Reset passwords for all users in the organization',
            correct: false,
            feedback: 'This is excessive without evidence of widespread compromise.'
          },
          {
            text: 'Use email filtering rules to quarantine similar emails',
            correct: true,
            feedback: 'Good choice. This helps catch additional phishing attempts.'
          }
        ]
      },
      {
        title: 'Incident Containment',
        content: 'You discover five employees clicked the link and three entered their credentials. What actions should you take for these affected users?',
        type: 'multiple_choice',
        options: [
          {
            text: 'Reset their passwords and enable MFA if not already enabled',
            correct: true,
            feedback: 'Correct! This addresses the immediate credential compromise.'
          },
          {
            text: 'Terminate their employment for security policy violation',
            correct: false,
            feedback: 'This is excessive and counterproductive. People make mistakes and should be educated, not punished severely.'
          },
          {
            text: 'Do nothing since the malicious site is now blocked',
            correct: false,
            feedback: 'The credentials were already compromised before the site was blocked.'
          },
          {
            text: 'Monitor their accounts for suspicious activity',
            correct: false,
            feedback: 'This is good but insufficient alone. Password resets are needed immediately.'
          }
        ]
      },
      {
        title: 'Lessons Learned',
        content: 'As part of improving security posture, what follow-up actions would be most effective?',
        type: 'multiple_select',
        options: [
          {
            text: 'Conduct additional phishing awareness training',
            correct: true,
            feedback: 'Good choice. Regular training improves employee awareness.'
          },
          {
            text: 'Implement DMARC, SPF and DKIM email authentication',
            correct: true,
            feedback: 'Excellent. Email authentication protocols help prevent email spoofing.'
          },
          {
            text: 'Block all external emails',
            correct: false,
            feedback: 'This would severely impact business operations.'
          },
          {
            text: 'Create a clear incident response procedure for phishing attacks',
            correct: true,
            feedback: 'Great choice. Documented procedures improve response efficiency.'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Ransomware Outbreak Response',
    description: 'Learn the proper procedures to detect, contain, and recover from a ransomware attack.',
    difficulty: 'advanced',
    estimatedTime: '30 minutes',
    steps: [
      {
        title: 'Scenario Introduction',
        content: 'Several employees report being unable to access their files. Some workstations are displaying a ransom message demanding cryptocurrency payment to unlock files.',
        type: 'information'
      },
      // Additional steps would be defined here
    ]
  },
  {
    id: 3,
    title: 'Data Breach Handling',
    description: 'Practice the appropriate steps to take when customer data has potentially been exposed.',
    difficulty: 'intermediate',
    estimatedTime: '25 minutes',
    steps: [
      {
        title: 'Scenario Introduction',
        content: 'Your security monitoring system has detected unusual database queries extracting large amounts of customer information during non-business hours.',
        type: 'information'
      },
      // Additional steps would be defined here
    ]
  }
];

const IncidentResponseTraining = () => {
  // States
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [openScenarioDialog, setOpenScenarioDialog] = useState(false);
  const [certificateDialog, setCertificateDialog] = useState(false);

  // Fetch scenarios from API
  useEffect(() => {
    // In a real implementation, this would fetch from the backend
    // For now, we'll use the example scenarios
    const fetchScenarios = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In production, this would be:
        // const response = await axios.get('http://localhost:5050/api/security/training/scenarios');
        // setScenarios(response.data);
        
        setScenarios(exampleScenarios);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching training scenarios:', error);
        setLoading(false);
      }
    };
    
    // Fetch training history
    const fetchTrainingHistory = async () => {
      try {
        // In production, this would fetch actual history from the backend
        // For now, we'll simulate some history
        setTrainingHistory([
          {
            id: 1,
            scenarioId: 1,
            scenarioTitle: 'Phishing Attack Response',
            date: '2023-10-15T14:30:00Z',
            score: 85,
            passed: true
          }
        ]);
      } catch (error) {
        console.error('Error fetching training history:', error);
      }
    };
    
    fetchScenarios();
    fetchTrainingHistory();
  }, []);

  // Handle starting a scenario
  const handleStartScenario = (scenario) => {
    setSelectedScenario(scenario);
    setActiveStep(0);
    setAnswers({});
    setFeedback(null);
    setShowResults(false);
    setScore(0);
    setTrainingComplete(false);
    setOpenScenarioDialog(false);
  };

  // Handle selecting a scenario to preview
  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario);
    setOpenScenarioDialog(true);
  };

  // Handle next step
  const handleNext = () => {
    const currentStep = selectedScenario.steps[activeStep];
    
    // If this is a question step, check the answer
    if (currentStep.type === 'multiple_choice' || currentStep.type === 'multiple_select') {
      const currentAnswer = answers[activeStep];
      
      // Validate that an answer was provided
      if (!currentAnswer) {
        setFeedback({
          type: 'error',
          message: 'Please select an answer before proceeding.'
        });
        return;
      }
      
      // Calculate feedback for this step
      let feedbackText = '';
      let isCorrect = false;
      
      if (currentStep.type === 'multiple_choice') {
        const selectedOption = currentStep.options.find(option => option.text === currentAnswer);
        isCorrect = selectedOption.correct;
        feedbackText = selectedOption.feedback;
      } else if (currentStep.type === 'multiple_select') {
        // For multiple select, all correct options must be selected and no incorrect ones
        const selectedOptions = currentAnswer;
        const correctOptions = currentStep.options.filter(option => option.correct);
        const selectedCorrectOptions = currentStep.options
          .filter(option => selectedOptions.includes(option.text) && option.correct);
        const selectedIncorrectOptions = currentStep.options
          .filter(option => selectedOptions.includes(option.text) && !option.correct);
        
        isCorrect = selectedCorrectOptions.length === correctOptions.length && selectedIncorrectOptions.length === 0;
        
        // Generate feedback text
        if (selectedIncorrectOptions.length > 0) {
          feedbackText = selectedIncorrectOptions.map(option => option.feedback).join(' ');
        } else if (selectedCorrectOptions.length < correctOptions.length) {
          feedbackText = 'You missed some correct options.';
        } else {
          feedbackText = 'All correct options selected!';
        }
      }
      
      setFeedback({
        type: isCorrect ? 'success' : 'error',
        message: feedbackText
      });
      
      // Update score
      if (isCorrect) {
        setScore(prevScore => prevScore + 1);
      }
      
      // If it's the last step, show results
      if (activeStep === selectedScenario.steps.length - 1) {
        const totalQuestions = selectedScenario.steps.filter(
          step => step.type === 'multiple_choice' || step.type === 'multiple_select'
        ).length;
        
        const finalScore = ((score + (isCorrect ? 1 : 0)) / totalQuestions) * 100;
        setScore(finalScore);
        setShowResults(true);
        setTrainingComplete(true);
        
        // In a real implementation, we would send the results to the backend
        // axios.post('http://localhost:5050/api/security/training/results', {
        //   scenarioId: selectedScenario.id,
        //   score: finalScore,
        //   answers: answers,
        //   completed: true
        // });
        
        // Update local training history
        setTrainingHistory([
          ...trainingHistory,
          {
            id: Date.now(),
            scenarioId: selectedScenario.id,
            scenarioTitle: selectedScenario.title,
            date: new Date().toISOString(),
            score: finalScore,
            passed: finalScore >= 70
          }
        ]);
      }
    }
    
    // If not the last step, go to next step
    if (activeStep < selectedScenario.steps.length - 1) {
      setActiveStep(prevStep => prevStep + 1);
      setFeedback(null);
    }
  };

  // Handle going back to previous step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
    setFeedback(null);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [activeStep]: answer
    });
  };

  // Conditionally render the current step content
  const renderStepContent = (step) => {
    const currentStep = selectedScenario.steps[step];
    
    switch (currentStep.type) {
      case 'information':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {currentStep.content}
            </Typography>
          </Box>
        );
      
      case 'multiple_choice':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {currentStep.content}
            </Typography>
            
            <FormControl component="fieldset" margin="normal">
              <RadioGroup
                value={answers[step] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
              >
                {currentStep.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option.text}
                    control={<Radio />}
                    label={option.text}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      
      case 'multiple_select':
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {currentStep.content}
            </Typography>
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Select all that apply</FormLabel>
              {currentStep.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Radio
                      checked={(answers[step] || []).includes(option.text)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAnswerSelect([...(answers[step] || []), option.text]);
                        } else {
                          handleAnswerSelect(
                            (answers[step] || []).filter(item => item !== option.text)
                          );
                        }
                      }}
                    />
                  }
                  label={option.text}
                />
              ))}
            </FormControl>
          </Box>
        );
      
      default:
        return <Typography>Unknown step type</Typography>;
    }
  };

  // Render results summary
  const renderResults = () => {
    const passed = score >= 70;
    
    return (
      <Box mt={4}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Training Results
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={score}
                size={120}
                thickness={5}
                color={passed ? 'success' : 'error'}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div" color="text.secondary">
                  {Math.round(score)}%
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {passed ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Congratulations! You've successfully completed this training scenario.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You didn't pass this scenario. Review the material and try again.
            </Alert>
          )}
          
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSelectedScenario(null)}
              sx={{ mr: 2 }}
            >
              Return to Scenarios
            </Button>
            
            {passed && (
              <Button
                variant="outlined"
                color="success"
                onClick={() => setCertificateDialog(true)}
                startIcon={<EmojiEventsIcon />}
              >
                View Certificate
              </Button>
            )}
            
            {!passed && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setActiveStep(0);
                  setAnswers({});
                  setFeedback(null);
                  setShowResults(false);
                  setScore(0);
                  setTrainingComplete(false);
                }}
              >
                Try Again
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  // Render certificate dialog
  const renderCertificateDialog = () => {
    return (
      <Dialog
        open={certificateDialog}
        onClose={() => setCertificateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Training Completion Certificate</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3, border: '8px solid #f5f5f5', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontFamily: 'serif', mb: 2 }}>
              Certificate of Completion
            </Typography>
            
            <Typography variant="h6" sx={{ fontFamily: 'serif', mb: 4 }}>
              This is to certify that
            </Typography>
            
            <Typography variant="h5" sx={{ fontFamily: 'serif', fontWeight: 'bold', mb: 4 }}>
              John Doe
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4 }}>
              has successfully completed the security training module
            </Typography>
            
            <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 'bold', mb: 4 }}>
              "{selectedScenario?.title}"
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4 }}>
              with a score of {Math.round(score)}%
            </Typography>
            
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Completed on {new Date().toLocaleDateString()}
            </Typography>
            
            <Box mt={4} mb={2}>
              <img 
                src="/images/certificate-seal.png" 
                alt="Certificate Seal" 
                style={{ width: '100px', height: '100px', opacity: 0.8 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // In a real implementation, this would generate and download a PDF
              alert('In a production environment, this would download a PDF certificate.');
              setCertificateDialog(false);
            }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render scenario selection dialog
  const renderScenarioDialog = () => {
    return (
      <Dialog
        open={openScenarioDialog}
        onClose={() => setOpenScenarioDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedScenario?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedScenario?.description}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Difficulty</Typography>
              <Chip 
                label={selectedScenario?.difficulty.toUpperCase()} 
                color={
                  selectedScenario?.difficulty === 'beginner' ? 'success' :
                  selectedScenario?.difficulty === 'intermediate' ? 'warning' : 'error'
                }
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle2">Estimated Time</Typography>
              <Typography variant="body2">
                {selectedScenario?.estimatedTime}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2">What You'll Learn</Typography>
              <Typography variant="body2">
                This scenario will teach you the proper procedures for identifying, 
                containing, and responding to a {selectedScenario?.title.toLowerCase()} incident.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScenarioDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleStartScenario(selectedScenario)}
          >
            Start Training
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Main render
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading training scenarios...</Typography>
      </Box>
    );
  }

  // If no scenario is selected, show the scenario list
  if (!selectedScenario) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <SchoolIcon sx={{ fontSize: 30, mr: 1 }} />
          <Typography variant="h5" component="h2">
            Security Incident Response Training
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          Welcome to the security incident response training module. Select a scenario below to practice 
          how to effectively respond to different security incidents.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Available Training Scenarios
            </Typography>
            
            <Grid container spacing={2}>
              {scenarios.map((scenario) => (
                <Grid item xs={12} sm={6} key={scenario.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {scenario.title}
                      </Typography>
                      
                      <Box display="flex" gap={1} my={1}>
                        <Chip 
                          label={scenario.difficulty.toUpperCase()} 
                          size="small" 
                          color={
                            scenario.difficulty === 'beginner' ? 'success' :
                            scenario.difficulty === 'intermediate' ? 'warning' : 'error'
                          }
                        />
                        <Chip 
                          label={scenario.estimatedTime} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {scenario.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleSelectScenario(scenario)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleStartScenario(scenario)}
                      >
                        Start Training
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Training History
              </Typography>
              
              {trainingHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  You haven't completed any training scenarios yet.
                </Typography>
              ) : (
                <List>
                  {trainingHistory.map((record) => (
                    <ListItem key={record.id}>
                      <ListItemIcon>
                        {record.passed ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <WarningIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={record.scenarioTitle}
                        secondary={`Score: ${record.score}% - ${new Date(record.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Box mt={2}>
                <Typography variant="subtitle2">Progress Overview</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(trainingHistory.length / scenarios.length) * 100} 
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right' }}>
                  {trainingHistory.length} of {scenarios.length} scenarios completed
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {renderScenarioDialog()}
      </Box>
    );
  }

  // If a scenario is selected and showing results
  if (showResults) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <SchoolIcon sx={{ fontSize: 30, mr: 1 }} />
          <Typography variant="h5" component="h2">
            {selectedScenario.title}
          </Typography>
        </Box>
        
        {renderResults()}
        {renderCertificateDialog()}
      </Box>
    );
  }

  // If a scenario is selected and in progress
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <SchoolIcon sx={{ fontSize: 30, mr: 1 }} />
        <Typography variant="h5" component="h2">
          {selectedScenario.title}
        </Typography>
      </Box>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {selectedScenario.steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {selectedScenario.steps[activeStep].title}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {renderStepContent(activeStep)}
        
        {feedback && (
          <Alert severity={feedback.type} sx={{ mt: 2 }}>
            {feedback.message}
          </Alert>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
        >
          {activeStep === selectedScenario.steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default IncidentResponseTraining;
