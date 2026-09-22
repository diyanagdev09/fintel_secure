import {
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowRight,
  ShieldCheck,
  LoaderCircle,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  useAuth,
} from '../context/AuthContext.jsx';

import TermsModal from '../components/TermsModal.jsx';

import logo from '../logo.png';


export default function LoginPage() {
  const {
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    accepted,
    setAccepted,
  ] = useState(false);

  const [
    termsOpen,
    setTermsOpen,
  ] = useState(false);

  const [
    busy,
    setBusy,
  ] = useState(false);


  const submit =
    async (event) => {
      event.preventDefault();

      if (
        !email.trim() ||
        !password
      ) {
        toast.error(
          'Enter your email and password.'
        );

        return;
      }

      if (!accepted) {
        toast.error(
          'Please review and accept the Terms & Conditions.'
        );

        return;
      }

      if (busy) {
        return;
      }

      setBusy(true);

      try {
        /*
         * ONE login request.
         *
         * We do not call /auth/me here.
         */
        await login(
          email.trim(),
          password
        );

        /*
         * Go directly to dashboard.
         */
        navigate(
          '/dashboard',
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          'Login failed:',
          error
        );

        toast.error(
          error?.message ||
            'Unable to sign in.'
        );
      } finally {
        setBusy(false);
      }
    };


  return (
    <div className="auth-page">

      <header className="auth-header">
        <Link
          className="brand"
          to="/"
        >
          <img
            src={logo}
            alt="Fintel Secure"
          />

          <div>
            <div className="brand-name">
              Fintel Secure
            </div>

            <div className="brand-sub">
              Finance intelligence platform
            </div>
          </div>
        </Link>
      </header>


      <main className="auth-main">

        <div className="auth-panel panel">

          <p className="page-kicker">
            SIGN IN
          </p>

          <h1 className="auth-title">
            Access your workspace
          </h1>

          <p className="auth-copy">
            Transactions, investigations and
            market research in one account.
          </p>


          <form
            className="auth-form"
            onSubmit={submit}
          >

            <label>
              <span className="label">
                Email
              </span>

              <input
                className="input"
                type="email"
                autoComplete="username"
                value={email}
                disabled={busy}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
              />
            </label>


            <label>
              <span className="label">
                Password
              </span>

              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                disabled={busy}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="••••••••"
              />
            </label>


            <div className="terms-row">

              <input
                type="checkbox"
                checked={accepted}
                disabled={busy}
                onChange={(event) =>
                  setAccepted(
                    event.target.checked
                  )
                }
              />

              <div>
                I agree to the{' '}

                <button
                  type="button"
                  className="terms-link"
                  disabled={busy}
                  onClick={() =>
                    setTermsOpen(true)
                  }
                >
                  Terms & Conditions
                </button>{' '}

                and acknowledge that Fintel
                Secure is provided for financial
                analysis and research.
              </div>

            </div>


            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                busy ||
                !accepted
              }
            >
              {busy ? (
                <LoaderCircle
                  size={14}
                  className="login-spinner"
                />
              ) : (
                <ShieldCheck
                  size={14}
                />
              )}

              {busy
                ? 'Signing in…'
                : 'Sign in'}

              {!busy && (
                <ArrowRight
                  size={13}
                />
              )}
            </button>

          </form>


          <div className="auth-footer">
            New here?{' '}

            <Link
              className="terms-link"
              to="/signup"
            >
              Create an account
            </Link>
          </div>

        </div>


        <Link
          to="/"
          className="auth-back"
        >
          Back to product overview
        </Link>

      </main>


      <TermsModal
        open={termsOpen}
        onClose={() =>
          setTermsOpen(false)
        }
        onAccept={() => {
          setAccepted(true);
          setTermsOpen(false);
        }}
      />

    </div>
  );
}