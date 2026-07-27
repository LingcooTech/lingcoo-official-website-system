import { Link, NavLink } from 'react-router-dom';

import { site } from '@/content/site';
import Container from './Container';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          {site.name}
        </Link>
        <nav className="flex items-center gap-6 text-sm sm:gap-8">
          {site.nav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `transition-colors hover:text-ink ${isActive ? 'text-ink' : 'text-muted'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Container>
    </header>
  );
}
