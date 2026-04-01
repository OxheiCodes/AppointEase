import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getCurrentSession,
  getUserRole,
  onAuthStateChange,
  signOutUser
} from '../services/authService.js';

function Navbar() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [role, setRole] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const session = await getCurrentSession();
        if (isMounted) {
          setIsSignedIn(Boolean(session?.user));
          setRole('');

          if (session?.user) {
            const userRole = await getUserRole(session.user.id);
            if (isMounted) {
              setRole(userRole);
            }
          }
        }
      } catch {
        if (isMounted) {
          setIsSignedIn(false);
          setRole('');
        }
      }
    };

    loadSession();

    const { data: subscription } = onAuthStateChange(async (user) => {
      if (isMounted) {
        setIsSignedIn(Boolean(user));
        setRole('');

        if (user) {
          try {
            const userRole = await getUserRole(user.id);
            if (isMounted) {
              setRole(userRole);
            }
          } catch {
            if (isMounted) {
              setRole('');
            }
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOutUser();
      setIsSignedIn(false);
      setRole('');
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  };

  const dashboardLabel =
    role === 'business_owner' ? 'Owner Dashboard' : 'My Bookings';

  const dashboardPath =
    role === 'business_owner' ? '/owner-dashboard' : '/bookings';

  return (
    <header className="top-nav">
      <div className="container nav-inner">
        <Link className="brand" to="/">
          <span className="brand-badge">AE</span>
          <span>AppointEase Now</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/public-booking">Book Now</Link>
          {isSignedIn ? (
            <Link to={dashboardPath}>{dashboardLabel}</Link>
          ) : (
            <Link to="/dashboard">Dashboard</Link>
          )}
          {isSignedIn ? (
            <>
              <Link to="/auth/account">My Account</Link>
              <button
                type="button"
                className="nav-signout-btn"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login">Login</Link>
              <Link to="/auth/signup">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
