import React from 'react';
import { Link } from 'gatsby';

import { rhythm, scale } from '../utils/typography';
import Logo from '../../content/assets/donut.svg';

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props;
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
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <header
          style={{
            marginTop: 0,
            marginBottom: rhythm(1.5),
          }}
        >
          <Logo
            style={{
              height: 50,
              width: 50,
              verticalAlign: 'middle',
              marginRight: rhythm(1 / 4),
            }}
          />
          {header}
        </header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()} Lauren Tan
          <div>
            <a href="https://twitter.com/sugarpirate_">Twitter</a> /{' '}
            <a href="https://github.com/poteto">GitHub</a> /{' '}
            <a href="https://www.linkedin.com/in/laurenelizabethtan/">
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

export default Layout;
