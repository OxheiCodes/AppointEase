import DashboardShell from '../components/DashboardShell.jsx';

function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">AppointEase Now</p>
        <h1>Simple scheduling for growing businesses</h1>
        <p>Manage bookings, clients, and calendars in one clean workspace.</p>
      </section>
      <DashboardShell />
    </main>
  );
}

export default HomePage;
