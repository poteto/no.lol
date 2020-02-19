import React from 'react';
import { Link } from 'gatsby';

import { rhythm, scale } from '../utils/typography';
import Logo from '../../content/assets/donut.svg';
import SOCIAL from '../constants/social';

interface LayoutProps {
  location: Location;
  title: string;
  children: React.ReactNode;
}

const Layout: React.FunctionComponent<LayoutProps> = ({
  location,
  title,
  children,
}) => {
  const rootPath = `${__PATH_PREFIX__}/`; // eslint-disable-line no-undef
  let header;

  if (location.pathname === rootPath) {
    header = (
      <h2
        style={{
          ...scale(0.3),
          fontStyle: 'italic',
          display: 'inline',
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h2>
    );
  } else {
    header = (
      <h2
        style={{
          ...scale(0.3),
          fontStyle: 'italic',
          display: 'inline',
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h2>
    );
  }
  return (
    <>
      <header
        style={{
          padding: rhythm(1),
          marginTop: 0,
          marginBottom: 0,
        }}
      >
        <div className="logo">
          <Logo
            style={{
              verticalAlign: 'middle',
              marginRight: rhythm(1 / 4),
            }}
          />
          {header}
        </div>
        <ul className="horizontal-links">
          <li>
            <Link className="squiggly" to={'/'}>
              Writing
            </Link>
          </li>
          <li>
            <Link className="squiggly" to={'/speaking'}>
              Speaking
            </Link>
          </li>
        </ul>
      </header>
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()} Lauren Tan
          <div>
            {SOCIAL.map((s, idx) => (
              <React.Fragment key={s.kind}>
                <a href={s.url}>{s.kind}</a>
                {idx === SOCIAL.length - 1 ? '' : <span> / </span>}
              </React.Fragment>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
