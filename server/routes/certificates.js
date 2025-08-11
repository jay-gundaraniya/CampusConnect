const express = require('express');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Get all certificates (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('student', 'name email')
      .populate('event', 'title date')
      .sort({ issuedDate: -1 });
    
    res.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get certificates for a specific student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    // Students can only view their own certificates
    if (req.user.role === 'student' && req.user.userId !== req.params.studentId) {
      return res.status(403).json({ message: 'Not authorized to view these certificates' });
    }
    
    const certificates = await Certificate.find({ student: req.params.studentId })
      .populate('event', 'title date location')
      .sort({ issuedDate: -1 });
    
    res.json({ certificates });
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get certificates for a specific event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const certificates = await Certificate.find({ event: req.params.eventId })
      .populate('student', 'name email')
      .sort({ issuedDate: -1 });
    
    res.json({ certificates });
  } catch (error) {
    console.error('Error fetching event certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate certificates for an event (coordinator or admin)
router.post('/generate/:eventId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('participants.student', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is authorized (coordinator who created event or admin)
    if (event.coordinator.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to generate certificates for this event' });
    }
    
    // Check if event is completed
    if (event.status !== 'completed') {
      return res.status(400).json({ message: 'Certificates can only be generated for completed events' });
    }
    
    const { grades } = req.body; // Optional grades object: { studentId: 'A+', ... }
    
    const certificates = [];
    
    for (const participant of event.participants) {
      // Skip if participant didn't attend
      if (participant.status !== 'attended') continue;
      
      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        student: participant.student._id,
        event: event._id
      });
      
      if (existingCertificate) continue;
      
      const certificateData = {
        student: participant.student._id,
        event: event._id,
        title: `${event.title} - Certificate of Participation`,
        grade: grades && grades[participant.student._id] ? grades[participant.student._id] : null,
        instructor: event.coordinator.name || 'Event Coordinator',
        status: 'issued'
      };
      
      const certificate = new Certificate(certificateData);
      await certificate.save();
      
      certificates.push(certificate);
    }
    
    res.status(201).json({ 
      message: `${certificates.length} certificates generated successfully`,
      certificates 
    });
  } catch (error) {
    console.error('Error generating certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark participant as attended (coordinator or admin)
router.post('/:eventId/attend/:studentId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is authorized
    if (event.coordinator.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this event' });
    }
    
    const participant = event.participants.find(
      p => p.student.toString() === req.params.studentId
    );
    
    if (!participant) {
      return res.status(404).json({ message: 'Student not registered for this event' });
    }
    
    participant.status = 'attended';
    await event.save();
    
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark participant as no-show (coordinator or admin)
router.post('/:eventId/no-show/:studentId', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is authorized
    if (event.coordinator.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to mark no-show for this event' });
    }
    
    const participant = event.participants.find(
      p => p.student.toString() === req.params.studentId
    );
    
    if (!participant) {
      return res.status(404).json({ message: 'Student not registered for this event' });
    }
    
    participant.status = 'no-show';
    await event.save();
    
    res.json({ message: 'No-show marked successfully' });
  } catch (error) {
    console.error('Error marking no-show:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Download certificate (student or admin)
router.get('/download/:certificateId', authenticateToken, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId)
      .populate('student', 'name email')
      .populate('event', 'title date location');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Check if user is authorized
    if (req.user.role === 'student' && certificate.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }
    
    // For now, return certificate data
    // In a real application, you would generate a PDF and return it
    res.json({ 
      certificate,
      downloadUrl: `/api/certificates/${certificate.certificateId}/pdf` // Placeholder
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify certificate (public)
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId)
      .populate('student', 'name email')
      .populate('event', 'title date location');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.json({ 
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        title: certificate.title,
        studentName: certificate.student.name,
        eventTitle: certificate.event.title,
        issuedDate: certificate.issuedDate,
        grade: certificate.grade,
        instructor: certificate.instructor
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 