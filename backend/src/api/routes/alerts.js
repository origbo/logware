const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const alertsController = require('../controllers/alertsController');

// @route   GET api/alerts
// @desc    Get alerts with pagination and filters
// @access  Private
router.get('/', auth, alertsController.getAlerts);

// @route   GET api/alerts/:id
// @desc    Get alert by ID
// @access  Private
router.get('/:id', auth, alertsController.getAlertDetails);

// @route   PUT api/alerts/:id
// @desc    Update alert status
// @access  Private
router.put('/:id', auth, alertsController.updateAlertStatus);

// @route   POST api/alerts/batch
// @desc    Update multiple alerts
// @access  Private
router.post('/batch', auth, async (req, res) => {
  try {
    const { alertIds, status, notes } = req.body;
    
    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({ message: 'Alert IDs are required' });
    }
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Process each alert ID using the controller's updateAlertStatus method
    const results = [];
    for (const id of alertIds) {
      try {
        // Create a mock request and response to reuse the controller
        const mockReq = { params: { id }, body: { status, notes }, user: req.user };
        const mockRes = {
          json: (data) => {
            results.push({ id, success: true, data });
          },
          status: (code) => ({
            json: (data) => {
              results.push({ id, success: false, error: data.message, code });
            }
          })
        };
        
        await alertsController.updateAlertStatus(mockReq, mockRes);
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    
    res.json({
      alertsUpdated: results.filter(r => r.success).length,
      status,
      updatedBy: req.user.id,
      updatedAt: new Date(),
      notes,
      results,
      message: 'Batch alert update processed'
    });
  } catch (err) {
    console.error('Error in batch update:', err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
