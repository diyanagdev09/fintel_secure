import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Database,
  FileClock,
  Filter,
  History,
  Home,
  Landmark,
  LogOut,
  Menu,
  Shield,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import logo from '../logo.png';

const workspace = [
  ['/dashboard', 'Dashboard', Home],
  ['/upload', 'Data Upload', Database],
  ['/processing', 'Processing', Activity],
  ['/visualization', 'Insights', BarChart3],
  ['/history', 'Transaction History', History],
  ['/security', 'Security', Shield],
  ['/cases', 'Cases', FileClock],
  ['/rules', 'Rules Lab', SlidersHorizontal],
];

const markets = [
  ['/market', 'Market', Landmark],
  ['/stocks', 'Stocks', BarChart3],
  ['/ipos', 'IPOs', BriefcaseBusiness],
  ['/screener', 'Screener', Filter],
  ['/portfolio', 'Paper Portfolio', BriefcaseBusiness],
];

export default function Sidebar({ collapsed, onToggle }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [confirm, setConfirm] = useState(false);

  const active = (path) =>
    loc.pathname === path || loc.pathname.startsWith(`${path}/`);

  const signOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  const workspaceItems =
    currentUser?.role === 'admin'
      ? workspace.filter(([path]) => ['/dashboard', '/cases'].includes(path))
      : workspace;

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand-row">
          <button
            type="button"
            className="sidebar-brand"
            onClick={() => navigate('/dashboard')}
            title="Open dashboard"
          >
            <img
              src={logo}
              className="sidebar-logo"
              alt="Fintel Secure"
            />

            <span className="sidebar-brand-text">
              <span className="sidebar-brand-name">
                Fintel <strong>Secure</strong>
              </span>
              <span className="sidebar-brand-sub">
                Finance Intelligence
              </span>
            </span>
          </button>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu size={16} /> : <span>‹</span>}
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-group">
            <p className="sidebar-group-title">Workspace</p>

            {workspaceItems.map(([path, label, Icon]) => (
              <Link
                key={path}
                to={path}
                className={`sidebar-link ${active(path) ? 'active' : ''}`}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="sidebar-group">
            <p className="sidebar-group-title">Markets</p>

            {markets.map(([path, label, Icon]) => (
              <Link
                key={path}
                to={path}
                className={`sidebar-link ${active(path) ? 'active' : ''}`}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="sidebar-group">
            <p className="sidebar-group-title">Help</p>

            <Link
              to="/learn"
              className={`sidebar-link ${active('/learn') ? 'active' : ''}`}
            >
              <BookOpen size={16} strokeWidth={1.8} />
              <span>Learn</span>
            </Link>
          </div>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-signout"
            onClick={() => setConfirm(true)}
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {confirm && (
        <div
          className="modal-layer"
          onMouseDown={() => setConfirm(false)}
        >
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="page-kicker">ACCOUNT</p>
                <h2>Sign out?</h2>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() => setConfirm(false)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                You will return to the Fintel Secure landing page. Your
                server-side account data will remain stored.
              </p>
            </div>

            <div className="modal-foot">
              <button
                type="button"
                className="btn"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={signOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
