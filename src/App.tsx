import React, { useState } from 'react';

import BasicTerminal from './components/BasicTerminal';
import Menu from './components/Menu';
import './App.css';

function App() {
  const [allCaps, setAllCaps] = useState(true);

  const buildMenuItems = () => {
    return [
      {
        id: 'about-stuga',
        label: 'About Stuga',
        icon: 'university'
      },
      {
        id: 'about-stuga-org',
        label: 'About stugan.org',
        icon: 'info'
      },
      {
        id: 'toggle-all-caps',
        label: allCaps ? 'ALL CAPS: Enabled' : 'ALL CAPS: Disabled',
        icon: 'keyboard'
      }
    ];
  };

  const handleSelection = (id: string) => {
    if (id === 'toggle-all-caps') {
      setAllCaps(!allCaps);
    }
  };

  return (
    <div id="app">
      <BasicTerminal allCaps={allCaps}></BasicTerminal>
      <Menu items={buildMenuItems()} onSelection={handleSelection}></Menu>
    </div>
  );
}

export default App;
