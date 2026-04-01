import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signUpUser } from '../services/authService.js';

function AuthSignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signUpUser(form);
      setSuccess('Signup successful. You can now log in immediately.');
      setForm({
        fullName: '',
        email: '',
        password: '',
        role: 'customer'
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page">
      <section className="auth-card">
        <p className="eyebrow">Get Started</p>
        <h1>Create your AppointEase Now account</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </label>

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
              minLength={6}
              required
            />
          </label>

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="business_owner">Business Owner</option>
            </select>
          </label>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="auth-meta">
          Already have an account? <Link to="/auth/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default AuthSignupPage;
