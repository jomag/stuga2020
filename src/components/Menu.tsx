import React, { useState } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onSelection?: () => void;
}

type Props = {
  items: MenuItem[];
  onSelection: (id: string) => void;
};

const Menu = ({ items, onSelection }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleSelection = (item: MenuItem) => {
    setExpanded(false);
    item.onSelection && item.onSelection();
    onSelection(item.id);
  };

  const toggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div id="menu">
      <div className="menu-item" id="root-menu" onClick={toggle}>
        <div className="menu-icon">
          <span className="fas fa-home"></span>
        </div>
      </div>
      <ul id="menu-list" className={expanded ? 'open' : ''}>
        {items.map(item => (
          <li key={item.id} onClick={() => handleSelection(item)}>
            <div className="menu-label">{item.label}</div>
            <div className="menu-item">
              <div className="menu-icon">
                <span className={`fas fa-${item.icon}`}></span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Menu;
