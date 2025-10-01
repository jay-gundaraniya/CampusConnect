const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const certificateService = require('../services/certificateService');

const router = express.Router();

// Get all certificates for a user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Certificate API called for user:', userId);
    console.log('🔍 Request user:', req.user);
    
    // Users can only view their own certificates
    if (req.user.role === 'student' && req.user.userId !== userId) {
      console.log('❌ Unauthorized access attempt');
      return res.status(403).json({ message: 'Not authorized to view these certificates' });
    }

    console.log('🔍 Querying certificates for user:', userId);
    const certificates = await Certificate.find({ user: userId })
      .populate('event', 'title date location')
      .sort({ issuedAt: -1 });

    console.log('✅ Found certificates:', certificates.length);
    res.json({ certificates });
  } catch (error) {
    console.error('❌ Error fetching user certificates:', error);
    console.error('❌ Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get certificate for specific user and event
router.get('/:eventId/:userId', authenticateToken, async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    console.log('🔍 Download request for event:', eventId, 'user:', userId);
    
    // Find certificate
    const certificate = await Certificate.findOne({
      event: eventId,
      user: userId
    }).populate('event', 'title date').populate('user', 'name email');

    // If certificate doesn't exist, try to generate it
    if (!certificate) {
      console.log('🔍 Certificate not found in database, attempting to generate...');
      
      // Check if event date has passed
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const eventDate = new Date(event.date);
      const currentDate = new Date();
      
      if (eventDate >= currentDate) {
        return res.status(400).json({ message: 'Certificates can only be generated for completed events' });
      }

      // Generate certificate
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      try {
        const certificateData = {
          user: { _id: user._id, name: user.name },
          event: { _id: event._id, title: event.title, date: event.date },
          certificateId: new mongoose.Types.ObjectId().toString()
        };

        const { filePath, fileName, certificateId } = await certificateService.generateCertificate(certificateData);

        // Save certificate record
        certificate = new Certificate({
          user: user._id,
          event: event._id,
          filePath: filePath,
          title: `${event.title} - Certificate of Participation`,
          certificateId: certificateId,
          status: 'issued'
        });
        await certificate.save();

        console.log('✅ Certificate generated and saved:', certificateId);
      } catch (generateError) {
        console.error('❌ Error generating certificate:', generateError);
        return res.status(500).json({ message: 'Failed to generate certificate' });
      }
    }

    // Check if file exists
    const filePath = certificateService.getCertificatePath(certificate.certificateId);
    console.log('🔍 Looking for certificate file at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Certificate file not found, attempting to regenerate...');
      
      // Try to regenerate the certificate
      try {
        const event = await Event.findById(eventId);
        const user = await User.findById(userId);
        
        if (!event || !user) {
          return res.status(404).json({ message: 'Event or user not found' });
        }

        const certificateData = {
          user: { _id: user._id, name: user.name },
          event: { _id: event._id, title: event.title, date: event.date },
          certificateId: certificate.certificateId
        };

        const { filePath: newFilePath } = await certificateService.generateCertificate(certificateData);
        
        // Update the certificate record with the new file path
        certificate.filePath = newFilePath;
        await certificate.save();
        
        console.log('✅ Certificate regenerated successfully:', newFilePath);
        
        // Use the new file path
        const finalFilePath = newFilePath;
        if (!fs.existsSync(finalFilePath)) {
          return res.status(404).json({ message: 'Failed to generate certificate file' });
        }
        
        console.log('✅ Sending regenerated certificate file:', finalFilePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="certificate_${eventId}_${userId}.pdf"`);
        res.sendFile(finalFilePath);
        return;
        
      } catch (regenerateError) {
        console.error('❌ Error regenerating certificate:', regenerateError);
        return res.status(500).json({ message: 'Failed to regenerate certificate' });
      }
    }

    console.log('✅ Sending certificate file:', filePath);

    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate_${eventId}_${userId}.pdf"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all certificates for an event (admin/coordinator only)
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Only admin or event coordinator can view event certificates
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.coordinator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view these certificates' });
    }

    const certificates = await Certificate.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ issuedAt: -1 });

    res.json({ certificates });
  } catch (error) {
    console.error('Error fetching event certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate certificate for specific user and event
router.post('/generate/:eventId/:userId', authenticateToken, async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      event: eventId,
      user: userId
    });

    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already exists' });
    }

    // Get event and user data
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: 'Event or user not found' });
    }

    // Check if user is registered for the event
    const isRegistered = event.participants.some(
      participant => participant.student.toString() === userId
    );

    if (!isRegistered) {
      return res.status(400).json({ message: 'User is not registered for this event' });
    }

    // Check if event is completed
    const eventDate = new Date(event.date);
    const currentDate = new Date();
    if (eventDate >= currentDate) {
      return res.status(400).json({ message: 'Certificates can only be generated for completed events' });
    }

    // Generate certificate
    const certificateData = {
      user: { _id: user._id, name: user.name },
      event: { _id: event._id, title: event.title, date: event.date },
      certificateId: new mongoose.Types.ObjectId().toString()
    };

    const { filePath, fileName, certificateId } = await certificateService.generateCertificate(certificateData);

    // Save certificate record
    const certificate = new Certificate({
      user: userId,
      event: eventId,
      filePath,
      certificateId,
      title: `${event.title} - Certificate of Participation`
    });

    await certificate.save();

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate._id,
        certificateId,
        title: certificate.title,
        issuedAt: certificate.issuedAt,
        downloadUrl: `/api/certificates/${eventId}/${userId}`
      }
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify certificate (public endpoint)
router.get('/verify/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    
    const certificate = await Certificate.findOne({
      user: userId,
      event: eventId,
      status: 'issued'
    })
      .populate('user', 'name email')
      .populate('event', 'title date location');

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found or not issued'
      });
    }

    res.json({
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        title: certificate.title,
        studentName: certificate.user.name,
        studentEmail: certificate.user.email,
        eventTitle: certificate.event.title,
        eventDate: certificate.event.date,
        eventLocation: certificate.event.location,
        issuedAt: certificate.issuedAt
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      valid: false,
      message: 'Internal server error'
    });
  }
});

// Delete certificate (admin/coordinator only)
router.delete('/:certificateId', authenticateToken, async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findById(certificateId)
      .populate('event', 'coordinator');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && certificate.event.coordinator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this certificate' });
    }

    // Delete file
    await certificateService.deleteCertificate(certificate.certificateId);

    // Delete database record
    await Certificate.findByIdAndDelete(certificateId);

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Manual trigger for certificate generation (admin only)
router.post('/generate-all', authenticateToken, async (req, res) => {
  try {
    // Only admin can trigger manual generation
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const certificateCron = require('../services/certificateCron');
    await certificateCron.runNow();

    res.json({ message: 'Certificate generation job triggered successfully' });
  } catch (error) {
    console.error('Error triggering certificate generation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;