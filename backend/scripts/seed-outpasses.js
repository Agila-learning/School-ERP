const mongoose = require('mongoose');

async function seedOutpasses() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  const db = mongoose.connection.db;
  const tenantId = new mongoose.Types.ObjectId('6a75d2601ca0fb8a69f6a7df');

  const students = await db.collection('studentprofiles').find().limit(5).toArray();
  const hostels = await db.collection('hostels').find({ tenantId }).limit(2).toArray();
  const allocations = await db.collection('hostelallocations').find({ tenantId }).limit(5).toArray();

  if (students.length === 0 || hostels.length === 0) {
    console.log('No students or hostels found');
    process.exit(0);
  }

  // Clear existing mock outpasses
  await db.collection('hosteloutpasses').deleteMany({ tenantId });

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const sixHours = new Date(now.getTime() + 6 * 3600 * 1000);

  const outpasses = [
    {
      tenantId,
      studentId: students[0]._id,
      hostelId: hostels[0]._id,
      allocationId: allocations[0]?._id,
      destination: 'Home Residence (Chennai)',
      reason: 'Weekend Family Visit',
      leavingDateTime: new Date(now.getTime() - 2 * 3600 * 1000),
      expectedReturnDateTime: tomorrow,
      parentConsent: true,
      status: 'GATE_EXIT',
      gatePassNumber: 'GP-2026-081',
      remarks: 'Parent verified via SMS consent',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      tenantId,
      studentId: students[1] ? students[1]._id : students[0]._id,
      hostelId: hostels[0]._id,
      allocationId: allocations[1]?._id,
      destination: 'Apollo Specialty Hospital',
      reason: 'Dental & Orthodontic Checkup',
      leavingDateTime: new Date(now.getTime() + 1 * 3600 * 1000),
      expectedReturnDateTime: sixHours,
      parentConsent: true,
      status: 'WARDEN_APPROVED',
      gatePassNumber: 'GP-2026-082',
      remarks: 'Medical prescription attached',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      tenantId,
      studentId: students[2] ? students[2]._id : students[0]._id,
      hostelId: hostels[1] ? hostels[1]._id : hostels[0]._id,
      allocationId: allocations[2]?._id,
      destination: 'City Center Book Fair',
      reason: 'Academic Reference Books Purchase',
      leavingDateTime: new Date(now.getTime() + 3 * 3600 * 1000),
      expectedReturnDateTime: new Date(now.getTime() + 7 * 3600 * 1000),
      parentConsent: false,
      status: 'PENDING_WARDEN',
      gatePassNumber: 'GP-2026-083',
      remarks: 'Awaiting parent telephonic verification',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('hosteloutpasses').insertMany(outpasses);
  console.log('Seeded 3 realistic outpasses successfully');
  await mongoose.disconnect();
}

seedOutpasses().catch(err => {
  console.error(err);
  process.exit(1);
});
