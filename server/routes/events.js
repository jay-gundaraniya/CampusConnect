const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const { status, category, eventType } = req.query;
    let filter = { status: 'approved' };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (eventType) filter.eventType = eventType;
    
    const events = await Event.find(filter)
      .populate('coordinator', 'name email')
      .sort({ date: 1 });
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all events for admin (includes all statuses)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin requesting events. User:', req.user);
    const { status, category, eventType } = req.query;
    let filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (eventType && eventType !== 'all') filter.eventType = eventType;
    
    console.log('Filter:', filter);
    
    const events = await Event.find(filter)
      .populate('coordinator', 'name email')
      .populate('participants.student', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${events.length} events for admin`);
    res.json({ events });
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('coordinator', 'name email')
      .populate('participants.student', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new event (coordinator only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.roles || !user.roles.includes('coordinator')) {
      return res.status(403).json({ message: 'Only coordinators can create events' });
    }
    
    const eventData = {
      ...req.body,
      coordinator: req.user.userId,
      status: 'pending' // Events need admin approval
    };
    
    const event = new Event(eventData);
    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('coordinator', 'name email');
    
    res.status(201).json({ 
      message: 'Event created successfully and sent for approval',
      event: populatedEvent 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update event (coordinator who created it)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Update event request:', req.params.id, req.body, 'User:', req.user);
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('Current event:', event);
    
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isAdmin = user.roles && user.roles.includes('admin');
    const isCoordinator = user.roles && user.roles.includes('coordinator');
    
    if (event.coordinator.toString() !== req.user.userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // If event is approved, only admin can update
    if (event.status === 'approved' && !isAdmin) {
      return res.status(403).json({ message: 'Approved events can only be updated by admin' });
    }
    
    // Prepare update data
    let updateData = { ...req.body };
    
    // If coordinator is updating (not admin), reset status to pending
    if (!isAdmin) {
      updateData.status = 'pending';
    }
    
    console.log('Update data:', updateData);
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('coordinator', 'name email');
    
    console.log('Updated event:', updatedEvent);
    
    res.json({ 
      message: 'Event updated successfully',
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete event (coordinator who created it or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isAdmin = user.roles && user.roles.includes('admin');
    
    if (event.coordinator.toString() !== req.user.userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register for event (student only)
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.roles || !user.roles.includes('student')) {
      return res.status(403).json({ message: 'Only students can register for events' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }
    
    // Check if already registered
    const alreadyRegistered = event.participants.some(
      p => p.student.toString() === req.user.userId
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Check if event is full
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    event.participants.push({
      student: req.user.userId,
      status: 'registered'
    });
    
    event.currentParticipants += 1;
    await event.save();
    
    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unregister from event (student only)
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.roles || !user.roles.includes('student')) {
      return res.status(403).json({ message: 'Only students can unregister from events' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const participantIndex = event.participants.findIndex(
      p => p.student.toString() === req.user.userId
    );
    
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }
    
    event.participants.splice(participantIndex, 1);
    event.currentParticipants -= 1;
    await event.save();
    
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get events by coordinator
router.get('/coordinator/me', authenticateToken, async (req, res) => {
  try {
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.roles || !user.roles.includes('coordinator')) {
      return res.status(403).json({ message: 'Only coordinators can access this route' });
    }
    
    const events = await Event.find({ coordinator: req.user.userId })
      .populate('participants.student', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching coordinator events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get events registered by student
router.get('/student/registered', authenticateToken, async (req, res) => {
  try {
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.roles || !user.roles.includes('student')) {
      return res.status(403).json({ message: 'Only students can access this route' });
    }
    
    const events = await Event.find({
      'participants.student': req.user.userId
    })
    .populate('coordinator', 'name email')
    .sort({ date: 1 });
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching student events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 