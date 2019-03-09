import React from 'react';
import capitalize from '../utils/capitalize';
import { rhythm } from '../utils/typography';

interface PillsProps {
  items: string[];
}

function cssSafe(str: string) {
  return encodeURIComponent(str.toLowerCase()).replace(/%[0-9A-F]{2}/gi, '');
}

const Pill: React.FunctionComponent<PillsProps> = ({ items }) => {
  return (
    <div className="pills">
      {items.map((item, idx) => (
        <span
          className={`pill pill--${cssSafe(item)}`}
          key={idx}
          style={{ marginRight: rhythm(1 / 4) }}
        >
          {capitalize(item)}
        </span>
      ))}
    </div>
  );
};

export default Pill;
