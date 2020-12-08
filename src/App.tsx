import React, { useState } from 'react';

import BasicTerminal from './components/BasicTerminal';
import Menu, { MenuItem } from './components/Menu';
import Modal from './components/Modal';
import './App.css';
import screenfull from 'screenfull';

function App() {
  const [allCaps, setAllCaps] = useState(true);
  const [aboutStugaOpen, showAboutStuga] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);

  const buildMenuItems = () => {
    const items: MenuItem[] = [
      {
        id: 'about-stuga',
        label: 'About Stuga',
        icon: 'info'
      },
      {
        id: 'toggle-all-caps',
        label: allCaps ? 'ALL CAPS: Enabled' : 'ALL CAPS: Disabled',
        icon: 'keyboard'
      }
    ];

    if (screenfull.isEnabled) {
      items.push({
        id: 'fullscreen',
        label: isFullscreen ? 'Leave fullscreen' : 'Enter fullscreen',
        icon: isFullscreen ? 'compress' : 'expand',
        onSelection: () => {
          if (screenfull.isEnabled) {
            if (isFullscreen) {
              screenfull.exit();
            } else {
              screenfull.request();
            }
          }
          setFullscreen(!isFullscreen);
        }
      });
    }

    return items;
  };

  const handleSelection = (id: string) => {
    if (id === 'toggle-all-caps') {
      setAllCaps(!allCaps);
    }

    if (id === 'about-stuga') {
      showAboutStuga(true);
    }
  };

  return (
    <div id="app">
      <BasicTerminal allCaps={allCaps}></BasicTerminal>
      <Menu items={buildMenuItems()} onSelection={handleSelection}></Menu>
      <Modal
        title="Welcome to the world of Stuga!"
        open={aboutStugaOpen}
        onClose={() => showAboutStuga(false)}
      >
        <p style={{ fontWeight: 500 }}>
          Stuga is a classic, Swedish text adventure game originally released in
          1978. The first version of the game was written in BASIC on Oden, a
          DEC-10 mainframe computer at QZ in Stockholm, Sweden. The game was
          later released for PC with the name changed to Stugan.
        </p>

        <p>
          In summer 2019 I found out that one of the original authors, Kimmo
          Eriksson, had found the original source code and released it on his
          homepage (https://www.kimmoeriksson.se). Unfortunately, I could not
          find an interpreter compatible with the specific BASIC dialect the
          game was written in, so I set out to write an an interpreter in
          JavaScript with enough functionality to run the game (how hard can it
          be?!).
        </p>

        <p>
          Several months later, the interpreter is finally complete enough to
          run most of the game. I've not yet managed to play the whole game
          through, so there might be catastrophic incompatibilities later in the
          game!
        </p>

        <p>
          I've made minimal changes to the game source code. It's more or less
          only fixing what invalid line breaks, text encodings and very few
          functions that I've still not implemented in the inter- preter. These
          functions are mostly related to saving game state which unfortunately
          is not working anyway.
        </p>

        <p>
          The BASIC interpreter as well as the code of this website is free
          software and available on Github:
        </p>

        <ul>
          <li>
            BASIC interpreter:{' '}
            <a href="https://github.com/jomag/bajsic">
              github.com/jomag/bajsic
            </a>
          </li>
          <li>
            Website:{' '}
            <a href="https://github.com/jomag/stuga">github.com/jomag/stuga</a>
          </li>
        </ul>
      </Modal>
    </div>
  );
}

export default App;
