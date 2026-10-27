// @ts-nocheck
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './landing.css';

/* ── Site Tour Context ────────────────────────────────── */
interface SiteTourContextType {
  openTour: () => void;
}
const SiteTourContext = createContext<SiteTourContextType>({ openTour: () => {} });

export const useSiteTour = () => useContext(SiteTourContext);

/* ── Navigation ─────────────────────────────────────── */
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-icon">ERP</div>
            <div>
              <div className="lp-logo-text">School<span>ERP</span></div>
            </div>
          </Link>

          <ul className="lp-nav-links">
            <li><a href="#features" onClick={e => { e.preventDefault(); scrollTo('features'); }}>Features</a></li>
            <li><a href="#modules" onClick={e => { e.preventDefault(); scrollTo('modules'); }}>Modules</a></li>
            <li><a href="#roles" onClick={e => { e.preventDefault(); scrollTo('roles'); }}>Solutions</a></li>
            <li><a href="#how-it-works" onClick={e => { e.preventDefault(); scrollTo('how-it-works'); }}>How It Works</a></li>
            <li><a href="#pricing" onClick={e => { e.preventDefault(); scrollTo('pricing'); }}>Pricing</a></li>
            <li><a href="#faq" onClick={e => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a></li>
          </ul>

          <div className="lp-nav-cta">
            <button className="lp-btn lp-btn-ghost" onClick={() => navigate('/login')} id="nav-login-btn">
              Login
            </button>
            <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => navigate('/register-school')} id="nav-demo-btn">
              Start Your School
            </button>
          </div>

          <button
            className="lp-nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            id="nav-mobile-toggle"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <div className={`lp-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => scrollTo('features')}>Features</a>
        <a href="#modules" onClick={() => scrollTo('modules')}>Modules</a>
        <a href="#roles" onClick={() => scrollTo('roles')}>Solutions</a>
        <a href="#how-it-works" onClick={() => scrollTo('how-it-works')}>How It Works</a>
        <a href="#pricing" onClick={() => scrollTo('pricing')}>Pricing</a>
        <a href="#faq" onClick={() => scrollTo('faq')}>FAQ</a>
        <div className="lp-mobile-cta">
          <button className="lp-btn lp-btn-secondary lp-btn-sm" onClick={() => navigate('/login')} id="mobile-login-btn">Login</button>
          <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => navigate('/register-school')} id="mobile-demo-btn">Start Your School</button>
        </div>
      </div>
    </>
  );
};

/* ── Hero Section ───────────────────────────────────── */
import { initHeroAnimation, initFloatingAnimation } from './animations/heroAnimation';
import { initEcosystemAnimation, initModulesAnimation } from './animations/modulesAnimation';
import { initWorkflowAnimation } from './animations/workflowAnimation';
import cartoonVideo from '../../assets/Cartoon-erp.mp4';
import { 
  AdminPanelSettings, MenuBook, DirectionsBus, 
  AccountBalanceWallet, Badge, Insights
} from '@mui/icons-material';

const moduleData = [
  {
    id: 'admin',
    num: '01',
    title: 'Administration',
    desc: 'Manage your entire institution from one intelligent control center.',
    color: '#3B82F6', // Electric Blue
    glow: 'rgba(59, 130, 246, 0.4)',
    bgGradient: 'rgba(59, 130, 246, 0.1)',
    icon: <AdminPanelSettings />,
    features: ['Student Management', 'Staff Management', 'Parent Management', 'User Roles & Permissions', 'School Configuration'],
  },
  {
    id: 'academics',
    num: '02',
    title: 'Academics',
    desc: 'Plan, manage and optimize every academic workflow.',
    color: '#8B5CF6', // Purple
    glow: 'rgba(139, 92, 246, 0.4)',
    bgGradient: 'rgba(139, 92, 246, 0.1)',
    icon: <MenuBook />,
    features: ['Academic Structure', 'Classes & Sections', 'Subjects', 'Timetable', 'Examinations', 'Grade System'],
  },
  {
    id: 'student-life',
    num: '03',
    title: 'Student Life',
    desc: 'Everything students need beyond the classroom.',
    color: '#06B6D4', // Cyan
    glow: 'rgba(6, 182, 212, 0.4)',
    bgGradient: 'rgba(6, 182, 212, 0.1)',
    icon: <DirectionsBus />,
    features: ['Attendance', 'Leave Management', 'Library', 'Transport', 'Events & Clubs', 'Communication'],
  },
  {
    id: 'finance',
    num: '04',
    title: 'Finance',
    desc: 'Automate collections, payments, accounting and reporting.',
    color: '#EC4899', // Pink
    glow: 'rgba(236, 72, 153, 0.4)',
    bgGradient: 'rgba(236, 72, 153, 0.1)',
    icon: <AccountBalanceWallet />,
    features: ['Fee Management', 'Payment Collection', 'Invoicing & Receipts', 'Accounting', 'Budget & Expenses'],
  },
  {
    id: 'hr',
    num: '05',
    title: 'HR & Operations',
    desc: 'Streamline people, resources and day-to-day operations.',
    color: '#6366F1', // Indigo
    glow: 'rgba(99, 102, 241, 0.4)',
    bgGradient: 'rgba(99, 102, 241, 0.1)',
    icon: <Badge />,
    features: ['Employee Records', 'Payroll', 'Recruitment', 'Appraisals', 'Hostel', 'Procurement', 'Asset Management'],
  },
  {
    id: 'analytics',
    num: '06',
    title: 'Analytics',
    desc: 'Turn school data into clear, actionable decisions.',
    color: '#14B8A6', // Teal
    glow: 'rgba(20, 184, 166, 0.4)',
    bgGradient: 'rgba(20, 184, 166, 0.1)',
    icon: <Insights />,
    features: ['Admin Dashboard', 'Attendance Analytics', 'Performance Reports', 'Fee Analytics', 'Operational Insights'],
  }
];

