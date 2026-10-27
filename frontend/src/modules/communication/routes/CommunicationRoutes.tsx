import { Routes, Route, Navigate } from 'react-router-dom';
import CommunicationDashboard from '../pages/CommunicationDashboard';
import AnnouncementManager from '../pages/AnnouncementManager';
import MessageComposer from '../pages/MessageComposer';
import ComplaintDesk from '../pages/ComplaintDesk';
import ChatWindow from '../pages/ChatWindow';
import PrincipalAnnouncer from '../pages/PrincipalAnnouncer';

const CommunicationRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<CommunicationDashboard />} />
      <Route path="announcements" element={<AnnouncementManager />} />
      <Route path="compose" element={<MessageComposer />} />
      <Route path="principal-announcer" element={<PrincipalAnnouncer />} />
      <Route path="complaints" element={<ComplaintDesk />} />
      <Route path="chat" element={<ChatWindow />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default CommunicationRoutes;
