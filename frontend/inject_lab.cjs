const fs = require('fs');

const labRoutes = [
  { path: '/lab/dashboard', comp: 'LabDashboard', file: './modules/lab/pages/LabDashboard' },
  { path: '/lab/schedule', comp: 'LabSchedule', file: './modules/lab/pages/LabSchedule' },
  { path: '/lab/equipment', comp: 'LabEquipment', file: './modules/lab/pages/LabEquipment' },
  { path: '/lab/inventory', comp: 'LabInventory', file: './modules/lab/pages/LabInventory' },
  { path: '/lab/maintenance', comp: 'LabMaintenance', file: './modules/lab/pages/LabMaintenance' },
  { path: '/lab/bookings', comp: 'LabBookings', file: './modules/lab/pages/LabBookings' },
];

let appText = fs.readFileSync('C:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/App.tsx', 'utf8');

let imports = '';
let routes = '\n      {/* --- INJECTED LAB ROUTES --- */}\n';

labRoutes.forEach(r => {
  if (!appText.includes(r.comp)) {
    imports += `import ${r.comp} from '${r.file}';\n`;
  }
  routes += `      <Route path="${r.path}" element={<ProtectedRoute><${r.comp} /></ProtectedRoute>} />\n`;
});

// Insert imports at the top
appText = appText.replace('const App: React.FC = () => {', imports + '\nconst App: React.FC = () => {');

// Insert routes before the Global 404 Fallback
appText = appText.replace('{/* Global 404 Fallback */}', routes + '\n      {/* Global 404 Fallback */}');

fs.writeFileSync('C:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/App.tsx', appText);
console.log('App.tsx updated successfully with Lab routes');