const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const animation = initHeroAnimation('.lp-hero');
    const cleanupFloating = initFloatingAnimation('.lp-hero-video-wrapper');

    return () => {
      animation.kill();
      cleanupFloating();
    };
  }, []);

  return (
    <section className="lp-hero" aria-label="Hero">
      <div className="lp-hero-bg" />
      <div className="lp-hero-grid" />
      <div className="lp-hero-inner">
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <div className="lp-hero-badge-dot" />
            Multi-Tenant · Cloud-Based · SaaS ERP
          </div>
          <h1 className="lp-hero-heading">
            The Smarter Way to{' '}
            <span className="lp-gradient-text">Manage Your School.</span>
          </h1>
          <p className="lp-hero-subtext">
            A complete cloud-based School ERP platform that connects administrators, teachers, students, parents, and staff — all in one secure and intelligent system.
          </p>
          <div className="lp-hero-actions">
            <button
              id="hero-demo-btn"
              className="lp-btn lp-btn-white lp-btn-lg"
              onClick={() => navigate('/register-school')}
            >
              Start Your School →
            </button>
            <button
              id="hero-explore-btn"
              className="lp-btn lp-btn-outline-white lp-btn-lg"
              onClick={() => scrollTo('features')}
            >
              Explore Features
            </button>
          </div>
          <div className="lp-hero-trust">
            <span className="lp-hero-trust-icon">✓</span>
            Built for modern educational institutions
            <span style={{ margin: '0 8px', opacity: .3 }}>·</span>
            <span className="lp-hero-trust-icon">✓</span>
            Role-Based Access Control
            <span style={{ margin: '0 8px', opacity: .3 }}>·</span>
            <span className="lp-hero-trust-icon">✓</span>
            Tenant Isolated
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-hero-video-wrapper">
            <video
              className="lp-hero-video"
              src={cartoonVideo}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>

          <div className="lp-floating-card lp-fc-top-left">
            <div className="lp-fc-title">School Connected</div>
            <div className="lp-fc-value"><span className="lp-fc-icon">✓</span> All Systems Live</div>
          </div>

          <div className="lp-floating-card lp-fc-bottom-right">
            <div className="lp-fc-title">Attendance</div>
            <div className="lp-fc-value">98.4% <span style={{ fontSize: '1.2rem', color: '#10B981', marginLeft: 4 }}>📈</span></div>
          </div>

          <div className="lp-floating-card lp-fc-top-right">
            <div className="lp-fc-title">LIVE SCHOOL OVERVIEW</div>
            <div className="lp-fc-value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, fontSize: '0.8rem', marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>Students</span> <span style={{ color: '#10B981' }}>Live</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>Attendance</span> <span style={{ color: '#10B981' }}>Live</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>Academics</span> <span style={{ color: '#10B981' }}>Live</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>Communication</span> <span style={{ color: '#10B981' }}>Live</span></div>
            </div>
          </div>

          <div className="lp-floating-card lp-fc-bottom-left">
            <div className="lp-fc-title">Students</div>
            <div className="lp-fc-value">2,480 <span style={{ fontSize: '.7rem', color: '#10B981', fontWeight: 600 }}>↑ Updated</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};


/* ── THE SCHOOL ERP UNIVERSE (LIGHT MODE ECOSYSTEM PHASE 69) ─────────────────────────────── */
const ecosystemLeftCards = [
  { id: 'teachers', icon: '👩‍🏫', title: 'Teachers', desc: 'Empower teaching, track performance & manage classes', color: '#10B981' },
  { id: 'academics', icon: '📚', title: 'Academics', desc: 'Curriculum, classes, subjects, exams & academic reports', color: '#3B82F6' },
  { id: 'timetable', icon: '📅', title: 'Timetable', desc: 'Create smart timetables & manage class schedules', color: '#8B5CF6' },
  { id: 'library', icon: '📖', title: 'Library', desc: 'Manage books, members, issue/return & stock', color: '#F59E0B' },
  { id: 'admin', icon: '⚙️', title: 'Administration', desc: 'Manage staff, roles, settings & school configuration', color: '#6366F1' },
];

const ecosystemRightCards = [
  { id: 'parents', icon: '👨‍👩‍👧', title: 'Parents', desc: 'Stay informed, connected & involved in your child\'s journey', color: '#F59E0B' },
  { id: 'fees', icon: '💳', title: 'Fees', desc: 'Fee structures, payments, invoices & financial reports', color: '#EC4899' },
  { id: 'reports', icon: '📊', title: 'Reports & Analytics', desc: 'Real-time insights for better decisions & growth', color: '#10B981' },
  { id: 'communication', icon: '📢', title: 'Communication', desc: 'Announcements, messages & notifications in one place', color: '#3B82F6' },
  { id: 'students', icon: '👨‍🎓', title: 'Students', desc: 'Manage admissions, profiles, attendance & performance', color: '#8B5CF6' },
];

