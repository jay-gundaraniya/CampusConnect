const cron = require('node-cron');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const User = require('../models/User');
const certificateService = require('./certificateService');

class CertificateCronService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    // Run daily at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
      console.log('🕛 Starting daily certificate generation job...');
      await this.generateCertificatesForCompletedEvents();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('📅 Certificate generation cron job scheduled for daily at midnight');
  }

  async generateCertificatesForCompletedEvents() {
    if (this.isRunning) {
      console.log('⏳ Certificate generation job already running, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('🔍 Finding completed events...');
      
      // Find all events that are completed (date < today)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const completedEvents = await Event.find({
        date: { $lt: today },
        status: { $ne: 'cancelled' }
      }).populate('participants.student', 'name email');

      console.log(`📊 Found ${completedEvents.length} completed events`);

      let totalGenerated = 0;
      let totalSkipped = 0;

      for (const event of completedEvents) {
        console.log(`\n📅 Processing event: ${event.title} (${event._id})`);
        
        const eventGenerated = await this.generateCertificatesForEvent(event);
        totalGenerated += eventGenerated.generated;
        totalSkipped += eventGenerated.skipped;
      }

      console.log(`\n✅ Certificate generation job completed!`);
      console.log(`📊 Summary: ${totalGenerated} certificates generated, ${totalSkipped} skipped`);
      
    } catch (error) {
      console.error('❌ Error in certificate generation job:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async generateCertificatesForEvent(event) {
    let generated = 0;
    let skipped = 0;

    try {
      for (const participant of event.participants) {
        // Skip if no student data
        if (!participant.student) {
          console.log(`  ⚠️  Skipping participant with missing student data`);
          skipped++;
          continue;
        }

        // Skip if participant didn't attend
        if (participant.status === 'no-show') {
          console.log(`  ⏭️  Skipping ${participant.student.name} (no-show)`);
          skipped++;
          continue;
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
          event: event._id,
          user: participant.student._id
        });

        if (existingCertificate) {
          console.log(`  ✅ Certificate already exists for ${participant.student.name}`);
          skipped++;
          continue;
        }

        try {
          // Generate certificate
          console.log(`  🎓 Generating certificate for ${participant.student.name}...`);
          
          const certificateData = {
            user: participant.student,
            event: {
              _id: event._id,
              title: event.title,
              date: event.date
            },
            certificateId: new require('mongoose').Types.ObjectId().toString()
          };

          const { filePath, fileName, certificateId } = await certificateService.generateCertificate(certificateData);

          // Save certificate record
          const certificate = new Certificate({
            user: participant.student._id,
            event: event._id,
            filePath,
            certificateId,
            title: `${event.title} - Certificate of Participation`
          });

          await certificate.save();
          
          console.log(`  ✅ Certificate generated for ${participant.student.name} (${certificateId})`);
          generated++;

        } catch (certError) {
          console.error(`  ❌ Error generating certificate for ${participant.student.name}:`, certError.message);
          skipped++;
        }
      }

    } catch (error) {
      console.error(`❌ Error processing event ${event.title}:`, error);
    }

    return { generated, skipped };
  }

  // Manual trigger for testing
  async runNow() {
    console.log('🚀 Manually triggering certificate generation job...');
    await this.generateCertificatesForCompletedEvents();
  }
}

module.exports = new CertificateCronService();
