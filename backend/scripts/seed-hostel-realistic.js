const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/agila/OneDrive/Documents/School-ERP_FIC/backend/.env' });

async function seedHostel() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp');
  console.log('Connected to MongoDB');

  const tenant = await mongoose.connection.db.collection('tenants').findOne({}) || 
                 await mongoose.connection.db.collection('users').findOne({});
  const tenantId = tenant?.tenantId || tenant?._id;
  const branch = await mongoose.connection.db.collection('branches').findOne({ tenantId }) || 
                 { _id: new mongoose.Types.ObjectId() };
  const academicYear = await mongoose.connection.db.collection('academicyears').findOne({ tenantId }) || 
                       { _id: new mongoose.Types.ObjectId() };

  console.log('Seeding hostel for Tenant:', tenantId.toString());

  // 1. Clean existing hostel collections for fresh, clean state
  await mongoose.connection.db.collection('hostels').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hostelbuildings').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hostelblocks').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hostelfloors').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hostelrooms').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hostelbeds').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hostelapplications').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hostelallocations').deleteMany({ tenantId });
  await mongoose.connection.db.collection('hosteloutpasses').deleteMany({ tenantId });

  // 2. Create Hostels
  const boysHostelId = new mongoose.Types.ObjectId();
  const girlsHostelId = new mongoose.Types.ObjectId();

  await mongoose.connection.db.collection('hostels').insertMany([
    {
      _id: boysHostelId,
      tenantId,
      branchId: branch._id,
      academicYearId: academicYear._id,
      code: 'HST-B01',
      name: 'Dr. APJ Abdul Kalam Senior Boys Hostel',
      hostelType: 'BOYS',
      genderApplicability: 'MALE',
      totalCapacity: 60,
      address: 'North Residential Campus, Gate 4',
      status: 'ACTIVE',
      description: 'Fully equipped hostel for Senior Secondary scholars with study library, high-speed Wi-Fi & recreation hall.',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: girlsHostelId,
      tenantId,
      branchId: branch._id,
      academicYearId: academicYear._id,
      code: 'HST-G01',
      name: 'Sarojini Naidu Girls Residency',
      hostelType: 'GIRLS',
      genderApplicability: 'FEMALE',
      totalCapacity: 40,
      address: 'East Green Campus, Near Botanical Garden',
      status: 'ACTIVE',
      description: 'Secure, modern residency with biometric access, 24/7 lady security, dining hall & reading room.',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 3. Create Buildings & Blocks
  const bldBoysId = new mongoose.Types.ObjectId();
  const bldGirlsId = new mongoose.Types.ObjectId();

  await mongoose.connection.db.collection('hostelbuildings').insertMany([
    {
      _id: bldBoysId,
      tenantId,
      hostelId: boysHostelId,
      name: 'Kalam Wing Alpha',
      code: 'KW-A',
      numberOfFloors: 3,
      capacity: 60,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: bldGirlsId,
      tenantId,
      hostelId: girlsHostelId,
      name: 'Naidu Wing Beta',
      code: 'NW-B',
      numberOfFloors: 2,
      capacity: 40,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Blocks
  const blockAId = new mongoose.Types.ObjectId();
  const blockBId = new mongoose.Types.ObjectId();
  await mongoose.connection.db.collection('hostelblocks').insertMany([
    {
      _id: blockAId,
      tenantId,
      hostelId: boysHostelId,
      buildingId: bldBoysId,
      name: 'Block A (Senior Boys)',
      capacity: 60,
      floorCount: 3,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: blockBId,
      tenantId,
      hostelId: girlsHostelId,
      buildingId: bldGirlsId,
      name: 'Block B (Girls Wing)',
      capacity: 40,
      floorCount: 2,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 4. Create Floors
  const floor1Id = new mongoose.Types.ObjectId();
  const floor2Id = new mongoose.Types.ObjectId();
  const floorG1Id = new mongoose.Types.ObjectId();

  await mongoose.connection.db.collection('hostelfloors').insertMany([
    {
      _id: floor1Id,
      tenantId,
      buildingId: bldBoysId,
      blockId: blockAId,
      floorNumber: '1',
      floorName: 'Floor 1 (Ground & Study)',
      capacity: 30,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: floor2Id,
      tenantId,
      buildingId: bldBoysId,
      blockId: blockAId,
      floorNumber: '2',
      floorName: 'Floor 2 (Dormitory Bay)',
      capacity: 30,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: floorG1Id,
      tenantId,
      buildingId: bldGirlsId,
      blockId: blockBId,
      floorNumber: '1',
      floorName: 'Floor 1 (Girls Main Bay)',
      capacity: 40,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // 5. Get available student users or profiles
  const studentProfiles = await mongoose.connection.db.collection('studentprofiles').find({ tenantId }).toArray();
  const userStudents = await mongoose.connection.db.collection('users').find({
    $or: [{ role: 'STUDENT' }, { email: { $regex: /STU-/i } }]
  }).toArray();

  const studentPool = studentProfiles.length > 0 ? studentProfiles : userStudents;
  console.log(`Available students for allocation: ${studentPool.length}`);

  // 6. Create Rooms & Beds
  const roomsData = [
    { number: '101', type: 'DOUBLE', cap: 2, floor: floor1Id, block: blockAId, hostel: boysHostelId, gender: 'MALE' },
    { number: '102', type: 'DOUBLE', cap: 2, floor: floor1Id, block: blockAId, hostel: boysHostelId, gender: 'MALE' },
    { number: '103', type: 'TRIPLE', cap: 3, floor: floor1Id, block: blockAId, hostel: boysHostelId, gender: 'MALE' },
    { number: '104', type: 'SINGLE', cap: 1, floor: floor1Id, block: blockAId, hostel: boysHostelId, gender: 'MALE' },
    { number: '201', type: 'DOUBLE', cap: 2, floor: floor2Id, block: blockAId, hostel: boysHostelId, gender: 'MALE' },
    { number: '202', type: 'DOUBLE', cap: 2, floor: floor2Id, block: blockAId, hostel: boysHostelId, gender: 'MALE' },
    { number: '203', type: 'TRIPLE', cap: 3, floor: floor2Id, block: blockAId, hostel: boysHostelId, gender: 'MALE' },
    { number: 'G-101', type: 'DOUBLE', cap: 2, floor: floorG1Id, block: blockBId, hostel: girlsHostelId, gender: 'FEMALE' },
    { number: 'G-102', type: 'DOUBLE', cap: 2, floor: floorG1Id, block: blockBId, hostel: girlsHostelId, gender: 'FEMALE' },
    { number: 'G-103', type: 'TRIPLE', cap: 3, floor: floorG1Id, block: blockBId, hostel: girlsHostelId, gender: 'FEMALE' }
  ];

  let studentIdx = 0;
  let totalBedsCount = 0;
  let allocatedCount = 0;

  for (const rDef of roomsData) {
    const roomId = new mongoose.Types.ObjectId();
    const createdRoom = {
      _id: roomId,
      tenantId,
      hostelId: rDef.hostel,
      blockId: rDef.block,
      floorId: rDef.floor,
      roomNumber: rDef.number,
      roomType: rDef.type,
      capacity: rDef.cap,
      currentOccupancy: 0,
      genderApplicability: rDef.gender,
      facilities: ['Attached Bathroom', 'Study Table', 'Cupboard', 'Ceiling Fan', 'LAN Port'],
      status: 'AVAILABLE',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let roomOccupancy = 0;
    const beds = [];

    for (let b = 1; b <= rDef.cap; b++) {
      totalBedsCount++;
      const bedId = new mongoose.Types.ObjectId();
      let bedStatus = 'AVAILABLE';
      let allocId = null;

      // Allocate first 5 students to demonstrate active occupancy
      if (studentIdx < studentPool.length && studentIdx < 5) {
        const student = studentPool[studentIdx];
        allocId = new mongoose.Types.ObjectId();
        bedStatus = 'OCCUPIED';
        roomOccupancy++;
        allocatedCount++;

        // Insert allocation
        await mongoose.connection.db.collection('hostelallocations').insertOne({
          _id: allocId,
          tenantId,
          studentId: student._id,
          academicYearId: academicYear._id,
          hostelId: rDef.hostel,
          roomId,
          bedId,
          startDate: new Date(Date.now() - 30 * 86400000),
          status: 'CHECKED_IN',
          depositAmount: 5000,
          roomHandoverCondition: 'EXCELLENT',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        studentIdx++;
      }

      beds.push({
        _id: bedId,
        tenantId,
        roomId,
        bedNumber: `B${b}`,
        status: bedStatus,
        currentAllocationId: allocId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    createdRoom.currentOccupancy = roomOccupancy;
    if (roomOccupancy === rDef.cap) {
      createdRoom.status = 'OCCUPIED';
    } else if (roomOccupancy > 0) {
      createdRoom.status = 'PARTIALLY_OCCUPIED';
    }

    await mongoose.connection.db.collection('hostelrooms').insertOne(createdRoom);
    await mongoose.connection.db.collection('hostelbeds').insertMany(beds);
  }

  // 7. Create Pending Applications
  if (studentPool.length > 5) {
    for (let i = 5; i < Math.min(studentPool.length, 7); i++) {
      const student = studentPool[i];
      await mongoose.connection.db.collection('hostelapplications').insertOne({
        tenantId,
        studentId: student._id,
        academicYearId: academicYear._id,
        branchId: branch._id,
        preferredHostelId: boysHostelId,
        preferredRoomType: 'DOUBLE',
        boardingType: 'REGULAR',
        startDate: new Date(),
        reason: 'Long daily commute (> 45 km). Requires residential campus room.',
        parentConsentGiven: true,
        parentConsentTimestamp: new Date(),
        status: 'SUBMITTED',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  console.log(`✅ Seeded ${roomsData.length} Rooms, ${totalBedsCount} Beds, ${allocatedCount} Active Allocations!`);
  process.exit(0);
}

seedHostel().catch(err => {
  console.error('Hostel seed failed:', err);
  process.exit(1);
});
