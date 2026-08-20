import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Education', to: '/education' },
  { label: 'Contact', to: '/contact' },
]

function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul className="navigation-list">
        {navigationItems.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'navigation-link active' : 'navigation-link'
              }
              end={to === '/'}
              to={to}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
