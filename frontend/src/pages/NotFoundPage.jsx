import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page-content">
      <h1>Page not found</h1>
      <p>The requested page does not exist.</p>
      <Link to="/">Return to Home</Link>
    </section>
  )
}

export default NotFoundPage
