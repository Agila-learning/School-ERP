const fs = require('fs');

const files = [
  'C:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/modules/transport/pages/DriverDashboard.tsx',
  'C:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/modules/library/pages/LibrarianDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert the bad PowerShell replacement first
  content = content.replace(/sx=\{\{ fontWeight:  \}\}/g, 'fontWeight={700}');
  content = content.replace(/sx=\{\{ fontWeight: \}\}/g, 'fontWeight={700}'); // Just in case
  
  // Now apply the correct logic
  content = content.replace(/<Typography([^>]*)fontWeight=\{([0-9]+)\}([^>]*)>/g, (match, p1, p2, p3) => {
    // If it already has an sx prop
    if (match.includes('sx={{')) {
      return match.replace('sx={{', `sx={{ fontWeight: ${p2}, `).replace(` fontWeight={${p2}}`, '');
    } else {
      return match.replace(` fontWeight={${p2}}`, ` sx={{ fontWeight: ${p2} }}`);
    }
  });

  // Specifically for DriverDashboard.tsx lines 217 and 221
  content = content.replace(/import \{ \w*Icon.*\} from '@mui\/icons-material';/g, ''); // maybe? No, let's fix the step label prop specifically.
  content = content.replace(/<StepLabel StepIconProps=\{\{ sx: \{ color: 'success\.main' \} \}\}>/g, '<StepLabel>');
  content = content.replace(/<StepLabel StepIconProps=\{\{ sx: \{ color: 'text\.disabled' \} \}\}>/g, '<StepLabel>');
  content = content.replace(/<StepLabel StepIconProps=\{\{ sx: \{ color: 'primary\.main' \} \}\}>/g, '<StepLabel>');
  content = content.replace(/\(step, index\)/g, '(step)');

  fs.writeFileSync(file, content);
});

console.log('Fixed Typography props');
