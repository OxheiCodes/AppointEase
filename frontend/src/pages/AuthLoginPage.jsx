import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInUser } from '../services/authService.js';

function AuthLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInUser(form);
      navigate('/auth/account');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome Back</p>
        <h1>Login to AppointEase Now</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-meta">
          New here? <Link to="/auth/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default AuthLoginPage;
