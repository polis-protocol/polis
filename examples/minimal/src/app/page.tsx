export default function HomePage() {
  return (
    <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'serif' }}>Minimal Polis Example</h1>
      <p style={{ color: '#A0A0B0', marginTop: '1rem' }}>
        The smallest possible Polis deployment. Visit{' '}
        <a href="/community" style={{ color: '#BFFF3F' }}>/community</a> to see the forum.
      </p>
    </main>
  );
}
