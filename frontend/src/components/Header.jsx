import { Link } from 'react-router-dom'
import Navigation from './Navigation.jsx'

function Header() {
  return (
    <header className="site-header">
      <div className="shell-content header-content">
        <Link className="site-title" to="/">
          Antti Portfolio
        </Link>
        <Navigation />
      </div>
    </header>
  )
}

export default Header
