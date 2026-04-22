import polisConfig from '../../polis.config';

export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--polis-font-serif)',
          fontSize: '3rem',
          color: 'var(--polis-text-primary)',
          marginBottom: '1rem',
        }}
      >
        Welcome to {polisConfig.city.name}
      </h1>
      <p style={{ color: 'var(--polis-text-secondary)', fontSize: '1.125rem', marginBottom: '2rem' }}>
        A pop-up city powered by Polis Protocol
      </p>
      <a
        href="/community"
        style={{
          padding: '0.75rem 2rem',
          background: 'var(--polis-primary)',
          color: 'var(--polis-bg-deep)',
          borderRadius: 'var(--polis-radius-lg)',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Enter Community
      </a>
    </main>
  );
}
