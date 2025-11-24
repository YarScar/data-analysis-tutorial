// Root layout for the Next.js app
// This file defines the HTML shell used across all pages under `src/app`.
// It includes site metadata, global styles, navigation and a content slot (`children`).
import '../styles/globals.css'
import Link from 'next/link'

// Metadata used by Next.js for the site (title and description)
export const metadata = {
  title: 'Agentic Data Quality',
  description: 'Data quality analysis platform (scaffold)'
}

// Root layout component - wraps every page's content in consistent header/footer
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* viewport meta ensures the app is responsive on mobile */}
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>
        {/* Skip link for keyboard users and accessibility */}
        <a className="skip-link" href="#main-content">Skip to main content</a>

        {/* Main navigation bar - simple internal links using Next's Link */}
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

        {/* Main content area - `children` is where page-specific content is rendered */}
        <main id="main-content"><div className="container">{children}</div></main>

        {/* Footer - small site credit */}
        <footer style={{padding: '1.5rem', marginTop: '3rem', borderTop: '2px solid rgba(214,167,122,0.2)', textAlign: 'center', color: 'var(--warm-taupe)', fontSize: '0.9rem'}}>
          Built from data-analysis-tutorial • Milestone 3
        </footer>
      </body>
    </html>
  )
}
