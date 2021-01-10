import React, { useState, useRef, useEffect } from 'react';
import { ITerminalOptions, ITerminalAddon } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import XTermWrapper from './components/XTermWrapper';
import Menu, { MenuItem } from './components/Menu';
import Modal from './components/Modal';
import './App.css';
import screenfull from 'screenfull';
import { BasicAddon } from './BasicAddon';

const termOptions: ITerminalOptions = {
  cols: 80,
  rows: 25,
  cursorBlink: true,
  cursorStyle: 'underline',
  fontFamily: 'px437_ibm_ega8regular',
  fontSize: 16,
  // lineHeight: 0.95,
  rendererType: 'canvas',
  theme: {
    foreground: '#ddd',
    blue: '#0000aa',
    green: '#00aa00',
    cyan: '#00aaaa',
    red: '#aa0000',
    magenta: '#aa00aa',
    yellow: '#aa5500',
    white: '#aaaaaa',
    brightBlack: '#555555',
    brightBlue: '#5555ff',
    brightGreen: '#55ff55',
    brightCyan: '#55ffff',
    brightRed: '#ff5555',
    brightMagenta: '#ff55ff',
    brightYellow: '#ffff55',
    brightWhite: '#ffffff'
  }
};

function App() {
  const [allCaps, setAllCaps] = useState(true);
  const [aboutStugaOpen, showAboutStuga] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);

  const fitAddon = useRef(new FitAddon());
  const basicAddon = useRef(new BasicAddon());
  const addons = useRef(
    new Array<ITerminalAddon>(fitAddon.current, basicAddon.current)
  );

  basicAddon.current.allCaps = allCaps;

  const onTermInitialized = async () => {
    fitAddon.current.fit();
    await basicAddon.current.load('/stuga.bas');
    await basicAddon.current.run();
    await basicAddon.current.shell();
  };

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

  // Handle resize
  useEffect(() => {
    const onResize = () => {
      fitAddon.current.fit();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  return (
    <div id="app">
      <XTermWrapper
        id="term-container"
        addons={addons.current}
        options={termOptions}
        onInitialized={onTermInitialized}
      ></XTermWrapper>

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
