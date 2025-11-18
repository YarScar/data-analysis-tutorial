import './globals.css'

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
        <nav style={{padding: '1rem', borderBottom: '1px solid #eee'}} aria-label="Main navigation">
          <h1 style={{margin:0}}>Agentic Data Quality Analysis</h1>
        </nav>
        <main id="main-content" style={{padding: '1rem'}}>{children}</main>
        <footer style={{padding: '1rem', marginTop: '2rem', borderTop: '1px solid #eee'}}>Built from data-analysis-tutorial</footer>
      </body>
    </html>
  )
}
