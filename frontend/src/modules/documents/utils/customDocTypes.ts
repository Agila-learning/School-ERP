export interface DocumentTypeDefinition {
  id: string;
  name: string;
  roleCategory: string; // e.g. 'Teaching Staff', 'Lab Staff', 'Transport Staff', 'Office Staff', 'Kindergarten Staff', 'Students', 'Institutional'
  description?: string;
  isMandatory?: boolean;
  trackExpiry?: boolean;
  isCustom?: boolean;
}

export class DocumentTypeItem implements DocumentTypeDefinition {
  id = '';
  name = '';
  roleCategory = '';
  description?: string;
  isMandatory?: boolean;
  trackExpiry?: boolean;
  isCustom?: boolean;
}

export const DocumentTypeDefinition = DocumentTypeItem;

export const ROLE_CATEGORIES = [
  'All Roles',
  'Teaching Staff',
  'Lab Staff',
  'Transport Staff',
  'Office Staff',
  'Kindergarten Staff',
  'Students',
  'Institutional'
];

export const INITIAL_DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  // Teaching Staff
  { id: 'dt-teach-1', name: 'Curriculum Vitae / Resume', roleCategory: 'Teaching Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-teach-2', name: 'Highest Degree Certificate (B.Sc / M.Sc / PhD)', roleCategory: 'Teaching Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-teach-3', name: 'B.Ed / Teaching Licensure', roleCategory: 'Teaching Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-teach-4', name: 'Teacher Eligibility Test (TET / CTET)', roleCategory: 'Teaching Staff', isMandatory: false, trackExpiry: true },
  { id: 'dt-teach-5', name: 'Relieving & Experience Certificate', roleCategory: 'Teaching Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-teach-6', name: 'Government ID Proof (Aadhar / Passport)', roleCategory: 'Teaching Staff', isMandatory: true, trackExpiry: false },

  // Lab Staff
  { id: 'dt-lab-1', name: 'Lab Technician Diploma / Degree', roleCategory: 'Lab Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-lab-2', name: 'Chemical & Hazardous Materials Clearance', roleCategory: 'Lab Staff', isMandatory: true, trackExpiry: true },
  { id: 'dt-lab-3', name: 'Lab Safety & Radiation Handling NOC', roleCategory: 'Lab Staff', isMandatory: false, trackExpiry: true },
  { id: 'dt-lab-4', name: 'First Aid & Fire Response Certification', roleCategory: 'Lab Staff', isMandatory: true, trackExpiry: true },
  { id: 'dt-lab-5', name: 'Equipment Maintenance Log Credential', roleCategory: 'Lab Staff', isMandatory: false, trackExpiry: false },

  // Transport Staff
  { id: 'dt-trans-1', name: 'Commercial Heavy Driving License (HMV)', roleCategory: 'Transport Staff', isMandatory: true, trackExpiry: true },
  { id: 'dt-trans-2', name: 'School Bus Passenger Badge Endorsement', roleCategory: 'Transport Staff', isMandatory: true, trackExpiry: true },
  { id: 'dt-trans-3', name: 'Annual Vision & Medical Fitness Certificate', roleCategory: 'Transport Staff', isMandatory: true, trackExpiry: true },
  { id: 'dt-trans-4', name: 'Police Background Verification Certificate', roleCategory: 'Transport Staff', isMandatory: true, trackExpiry: true },
  { id: 'dt-trans-5', name: 'Defensive Driving & First Aid Training', roleCategory: 'Transport Staff', isMandatory: false, trackExpiry: true },

  // Office & Admin Staff
  { id: 'dt-office-1', name: 'Degree Certificate (B.Com / BBA / MBA)', roleCategory: 'Office Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-office-2', name: 'Accounting & ERP Software Certification', roleCategory: 'Office Staff', isMandatory: false, trackExpiry: false },
  { id: 'dt-office-3', name: 'Government Identity Proof', roleCategory: 'Office Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-office-4', name: 'Employment Bond / Non-Disclosure Agreement', roleCategory: 'Office Staff', isMandatory: true, trackExpiry: false },

  // Kindergarten Staff
  { id: 'dt-kg-1', name: 'Montessori / ECCE Diploma', roleCategory: 'Kindergarten Staff', isMandatory: true, trackExpiry: false },
  { id: 'dt-kg-2', name: 'Pediatric First Aid & Infant CPR', roleCategory: 'Kindergarten Staff', isMandatory: true, trackExpiry: true },
  { id: 'dt-kg-3', name: 'Child Safeguarding & Protection Clearance', roleCategory: 'Kindergarten Staff', isMandatory: true, trackExpiry: true },

  // Students
  { id: 'dt-stu-1', name: 'Birth Certificate (Municipal / Registrar)', roleCategory: 'Students', isMandatory: true, trackExpiry: false },
  { id: 'dt-stu-2', name: 'Transfer Certificate (TC)', roleCategory: 'Students', isMandatory: true, trackExpiry: false },
  { id: 'dt-stu-3', name: 'Previous School Marksheet / Progress Card', roleCategory: 'Students', isMandatory: true, trackExpiry: false },
  { id: 'dt-stu-4', name: 'Student Aadhar / National Identity Card', roleCategory: 'Students', isMandatory: true, trackExpiry: false },
  { id: 'dt-stu-5', name: 'Immunization & Health Record Book', roleCategory: 'Students', isMandatory: true, trackExpiry: false },
  { id: 'dt-stu-6', name: 'Parent / Guardian ID Proof', roleCategory: 'Students', isMandatory: true, trackExpiry: false },

  // Institutional
  { id: 'dt-inst-1', name: 'CBSE / State Board Affiliation Extension', roleCategory: 'Institutional', isMandatory: true, trackExpiry: true },
  { id: 'dt-inst-2', name: 'Fire Safety NOC & Clearance', roleCategory: 'Institutional', isMandatory: true, trackExpiry: true },
  { id: 'dt-inst-3', name: 'Public Works Structural Stability Certificate', roleCategory: 'Institutional', isMandatory: true, trackExpiry: true },
  { id: 'dt-inst-4', name: 'Drinking Water & Sanitation Certificate', roleCategory: 'Institutional', isMandatory: true, trackExpiry: true },
  { id: 'dt-inst-5', name: 'Educational Trust Deed & Registration', roleCategory: 'Institutional', isMandatory: true, trackExpiry: false }
];

const STORAGE_KEY = 'erp_custom_document_types';

export const getStoredDocTypes = (): DocumentTypeDefinition[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENT_TYPES));
      return INITIAL_DOCUMENT_TYPES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOCUMENT_TYPES;
  } catch (e) {
    return INITIAL_DOCUMENT_TYPES;
  }
};

export const saveCustomDocType = (docType: Omit<DocumentTypeDefinition, 'id' | 'isCustom'>): DocumentTypeDefinition => {
  const current = getStoredDocTypes();
  const newType: DocumentTypeDefinition = {
    ...docType,
    id: 'dt-custom-' + Date.now(),
    isCustom: true
  };
  const updated = [...current, newType];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newType;
};

export const getDocTypesForCategory = (category: string): DocumentTypeDefinition[] => {
  const all = getStoredDocTypes();
  if (category === 'All Roles' || !category) return all;
  return all.filter(d => d.roleCategory === category);
};
