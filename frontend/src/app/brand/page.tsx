export default function BrandPage() {
    // Placeholder metrics — will be populated from Auth0-secured API
    const metrics = [
        { label: "Active Placements", value: "12" },
        { label: "Total Impressions", value: "48.2K" },
        { label: "Hover Rate", value: "6.3%" },
        { label: "Click-Through", value: "2.1%" },
    ];

    return (
        <>
            <div className="page-header">
                <h1>Brand Dashboard</h1>
                <p>Monitor your virtual product placements and conversion metrics.</p>
                <a href="/brand/chat" className="btn btn-primary mt-4">
                    💬 Marketing Advisor
                </a>
            </div>

            {/* ── Stats ────────────────────────────── */}
            <div className="stats-grid">
                {metrics.map((m) => (
                    <div key={m.label} className="stat-card">
                        <div className="stat-value">{m.value}</div>
                        <div className="stat-label">{m.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Recent Placements ────────────────── */}
            <section className="card">
                <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
                    📍 Recent Placements
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                    No placements to display yet. Once videos are processed through the
                    pipeline, conversion metrics will appear here.
                </p>
            </section>
        </>
    );
}
