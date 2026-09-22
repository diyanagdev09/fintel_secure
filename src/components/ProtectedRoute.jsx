import {
  Navigate,
} from 'react-router-dom';

import {
  LoaderCircle,
} from 'lucide-react';

import {
  useAuth,
} from '../context/AuthContext.jsx';

export default function ProtectedRoute({
  children,
}) {
  const {
    currentUser,
    authReady,
  } = useAuth();

  if (!authReady) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-box">
          <LoaderCircle
            size={18}
            className="login-spinner"
          />

          <div>
            <strong>
              Restoring workspace
            </strong>

            <span>
              Checking your Fintel Secure session…
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}