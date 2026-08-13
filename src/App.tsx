import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import Learn from './pages/Learn';
import Roster from './pages/Roster';
import HeroDetail from './pages/HeroDetail';
import PerformanceLog from './pages/PerformanceLog';
import Reading from './pages/Reading';
import './App.styles.css';

const TABS = [
  { to: '/', label: 'Learn', icon: LearnIcon },
  { to: '/roster', label: 'Roster', icon: RosterIcon },
  { to: '/log', label: 'Log', icon: LogIcon },
  { to: '/reading', label: 'Reading', icon: ReadingIcon },
];

function LearnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16v12H7l-3 3V4z" />
    </svg>
  );
}
function RosterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="6" height="7" />
      <rect x="14" y="4" width="6" height="7" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </svg>
  );
}
function LogIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 8v5l3 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function ReadingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z" />
      <path d="M4 20.5V5.5" />
    </svg>
  );
}

export default function App() {
  return (
    <HashRouter>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Learn />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/hero/:slug" element={<HeroDetail />} />
          <Route path="/log" element={<PerformanceLog />} />
          <Route path="/reading" element={<Reading />} />
        </Routes>
      </main>
      <nav className="bottom-nav">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </HashRouter>
  );
}
