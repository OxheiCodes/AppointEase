import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentSession,
  getUserRole,
  signOutUser
} from '../services/authService.js';

function AccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await getCurrentSession();

        if (!session?.user) {
          navigate('/auth/login');
          return;
        }

        setUser(session.user);
        const fetchedRole = await getUserRole(session.user.id);
        setRole(fetchedRole);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/auth/login');
    } catch (logoutError) {
      setError(logoutError.message);
    }
  };

  if (loading) {
    return (
      <main className="container auth-page">
        <section className="auth-card">
          <h1>Loading account...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="container auth-page">
      <section className="auth-card">
        <p className="eyebrow">Account</p>
        <h1>Authenticated Session</h1>

        {error && <p className="form-error">{error}</p>}

        {!error && (
          <div className="account-details">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Role:</strong> {role || 'Not set'}
            </p>
          </div>
        )}

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </section>
    </main>
  );
}

export default AccountPage;