const EcosystemSection: React.FC = () => {
  useEffect(() => {
    const anim = initEcosystemAnimation('#ecosystem');
    return () => {
      if (anim && anim.kill) anim.kill();
    };
  }, []);

  return (
    <section className="lp-eco-light-section" id="ecosystem">
      <div className="lp-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="lp-section-head" style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="lp-section-label">ONE CONNECTED SCHOOL ECOSYSTEM</span>
          <h2 className="lp-heading-lg">Everything Your School Needs.<br/>Connected in One Intelligent Platform.</h2>
          <p className="lp-body-lg" style={{ maxWidth: 800, margin: '0 auto' }}>
            From admissions and academics to attendance, communication, fees and administration, manage your entire institution through one secure and scalable SaaS platform.
          </p>
        </div>

        <div className="lp-eco-grid">
          {/* SVG Connection Lines Background */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="lp-eco-connections" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            <g stroke="rgba(99, 102, 241, 0.4)" strokeWidth="0.5" fill="none" strokeDasharray="1 3" strokeLinecap="round">
              {/* Left Lines */}
              <path className="lp-eco-path" d="M 50 50 Q 25 15 0 15" />
              <path className="lp-eco-path" d="M 50 50 Q 25 35 0 35" />
              <path className="lp-eco-path" d="M 50 50 L 0 50" />
              <path className="lp-eco-path" d="M 50 50 Q 25 65 0 65" />
              <path className="lp-eco-path" d="M 50 50 Q 25 85 0 85" />
              
              {/* Right Lines */}
              <path className="lp-eco-path" d="M 50 50 Q 75 15 100 15" />
              <path className="lp-eco-path" d="M 50 50 Q 75 35 100 35" />
              <path className="lp-eco-path" d="M 50 50 L 100 50" />
              <path className="lp-eco-path" d="M 50 50 Q 75 65 100 65" />
              <path className="lp-eco-path" d="M 50 50 Q 75 85 100 85" />
            </g>
          </svg>

          {/* Left Column */}
          <div className="lp-eco-col" style={{ alignItems: 'flex-end', zIndex: 2 }}>
            {ecosystemLeftCards.map(card => (
              <div key={card.id} className="lp-eco-light-card lp-eco-node" style={{ '--ec-color': card.color } as any}>
                <div className="lp-eco-card-content" style={{ textAlign: 'right' }}>
                  <h4 className="lp-eco-card-title">{card.title}</h4>
                  <p className="lp-eco-card-desc">{card.desc}</p>
                </div>
                <div className="lp-eco-card-icon-wrap" style={{ background: `${card.color}15`, color: card.color }}>
                  <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Center Core */}
          <div className="lp-eco-light-core lp-eco-core" style={{ zIndex: 3 }}>
            <div className="lp-eco-core-icon">
              <span style={{ fontSize: '2rem' }}>🎓</span>
            </div>
            <div className="lp-eco-core-title">School ERP</div>
            <div className="lp-eco-core-subtitle">ONE CORE. ALL CONNECTED.</div>
            <div className="lp-eco-core-stats">
              <div><span style={{ fontSize: '1rem', color: '#6366F1' }}>🛡️</span> Secure</div>
              <div><span style={{ fontSize: '1rem', color: '#6366F1' }}>⚡</span> Smart</div>
              <div><span style={{ fontSize: '1rem', color: '#6366F1' }}>📦</span> Scalable</div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lp-eco-col" style={{ alignItems: 'flex-start', zIndex: 2 }}>
            {ecosystemRightCards.map(card => (
              <div key={card.id} className="lp-eco-light-card lp-eco-node" style={{ '--ec-color': card.color } as any}>
                <div className="lp-eco-card-icon-wrap" style={{ background: `${card.color}15`, color: card.color }}>
                  <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
                </div>
                <div className="lp-eco-card-content">
                  <h4 className="lp-eco-card-title">{card.title}</h4>
                  <p className="lp-eco-card-desc">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Modules Showcase ───────────────────────────────── */
const ModulesSection: React.FC = () => {
  useEffect(() => {
    const anim = initModulesAnimation('#modules');
    return () => {
      if (anim && anim.kill) anim.kill();
    };
  }, []);

  return (
    <section className="lp-universe-section" id="modules">
      <div className="lp-universe-bg" />
      <div className="lp-universe-grid" />
      
      <div className="lp-universe-container">
        <div className="lp-modules-heading">
          <span className="lp-section-label" style={{ color: 'var(--lp-primary-light)' }}>MODULE SHOWCASE</span>
          <h2 className="lp-heading-xl" style={{ color: '#fff' }}>Power Every Part of <span className="lp-gradient-text">Your Institution</span></h2>
        </div>
        <p className="lp-modules-subtitle">
          An expansive suite of integrated modules covering every aspect of school operations.
        </p>

        <div className="lp-module-grid">
          {moduleData.map((mod) => (
            <div 
              key={mod.id} 
              className="lp-module-card"
              style={{ 
                '--mc-color': mod.color, 
                '--mc-glow': mod.glow,
                '--mc-bg-gradient': mod.bgGradient 
              } as any}
            >
              <div className="lp-module-card-left">
                <div className="lp-module-header-row">
                  <div className="lp-module-icon-wrap">{mod.icon}</div>
                  <div className="lp-module-number">{mod.num}</div>
                </div>
                
                <h3 className="lp-module-title">{mod.title}</h3>
                
                <ul className="lp-module-feature-list">
                  {mod.features.map(f => (
                    <li key={f} className="lp-module-feature-item">{f}</li>
                  ))}
                </ul>

                <button className="lp-module-explore-btn" onClick={() => {
                  const evt = new CustomEvent('open-site-tour');
                  window.dispatchEvent(evt);
                }}>
                  Watch Site Tour &rarr;
                </button>
              </div>
              
              <div className="lp-module-card-right">
                <img src={`/src/assets/${mod.id.replace('-', '_')}_3d.png`} alt={mod.title} className="lp-module-card-img" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-eco-bar">
        <div className="lp-eco-bar-inner">
          <div className="lp-eco-bar-title">ONE PLATFORM. EVERYTHING CONNECTED.</div>
          <div className="lp-eco-bar-items">
            {[
              { label: 'Secure & Reliable', icon: '🔐' },
              { label: 'Cloud Powered', icon: '☁️' },
              { label: 'Automated Workflow', icon: '⚡' },
              { label: 'Real-time Insights', icon: '📊' },
              { label: 'Access Anywhere', icon: '📱' },
            ].map(item => (
              <div key={item.label} className="lp-eco-bar-item">
                <span className="lp-eco-bar-icon">{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

/* ── Role-Based Section ─────────────────────────────── */
const RolesSection: React.FC = () => {
  const [activeRole, setActiveRole] = useState(0);

  const roles = [
    {
      label: 'Admin',
      emoji: '🏛️',
      title: 'Complete Institution Control',
      desc: 'Administrators get a bird\'s-eye view of the entire institution. Manage students, staff, finance, and configurations from one powerful dashboard.',
      features: [
        'Full student & staff directory management',
        'Fee collection oversight and financial reports',
        'Role-based access configuration',
        'Academic year and school configuration',
        'Real-time analytics and operational dashboards',
        'Communication broadcasting',
      ],
      cards: [
        { title: 'Total Students', value: '1,428' },
        { title: 'Attendance Rate', value: '94.2%' },
        { title: 'Monthly Revenue', value: '₹18.4L' },
        { title: 'Active Staff', value: '87' },
      ],
    },
    {
      label: 'Teacher',
      emoji: '👩‍🏫',
      title: 'Teaching & Academic Management',
      desc: 'Teachers access everything they need for effective teaching — attendance, marks, assignments, timetables, and student performance at their fingertips.',
      features: [
        'Mark attendance for assigned classes',
        'Enter and manage student marks',
        'View personal timetable and substitutions',
        'Manage class assignments and lesson plans',
        'Access student academic profiles',
        'Communicate with students and parents',
      ],
      cards: [
        { title: 'Classes Today', value: '5' },
        { title: 'Students Present', value: '38/40' },
        { title: 'Pending Marks', value: '3' },
        { title: 'Next Class', value: '10:30 AM' },
      ],
    },
    {
      label: 'Student',
      emoji: '🎓',
      title: 'Personal Academic Experience',
      desc: 'Students access their own academic information — attendance records, results, timetables, fee receipts, library status, and school announcements.',
      features: [
        'View personal attendance records',
        'Check exam results and report cards',
        'Access class timetable',
        'View fee payment history',
        'Library book status and reservations',
        'School announcements and notifications',
      ],
      cards: [
        { title: 'Attendance', value: '92%' },
        { title: 'Current Grade', value: 'A+' },
        { title: 'Pending Fees', value: '₹0' },
        { title: 'Books Issued', value: '2' },
      ],
    },
    {
      label: 'Parent',
      emoji: '👪',
      title: 'Child Progress & Communication',
      desc: 'Parents stay connected with their child\'s school life — view attendance, academic performance, fee status, and receive important school communications.',
      features: [
        "Monitor child's daily attendance",
        'View exam results and report cards',
        'Track fee payment status',
        'Receive school announcements',
        'View upcoming events and tests',
        'Access guardian-specific notifications',
      ],
      cards: [
        { title: "Child's Attendance", value: '96%' },
        { title: 'Last Result', value: 'A Grade' },
        { title: 'Fee Status', value: 'Paid' },
        { title: 'Notifications', value: '3 New' },
      ],
    },
    {
      label: 'Staff',
      emoji: '💼',
      title: 'Role-Specific Operations',
      desc: 'Non-teaching staff — HR, librarians, transport managers, accountants — each get a tailored view with exactly the tools and data relevant to their role.',
      features: [
        'HR: Employee records, leave, payroll',
        'Librarian: Book catalogue, circulation, fines',
        'Accountant: Fee collection, invoices, reports',
        'Transport: Fleet, routes, student assignments',
        'Inventory: Stock management, procurement',
        'Security: Visitor log, gate pass management',
      ],
      cards: [
        { title: 'Leave Requests', value: '4 Pending' },
        { title: 'Books Due', value: '12' },
        { title: 'Overdue Fees', value: '₹2.1L' },
        { title: 'Today\'s Visitors', value: '7' },
      ],
    },
  ];

  return (
    <section className="lp-section-alt" id="roles">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-section-label">Role-Based Experience</span>
          <h2 className="lp-heading-lg">One Platform. Every Role.</h2>
          <p className="lp-body-lg">
            Every user sees only the information and functionality relevant to their role.
            Permissions, dashboards, and data are all role-specific and securely isolated.
          </p>
        </div>

        <div className="lp-roles-tabs">
          {roles.map((role, i) => (
            <button
              key={role.label}
              id={`role-tab-${role.label.toLowerCase()}`}
              className={`lp-role-tab ${activeRole === i ? 'active' : ''}`}
              onClick={() => setActiveRole(i)}
            >
              <span className="lp-role-tab-emoji">{role.emoji}</span>
              {role.label}
            </button>
          ))}
        </div>

        {roles.map((role, i) => (
          <div key={role.label} className={`lp-role-panel ${activeRole === i ? 'active' : ''}`}>
            <div>
              <h3 className="lp-heading-md">{role.title}</h3>
              <p className="lp-body" style={{ marginBottom: 24 }}>{role.desc}</p>
              <ul className="lp-role-features">
                {role.features.map(f => (
                  <li key={f} className="lp-role-feature">
                    <div className="lp-role-check">✓</div>
                    <span className="lp-role-feature-text">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lp-role-dashboard-preview">
              <div className="lp-rdp-header">
                <div className="lp-rdp-dot" style={{ background: '#FF5F57' }} />
                <div className="lp-rdp-dot" style={{ background: '#FFBD2E', marginLeft: 4 }} />
                <div className="lp-rdp-dot" style={{ background: '#28C840', marginLeft: 4 }} />
                <span style={{ marginLeft: 8, fontSize: '.65rem', color: '#64748B' }}>
                  {role.label} Portal Dashboard
                </span>
              </div>
              <div className="lp-rdp-body">
                {role.cards.map(card => (
                  <div key={card.title} className="lp-rdp-card">
                    <div className="lp-rdp-card-title">{card.title}</div>
                    <div className="lp-rdp-card-value">{card.value}</div>
                  </div>
                ))}
                <div className="lp-rdp-card" style={{ gridColumn: '1 / -1', background: 'rgba(79,70,229,.1)', border: '1px solid rgba(79,70,229,.2)' }}>
                  <div className="lp-rdp-card-title">Quick Actions</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {role.features.slice(0, 3).map(f => (
                      <span key={f} style={{ background: 'rgba(79,70,229,.2)', color: '#818CF8', borderRadius: 6, padding: '3px 10px', fontSize: '.65rem', fontWeight: 600 }}>
                        {f.split(' ').slice(0, 3).join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Multi-Tenant Section ───────────────────────────── */
const MultiTenantSection: React.FC = () => {
  return (
    <section className="lp-section-dark" id="multi-tenant">
      <div className="lp-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <span className="lp-section-label" style={{ color: 'var(--lp-primary-light)' }}>SaaS Architecture</span>
            <h2 className="lp-heading-lg" style={{ color: '#fff' }}>Built for Multiple Institutions.</h2>
            <p className="lp-body-lg" style={{ color: 'var(--lp-dark-muted)', marginBottom: 32 }}>
              Manage multiple schools from one scalable cloud platform while keeping every institution's data, users, configurations, and permissions securely isolated.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: '🏢', title: 'Multi-Tenant Architecture', desc: 'Each institution gets its own isolated environment' },
                { icon: '🔒', title: 'Data Isolation', desc: 'No cross-tenant data access, ever' },
                { icon: '⚙️', title: 'Independent Config', desc: 'Each school configures its own structure' },
                { icon: '👤', title: 'User Management', desc: 'Separate user bases per institution' },
                { icon: '📊', title: 'Separate Analytics', desc: 'Each school sees only its own data' },
                { icon: '🚀', title: 'Scalable Infrastructure', desc: 'Grows with your institution portfolio' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 12, padding: '14px', background: 'var(--lp-dark-surface)', border: '1px solid var(--lp-dark-border)', borderRadius: 10 }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '.8125rem', marginBottom: 2 }}>{item.title}</div>
                    <div style={{ color: 'var(--lp-dark-muted)', fontSize: '.75rem' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-tenant-visual">
            <div className="lp-tenant-center">
              <div className="lp-tenant-center-title">🏫 SchoolERP SaaS Platform</div>
              <div className="lp-tenant-center-sub">Centralized Cloud Infrastructure</div>
            </div>
            <div style={{ width: 2, height: 40, background: 'rgba(148,163,184,.2)', margin: '0 auto' }} />
            <div className="lp-tenant-branches">
              {['School A', 'School B', 'School C'].map(school => (
                <div key={school} className="lp-tenant-branch">
                  <div className="lp-tenant-branch-line" />
                  <div className="lp-tenant-branch-box">
                    <div className="lp-tenant-branch-name">{school}</div>
                    <div className="lp-tenant-roles">
                      {['Admin', 'Teachers', 'Students', 'Parents'].map(role => (
                        <div key={role} className="lp-tenant-role">
                          <div className="lp-tenant-role-dot" />
                          {role}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '10px 20px', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, textAlign: 'center' }}>
              <span style={{ color: '#34D399', fontSize: '.8125rem', fontWeight: 600 }}>
                ✓ Every institution's data is completely isolated
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Security Section ───────────────────────────────── */
const SecuritySection: React.FC = () => {
  const items = [
    { icon: '🔐', title: 'Role-Based Access Control', desc: 'Fine-grained permissions ensure users only access what they\'re authorized to see.' },
    { icon: '🛡️', title: 'Secure Authentication', desc: 'JWT-based authentication with session management and token rotation.' },
    { icon: '🏢', title: 'Tenant Isolation', desc: 'Complete data separation between institutions at the database level.' },
    { icon: '✅', title: 'Permission Management', desc: 'Configurable permission sets per role with granular access controls.' },
    { icon: '🔗', title: 'Protected APIs', desc: 'All endpoints secured with authentication and authorization middleware.' },
    { icon: '📋', title: 'Data Validation', desc: 'Input validation and schema enforcement on both frontend and backend.' },
  ];

  return (
    <section className="lp-section-alt" id="security">
      <div className="lp-container">
        <div className="lp-security-grid">
          <div>
            <span className="lp-section-label">Security</span>
            <h2 className="lp-heading-lg">Security Built Into Every Layer.</h2>
            <p className="lp-body-lg" style={{ marginBottom: 32 }}>
              Enterprise-grade security practices protect your institution's data at every layer of the application stack.
            </p>
            <div className="lp-security-items">
              {items.map(item => (
                <div key={item.title} className="lp-security-item" style={{ background: '#fff', borderColor: 'var(--lp-border)' }}>
                  <div className="lp-security-item-icon" style={{ background: 'var(--lp-primary-xlight)' }}>{item.icon}</div>
                  <div>
                    <div className="lp-security-item-title" style={{ color: 'var(--lp-text)' }}>{item.title}</div>
                    <p className="lp-security-item-desc" style={{ color: 'var(--lp-text-secondary)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-security-shield">
            <div className="lp-security-shield-inner">
              <div className="lp-shield-ring lp-shield-ring-1" />
              <div className="lp-shield-ring lp-shield-ring-2" />
              <div className="lp-shield-ring lp-shield-ring-3" />
              <div className="lp-shield-center">🛡️</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── HOW IT WORKS STORY (PHASE 71) ─────────────────────────────── */
const HowItWorksSection: React.FC = () => {
  useEffect(() => {
    const anim = initWorkflowAnimation('#how-it-works-story');
    return () => { if (anim && anim.kill) anim.kill(); };
  }, []);

  return (
    <section className="lp-workflow-section" id="how-it-works-story">
      <div className="lp-workflow-container">
        <div className="lp-section-head" style={{ textAlign: 'center' }}>
          <span className="lp-section-label">SIMPLE TO START. POWERFUL TO SCALE.</span>
          <h2 className="lp-heading-lg" style={{ color: '#0F172A' }}>From School Setup<br/>to Everyday Management.</h2>
          <p className="lp-body-lg" style={{ maxWidth: 600, margin: '0 auto', color: '#475569' }}>
            Get your school connected in a simple, structured workflow. Configure your institution, onboard your users, and manage your daily operations from one intelligent platform.
          </p>
        </div>

        {/* The scrolling workflow experience */}
        <div className="lp-workflow-experience">
          <div className="lp-workflow-track-wrapper">
             <div className="lp-workflow-track">
               <div className="lp-workflow-line-bg" />
               <div className="lp-workflow-line-active" />
               
               {[
                 { n: '01', title: 'Start Your School', desc: 'Connect with our team and get your institution ready.' },
                 { n: '02', title: 'Set Up Your School', desc: 'Create your tenant and input basic school details.' },
                 { n: '03', title: 'Configure Your Institution', desc: 'Set up classes, subjects, and academic structures.' },
                 { n: '04', title: 'Connect Your People', desc: 'Every user gets the right access based on their role.' },
                 { n: '05', title: 'Run Your School', desc: 'Manage students, academics, attendance, and fees.' },
                 { n: '06', title: 'Understand Your School', desc: 'Get real-time insights to make better decisions.' }
               ].map((step, idx) => (
                 <div key={step.n} className={`lp-workflow-step lp-workflow-step-${idx+1}`}>
                   <div className="lp-workflow-node">{step.n}</div>
                   <div className="lp-workflow-title">{step.title}</div>
                   <div className="lp-workflow-desc">{step.desc}</div>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="lp-workflow-central-message" style={{ textAlign: 'center', margin: '60px 0', fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', height: '40px', position: 'relative' }}>
            <div className="lp-workflow-msg lp-msg-1" style={{ position: 'absolute', width: '100%' }}>Start Simple.</div>
            <div className="lp-workflow-msg lp-msg-2" style={{ position: 'absolute', width: '100%', opacity: 0 }}>Connect Everyone.</div>
            <div className="lp-workflow-msg lp-msg-3" style={{ position: 'absolute', width: '100%', opacity: 0 }}>Manage Everything.</div>
            <div className="lp-workflow-msg lp-msg-4" style={{ position: 'absolute', width: '100%', opacity: 0 }}>Make Smarter Decisions.</div>
          </div>

          <div className="lp-workflow-previews">
            {/* HTML/CSS UI Previews */}
            <div className="lp-workflow-preview-container">
               {/* Previews will be stacked absolutely, toggled via GSAP */}
               <div className="lp-preview-card lp-preview-1" style={{ position: 'absolute', width: '100%', maxWidth: '600px', left: '50%', transform: 'translateX(-50%)' }}>
                 <div className="lp-preview-header">👋 Ready to start?</div>
                 <div style={{ textAlign: 'center', marginTop: 40 }}>
                   <button className="lp-module-explore-btn" style={{ background: '#6366F1', border: 'none', padding: '12px 24px' }} onClick={() => document.getElementById('contact')?.scrollIntoView()}>Book a Demo</button>
                 </div>
               </div>
               
               <div className="lp-preview-card lp-preview-2" style={{ opacity: 0, position: 'absolute', width: '100%', maxWidth: '600px', left: '50%', transform: 'translateX(-50%)' }}>
                 <div className="lp-preview-header">🏫 School Profile</div>
                 <div className="lp-preview-row"><span className="lp-preview-label">School Name</span><span className="lp-preview-value">Global International</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">School Code</span><span className="lp-preview-value">GLB-2026</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Academic Year</span><span className="lp-preview-value">2026 - 2027</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Status</span><span className="lp-preview-value" style={{ color: '#10B981' }}>● ACTIVE</span></div>
               </div>

               <div className="lp-preview-card lp-preview-3" style={{ opacity: 0, position: 'absolute', width: '100%', maxWidth: '600px', left: '50%', transform: 'translateX(-50%)' }}>
                 <div className="lp-preview-header">⚙️ Configuration</div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Classes</span><span className="lp-preview-value">Nursery to Grade 12</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Sections</span><span className="lp-preview-value">A, B, C, D</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Departments</span><span className="lp-preview-value">Science, Arts, Commerce</span></div>
               </div>

               <div className="lp-preview-card lp-preview-4" style={{ opacity: 0, position: 'absolute', width: '100%', maxWidth: '600px', left: '50%', transform: 'translateX(-50%)' }}>
                 <div className="lp-preview-header">👥 Users</div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Admin</span><span className="lp-preview-value" style={{ color: '#10B981' }}>ACTIVE</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Teacher</span><span className="lp-preview-value" style={{ color: '#10B981' }}>ACTIVE</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Student</span><span className="lp-preview-value" style={{ color: '#10B981' }}>ACTIVE</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Parent</span><span className="lp-preview-value" style={{ color: '#10B981' }}>ACTIVE</span></div>
               </div>

               <div className="lp-preview-card lp-preview-5" style={{ opacity: 0, position: 'absolute', width: '100%', maxWidth: '600px', left: '50%', transform: 'translateX(-50%)' }}>
                 <div className="lp-preview-header">📅 Today's Attendance</div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Present</span><span className="lp-preview-value" style={{ color: '#10B981' }}>92%</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Absent</span><span className="lp-preview-value" style={{ color: '#EF4444' }}>5%</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Late</span><span className="lp-preview-value" style={{ color: '#F59E0B' }}>3%</span></div>
               </div>

               <div className="lp-preview-card lp-preview-6" style={{ opacity: 0, position: 'absolute', width: '100%', maxWidth: '600px', left: '50%', transform: 'translateX(-50%)' }}>
                 <div className="lp-preview-header">📊 School Overview</div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Total Students</span><span className="lp-preview-value">2,450</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Fee Collection</span><span className="lp-preview-value">85%</span></div>
                 <div className="lp-preview-row"><span className="lp-preview-label">Avg. Performance</span><span className="lp-preview-value">A-</span></div>
               </div>
            </div>
          </div>
        </div>

        <div className="lp-workflow-final-cta" style={{ textAlign: 'center', marginTop: 80, padding: 60, background: '#EEF2FF', borderRadius: 24, border: '1px solid #E0E7FF' }}>
          <h3 style={{ fontSize: '2rem', color: '#0F172A', marginBottom: 16 }}>Your School. One Connected Platform.</h3>
          <p style={{ color: '#475569', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>Bring administration, academics, communication and daily operations together with a modern School ERP.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button className="lp-btn lp-btn-primary" onClick={() => document.getElementById('contact')?.scrollIntoView()}>Book a Demo</button>
            <button className="lp-btn lp-btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView()}>Explore Platform</button>
          </div>
        </div>

      </div>
    </section>
  );
};

/* ── Benefits Section ───────────────────────────────── */
const BenefitsSection: React.FC = () => {
  const benefits = [
    { icon: '⏱️', title: 'Save Administrative Time', desc: 'Automate repetitive tasks like attendance, fee reminders, and report generation. Admins regain hours every day.' },
    { icon: '📉', title: 'Reduce Manual Work', desc: 'Replace paper forms, spreadsheets, and manual registers with digital workflows that are faster and error-free.' },
    { icon: '📁', title: 'Centralize Information', desc: 'All student, staff, financial, and academic data in one place — no more searching through scattered files.' },
    { icon: '🤝', title: 'Improve Parent Engagement', desc: 'Keep parents informed with real-time attendance, results, and announcements through the parent portal.' },
    { icon: '👁️', title: 'Improve Operational Visibility', desc: 'Dashboards and reports give management complete visibility into academic and operational performance.' },
    { icon: '📈', title: 'Make Better Decisions', desc: 'Data-driven insights on attendance, finance, and academics help leadership make informed, timely decisions.' },
    { icon: '🌐', title: 'Scale Easily', desc: 'Whether you manage one school or ten, the platform scales with your institution portfolio effortlessly.' },
  ];

  return (
    <section className="lp-section-alt" id="benefits">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-section-label">Why Choose Us</span>
          <h2 className="lp-heading-lg">Built to Make School Management Simpler.</h2>
          <p className="lp-body-lg">Purpose-built for educational institutions, not adapted from generic business software.</p>
        </div>

        <div className="lp-benefits-grid">
          {benefits.map(b => (
            <div key={b.title} className="lp-benefit-card">
              <span className="lp-benefit-icon">{b.icon}</span>
              <h3 className="lp-benefit-title">{b.title}</h3>
              <p className="lp-benefit-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Communication Section ──────────────────────────── */
const CommunicationSection: React.FC = () => {
  const commLevels = [
    { icon: '🏛️', label: 'Admin', bg: '#3730A3', badge: 'Broadcaster' },
    { icon: '👩‍🏫', label: 'Teachers', bg: '#4F46E5', badge: 'Class-Level' },
    { icon: '🎓', label: 'Students', bg: '#6366F1', badge: 'Receiver' },
    { icon: '👪', label: 'Parents', bg: '#818CF8', badge: 'Guardian View' },
    { icon: '💼', label: 'Staff', bg: '#A5B4FC', badge: 'Role-Specific' },
  ];

  return (
    <section className="lp-section-dark" id="communication">
      <div className="lp-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <span className="lp-section-label" style={{ color: 'var(--lp-primary-light)' }}>Communication</span>
            <h2 className="lp-heading-lg" style={{ color: '#fff' }}>Keep Everyone Connected.</h2>
            <p className="lp-body-lg" style={{ color: 'var(--lp-dark-muted)', marginBottom: 32 }}>
              A unified communication layer connects every stakeholder in your institution — from administration to parents — through structured, role-appropriate channels.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '📣', title: 'Announcements', desc: 'School-wide and class-specific broadcasts' },
                { icon: '🔔', title: 'Notifications', desc: 'Real-time alerts for attendance, fees, and results' },
                { icon: '📅', title: 'Events', desc: 'School calendar and event notifications' },
                { icon: '💬', title: 'Messages', desc: 'Teacher-parent and admin communications' },
              ].map(c => (
                <div key={c.title} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'var(--lp-dark-surface)', border: '1px solid var(--lp-dark-border)', borderRadius: 10 }}>
                  <span style={{ fontSize: '1.25rem' }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '.875rem', marginBottom: 2 }}>{c.title}</div>
                    <div style={{ color: 'var(--lp-dark-muted)', fontSize: '.8125rem' }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-comm-visual">
            {commLevels.map((level, i) => (
              <React.Fragment key={level.label}>
                <div className="lp-comm-row">
                  <div className="lp-comm-icon" style={{ background: `${level.bg}20` }}>
                    <span>{level.icon}</span>
                  </div>
                  <span className="lp-comm-label">{level.label}</span>
                  <span className="lp-comm-badge" style={{ background: `${level.bg}60` }}>{level.badge}</span>
                </div>
                {i < commLevels.length - 1 && (
                  <div className="lp-comm-connector">
                    <span className="lp-comm-arrow">↓</span>
                    <span style={{ fontSize: '.7rem' }}>reaches</span>
                    <span className="lp-comm-arrow">↓</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Pricing Section ────────────────────────────────── */
const PricingSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const plans = [
    {
      tier: 'Starter',
      title: 'Small Institution',
      desc: 'For small schools looking to digitize their core operations.',
      cta: 'Book a Demo',
      ctaStyle: 'lp-pricing-cta-outline',
      featured: false,
      features: [
        'Up to 500 students',
        'Core modules included',
        'Student & Staff management',
        'Basic attendance & fees',
        'Email support',
      ],
    },
    {
      tier: 'Professional',
      title: 'Growing School',
      desc: 'For growing institutions that need a comprehensive ERP solution.',
      cta: 'Book a Demo',
      ctaStyle: 'lp-pricing-cta-white',
      featured: true,
      features: [
        'Up to 3,000 students',
        'All modules included',
        'Advanced analytics & reports',
        'Parent portal & app',
        'Priority support',
        'Custom configuration',
      ],
    },
    {
      tier: 'Enterprise',
      title: 'Large Institution',
      desc: 'For large institutions and educational groups with complex requirements.',
      cta: 'Contact Sales',
      ctaStyle: 'lp-pricing-cta-outline',
      featured: false,
      features: [
        'Unlimited students',
        'All modules + custom modules',
        'Multi-campus management',
        'API access & integrations',
        'Dedicated account manager',
        'SLA & uptime guarantee',
      ],
    },
  ];

  return (
    <section className="lp-section" id="pricing">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-section-label">Pricing</span>
          <h2 className="lp-heading-lg">Simple, Transparent Plans.</h2>
          <p className="lp-body-lg">
            Every school is different. Book a demo and our team will help identify the right plan for your institution's size and needs.
          </p>
        </div>

        <div className="lp-pricing-grid">
          {plans.map(plan => (
            <div key={plan.tier} className={`lp-pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <div className="lp-pricing-popular">Most Popular</div>}
              <div className="lp-pricing-tier">{plan.tier}</div>
              <h3 className="lp-pricing-title">{plan.title}</h3>
              <p className="lp-pricing-desc">{plan.desc}</p>
              <button
                className={`lp-pricing-cta ${plan.ctaStyle}`}
                onClick={() => scrollTo('contact')}
                id={`pricing-cta-${plan.tier.toLowerCase()}`}
              >
                {plan.cta}
              </button>
              <ul className="lp-pricing-features">
                {plan.features.map(f => (
                  <li key={f} className="lp-pricing-feature">
                    <span className="lp-pricing-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--lp-text-muted)', fontSize: '.875rem' }}>
          All plans include onboarding support · No setup fees · Cancel anytime
        </p>
      </div>
    </section>
  );
};

/* ── FAQ Section ────────────────────────────────────── */
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is a School ERP?',
      a: 'A School ERP (Enterprise Resource Planning) is a centralized software system that integrates and manages all aspects of a school\'s operations — including student management, academics, attendance, fees, staff, library, transport, and communication — into one connected platform.',
    },
    {
      q: 'Can multiple schools use the platform?',
      a: 'Yes. This is a multi-tenant SaaS platform specifically built to serve multiple institutions. Each school has its own fully isolated environment with independent data, users, configurations, and permissions.',
    },
    {
      q: "Is each school's data isolated from other schools?",
      a: "Absolutely. Tenant isolation is enforced at every layer — database, API, and authentication. No school can access another institution's data under any circumstances.",
    },
    {
      q: 'Which roles are supported?',
      a: 'The platform supports multiple roles including Super Admin, Admin, Principal, Teacher, Class Teacher, Student, Parent, HR, Accountant, Librarian, Transport Manager, and more. Each role has its own tailored dashboard and permission set.',
    },
    {
      q: 'Can schools customize their configuration?',
      a: 'Yes. Each institution can configure its own academic structure, classes, sections, departments, designations, fee structures, timetable, notification settings, and role permissions independently.',
    },
    {
      q: 'Is the ERP cloud-based?',
      a: 'Yes. The platform is fully cloud-based, allowing authorized users to securely access their institution\'s ERP from any device with an internet connection — desktop, tablet, or mobile.',
    },
    {
      q: 'How are user accounts created?',
      a: 'There is no public self-registration. All user accounts are provisioned by school administrators. Students, parents, teachers, and staff accounts are created by the admin either individually or through the onboarding workflows.',
    },
    {
      q: 'Is mobile access supported?',
      a: 'Yes. The platform is fully responsive and designed to work across desktops, laptops, tablets, and mobile devices. A mobile-optimized experience is available for all major portals.',
    },
    {
      q: 'How does school onboarding work?',
      a: 'After selecting a plan, our team works with you to configure your institution\'s structure — branches, academic years, classes, subjects, roles, and initial user accounts. The onboarding process is guided and supported.',
    },
    {
      q: 'Can existing school data be migrated?',
      a: 'Data migration capabilities are available for enterprise plans. Please contact our team to discuss your specific data migration requirements and we will evaluate the best approach for your institution.',
    },
  ];

  return (
    <section className="lp-section-alt" id="faq">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-section-label">FAQ</span>
          <h2 className="lp-heading-lg">Frequently Asked Questions</h2>
          <p className="lp-body-lg">Everything you need to know about the School ERP platform.</p>
        </div>

        <div className="lp-faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`lp-faq-item ${openIndex === i ? 'open' : ''}`} id={`faq-item-${i}`}>
              <div
                className="lp-faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setOpenIndex(openIndex === i ? null : i)}
              >
                {faq.q}
                <div className="lp-faq-toggle">+</div>
              </div>
              <div className="lp-faq-answer">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Contact / Demo Section ─────────────────────────── */
const ContactSection: React.FC = () => {
  const [form, setForm] = useState({ name: '', institution: '', email: '', phone: '', role: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call an API
    setSubmitted(true);
  };

  return (
    <section className="lp-section" id="contact">
      <div className="lp-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <span className="lp-section-label">Get Started</span>
            <h2 className="lp-heading-lg">Book a Demo</h2>
            <p className="lp-body-lg" style={{ marginBottom: 32 }}>
              See the platform in action with a personalized demo tailored to your institution's requirements. Our team will walk you through every module.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '✅', title: 'Personalized Demo', desc: 'Tailored to your institution type and size' },
                { icon: '⏱️', title: '30-45 Minutes', desc: 'A focused session covering key modules' },
                { icon: '💬', title: 'Q&A Session', desc: 'Get all your questions answered by our team' },
                { icon: '📋', title: 'Custom Quote', desc: 'Receive a plan recommendation and pricing' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem', marginTop: 2 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--lp-text)', fontSize: '.9375rem', marginBottom: 2 }}>{item.title}</div>
                    <div style={{ color: 'var(--lp-text-secondary)', fontSize: '.875rem' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {submitted ? (
              <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h3 style={{ fontWeight: 800, color: '#065F46', margin: '0 0 8px' }}>Demo Request Submitted!</h3>
                <p style={{ color: '#047857', fontSize: '.9375rem' }}>
                  Thank you! Our team will contact you within 1 business day to schedule your demo.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ background: '#fff', border: '1px solid var(--lp-border)', borderRadius: 16, padding: 36, boxShadow: 'var(--lp-shadow-md)' }}
                id="demo-form"
              >
                <h3 style={{ fontWeight: 800, margin: '0 0 24px', fontSize: '1.125rem' }}>Book Your Demo</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { id: 'demo-name', label: 'Your Name', key: 'name', type: 'text', placeholder: 'Full name', required: true },
                    { id: 'demo-institution', label: 'Institution Name', key: 'institution', type: 'text', placeholder: 'School / College name', required: true },
                    { id: 'demo-email', label: 'Work Email', key: 'email', type: 'email', placeholder: 'you@school.edu', required: true },
                    { id: 'demo-phone', label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 XXXXXXXXXX', required: false },
                  ].map(field => (
                    <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label htmlFor={field.id} style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--lp-text)' }}>
                        {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                      </label>
                      <input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={(form as any)[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid var(--lp-border)',
                          borderRadius: 8,
                          fontSize: '.875rem',
                          outline: 'none',
                          fontFamily: 'var(--lp-font)',
                          transition: 'border-color .15s',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'var(--lp-primary)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--lp-border)')}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="demo-role" style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--lp-text)' }}>Your Role</label>
                    <select
                      id="demo-role"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      style={{ padding: '10px 12px', border: '1px solid var(--lp-border)', borderRadius: 8, fontSize: '.875rem', fontFamily: 'var(--lp-font)', background: '#fff' }}
                    >
                      <option value="">Select your role</option>
                      <option>School Owner / Trustee</option>
                      <option>Principal</option>
                      <option>IT Administrator</option>
                      <option>Admin Staff</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="demo-message" style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--lp-text)' }}>Tell us about your institution</label>
                    <textarea
                      id="demo-message"
                      placeholder="Number of students, key challenges, specific modules you're interested in..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      rows={3}
                      style={{ padding: '10px 12px', border: '1px solid var(--lp-border)', borderRadius: 8, fontSize: '.875rem', fontFamily: 'var(--lp-font)', resize: 'vertical' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--lp-primary)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--lp-border)')}
                    />
                  </div>
                </div>
                <button type="button" className="lp-btn lp-btn-primary" id="demo-submit-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '14px' }} onClick={() => navigate('/register-school')}>
                  Start Your School Today
                </button>
                <p style={{ textAlign: 'center', color: 'var(--lp-text-muted)', fontSize: '.78rem', marginTop: 12 }}>
                  No commitment required. Our team will reach out within 24 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Final CTA ──────────────────────────────────────── */
const FinalCTA: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="lp-cta" id="cta">
      <div className="lp-cta-bg" />
      <div className="lp-cta-inner">
        <h2 className="lp-cta-title">
          Ready to Transform the Way Your School Operates?
        </h2>
        <p className="lp-cta-desc">
          Bring administration, academics, communication, and operations together with one powerful School ERP platform.
        </p>
        <div className="lp-cta-buttons">
          <button id="cta-demo-btn" className="lp-btn lp-btn-white lp-btn-lg" onClick={() => scrollTo('contact')}>
            Book a Demo →
          </button>
          <button id="cta-talk-btn" className="lp-btn lp-btn-outline-white lp-btn-lg" onClick={() => scrollTo('contact')}>
            Talk to Our Team
          </button>
        </div>
      </div>
    </section>
  );
};

/* ── Footer ─────────────────────────────────────────── */
const Footer: React.FC = () => {
  const navigate = useNavigate();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="lp-footer">
      <div className="lp-footer-grid">
        <div>
          <div className="lp-logo">
            <div className="lp-logo-icon" style={{ width: 32, height: 32, borderRadius: 8, fontSize: '.8rem' }}>ERP</div>
            <div className="lp-footer-brand-name">SchoolERP</div>
          </div>
          <p className="lp-footer-brand-desc">
            A modern, cloud-based School ERP platform for managing educational institutions of all sizes. Multi-tenant, role-based, and securely isolated.
          </p>
          <div className="lp-footer-social">
            {['𝕏', 'in', 'gh', 'yt'].map(s => (
              <a key={s} href="#" className="lp-footer-social-link" aria-label={s}>{s}</a>
            ))}
          </div>
        </div>

        <div>
          <div className="lp-footer-col-title">Product</div>
          <ul className="lp-footer-links">
            <li><a href="#features" onClick={e => { e.preventDefault(); scrollTo('features'); }}>Features</a></li>
            <li><a href="#modules" onClick={e => { e.preventDefault(); scrollTo('modules'); }}>Modules</a></li>
            <li><a href="#pricing" onClick={e => { e.preventDefault(); scrollTo('pricing'); }}>Pricing</a></li>
            <li><a href="#security" onClick={e => { e.preventDefault(); scrollTo('security'); }}>Security</a></li>
            <li><a href="#roles" onClick={e => { e.preventDefault(); scrollTo('roles'); }}>Role-Based Access</a></li>
          </ul>
        </div>

        <div>
          <div className="lp-footer-col-title">Solutions</div>
          <ul className="lp-footer-links">
            <li><a href="#multi-tenant" onClick={e => { e.preventDefault(); scrollTo('multi-tenant'); }}>Schools</a></li>
            <li><a href="#multi-tenant" onClick={e => { e.preventDefault(); scrollTo('multi-tenant'); }}>Colleges</a></li>
            <li><a href="#multi-tenant" onClick={e => { e.preventDefault(); scrollTo('multi-tenant'); }}>Educational Groups</a></li>
            <li><a href="#how-it-works" onClick={e => { e.preventDefault(); scrollTo('how-it-works'); }}>How It Works</a></li>
          </ul>
        </div>

        <div>
          <div className="lp-footer-col-title">Company</div>
          <ul className="lp-footer-links">
            <li><a href="#faq" onClick={e => { e.preventDefault(); scrollTo('faq'); }}>About</a></li>
            <li><a href="#contact" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>Contact</a></li>
            <li><a href="#contact" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>Careers</a></li>
          </ul>
        </div>

        <div>
          <div className="lp-footer-col-title">Access</div>
          <ul className="lp-footer-links">
            <li><a href="#" onClick={e => { e.preventDefault(); navigate('/login'); }}>Login to ERP</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>Book a Demo</a></li>
            <li><a href="#faq" onClick={e => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="lp-footer-bottom">
        <div className="lp-footer-copy">
          © {new Date().getFullYear()} SchoolERP. All rights reserved.
        </div>
        <div className="lp-footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security</a>
        </div>
      </div>
    </footer>
  );
};

/* ── Landing Page Root ──────────────────────────────── */
const LandingPage: React.FC = () => {
  const [tourOpen, setTourOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleOpen = () => setTourOpen(true);
    window.addEventListener('open-site-tour', handleOpen);
    return () => window.removeEventListener('open-site-tour', handleOpen);
  }, []);

  useEffect(() => {
    if (tourOpen && modalRef.current) {
      import('gsap').then(({ gsap }) => {
        gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
      });
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [tourOpen]);

  const closeTour = () => {
    if (modalRef.current) {
      import('gsap').then(({ gsap }) => {
        gsap.to(modalRef.current, { opacity: 0, scale: 0.95, duration: 0.3, ease: 'power3.in', onComplete: () => {
          if (videoRef.current) videoRef.current.pause();
          setTourOpen(false);
        }});
      });
    } else {
      setTourOpen(false);
    }
  };

  return (
    <SiteTourContext.Provider value={{ openTour: () => setTourOpen(true) }}>
      <div className="lp-root">
        <Navbar />
        <main>
          <HeroSection />
          <EcosystemSection />
          <ModulesSection />
          <RolesSection />
          <MultiTenantSection />
          <SecuritySection />
          <HowItWorksSection />
          <BenefitsSection />
          <CommunicationSection />
          <PricingSection />
          <FAQSection />
          <ContactSection />
          <FinalCTA />
        </main>
        <Footer />
        
        {tourOpen && (
          <div className="lp-modal-overlay" onClick={closeTour}>
            <div className="lp-modal-content" ref={modalRef} onClick={e => e.stopPropagation()}>
              <button className="lp-modal-close" onClick={closeTour}>✕</button>
              <video 
                ref={videoRef}
                src={cartoonVideo} 
                controls 
                autoPlay 
                style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
              />
            </div>
          </div>
        )}
      </div>
    </SiteTourContext.Provider>
  );
};

export default LandingPage;
