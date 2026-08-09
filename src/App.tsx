import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import TipsLibrary from './pages/TipsLibrary';
import MasteryOverview from './pages/MasteryOverview';
import PerformanceLog from './pages/PerformanceLog';
import Reading from './pages/Reading';
import './App.styles.css';

const TABS = [
  { to: '/', label: 'Tips', icon: TipsIcon },
  { to: '/mastery', label: 'Mastery', icon: MasteryIcon },
  { to: '/log', label: 'Log', icon: LogIcon },
  { to: '/reading', label: 'Reading', icon: ReadingIcon },
];

function TipsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v12H7l-3 3V4z" strokeLinejoin="round" />
    </svg>
  );
}
function MasteryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V10M11 20V4M18 20v-7" strokeLinecap="round" />
    </svg>
  );
}
function LogIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function ReadingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z" strokeLinejoin="round" />
      <path d="M4 20.5V5.5" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  return (
    <HashRouter>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<TipsLibrary />} />
          <Route path="/mastery" element={<MasteryOverview />} />
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
