const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const { TimetableService } = require('./src/modules/timetable/services/timetable.service');
require('./src/modules/academic/models/Section.model');
require('./src/modules/academic/models/Subject.model');
require('./src/modules/hr/models/Employee.model');

async function testTimetable() {
  await mongoose.connect(env.mongoUri);
  const tenantId = '66d0c2e36bf2c450a80e0c15';
  
  const service = new TimetableService(tenantId);
  try {
    const version = await service.createVersion({
      name: 'Test Version',
      academicYearId: new mongoose.Types.ObjectId().toString(),
      branchId: new mongoose.Types.ObjectId().toString(),
      effectiveFrom: new Date().toISOString(),
      constraints: { workingDays: ['MON'], maxPeriodsPerDay: 8 }
    }, new mongoose.Types.ObjectId().toString());
    
    console.log('Version created:', version._id);
    
    const entry = await service.upsertEntry({
      versionId: version._id,
      sectionId: new mongoose.Types.ObjectId().toString(),
      subjectId: new mongoose.Types.ObjectId().toString(),
      teacherEmployeeId: new mongoose.Types.ObjectId().toString(),
      periodDefinitionId: new mongoose.Types.ObjectId().toString(),
      day: 'MON',
      isDoublePeriod: false
    }, new mongoose.Types.ObjectId().toString());
    
    console.log('Entry created:', entry);
  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit();
}

testTimetable();
