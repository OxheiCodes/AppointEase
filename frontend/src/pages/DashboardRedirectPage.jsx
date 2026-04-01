import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession, getUserRole } from '../services/authService.js';

function DashboardRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const resolveDashboard = async () => {
      try {
        const session = await getCurrentSession();

        if (!session?.user) {
          navigate('/auth/login');
          return;
        }

        const role = await getUserRole(session.user.id);
        navigate(role === 'business_owner' ? '/owner-dashboard' : '/bookings');
      } catch {
        navigate('/auth/login');
      }
    };

    resolveDashboard();
  }, [navigate]);

  return (
    <main className="container auth-page">
      <section className="auth-card">
        <h1>Loading dashboard...</h1>
      </section>
    </main>
  );
}

export default DashboardRedirectPage;
