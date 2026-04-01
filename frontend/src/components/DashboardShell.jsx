const cards = [
  {
    title: 'Bookings',
    description: 'Track pending and confirmed appointments in one place.'
  },
  {
    title: 'Calendar',
    description: 'Visualize your week and avoid scheduling conflicts early.'
  },
  {
    title: 'Clients',
    description: 'Keep client details organized and easy to reach.'
  }
];

function DashboardShell() {
  return (
    <section id="dashboard" className="dashboard-shell">
      <div className="dashboard-head">
        <h2>Landing Dashboard</h2>
        <p>Stage 1 UI placeholders ready for upcoming booking features.</p>
      </div>

      <div className="card-grid" id="features">
        {cards.map((card) => (
          <article key={card.title} className="feature-card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <button type="button" disabled>
              Coming Soon
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardShell;
