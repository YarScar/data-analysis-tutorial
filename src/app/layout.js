import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Agentic Data Quality',
  description: 'Data quality analysis platform (scaffold)'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <nav className="main-nav" aria-label="Main navigation">
          <div className="brand-and-links" style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="brand">📊 Agentic Data Quality</div>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/preview">Preview</Link>
              <Link href="/analysis">Analysis</Link>
              <Link href="/insights">Insights</Link>
            </div>
          </div>
        </nav>
        <main id="main-content"><div className="container">{children}</div></main>
        <footer style={{padding: '1.5rem', marginTop: '3rem', borderTop: '2px solid rgba(214,167,122,0.2)', textAlign: 'center', color: 'var(--warm-taupe)', fontSize: '0.9rem'}}>Built from data-analysis-tutorial • Milestone 3</footer>
      </body>
    </html>
  )
}
