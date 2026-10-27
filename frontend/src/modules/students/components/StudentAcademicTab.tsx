import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import type { StudentProfileDetail } from '../api/student.api';

interface Props {
  student: StudentProfileDetail;
}

const StudentAcademicTab: React.FC<Props> = ({ student }) => {
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Academic History</Typography>
        
        <Timeline position="right" sx={{ p: 0, m: 0 }}>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                {student.academicYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Enrollment
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Class {student.currentClass} - Section {student.currentSection}</Typography>
                <Typography variant="body2" color="text.secondary">Status: {student.status}</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                2025-26
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Previous Academic Year
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Typography variant="body1">Class {parseInt(student.currentClass || '0') - 1}</Typography>
                <Typography variant="body2" color="text.secondary">Status: Promoted</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                Admission
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Joined the institution
              </Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Paper>
    </Box>
  );
};

export default StudentAcademicTab;
