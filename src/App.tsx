import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import 'xterm/css/xterm.css';
import BasicTerminal from './BasicTerminal';

const intro = [
  '     _____ __',
  '   /  ___ V  |',
  '  |  (___\\___|',
  '   \\_______  \\',
  '   ________)  |',
  '  |__________/',
];

const startAnimation = async (term: BasicTerminal) => {
  const sleep = async (ms: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  };
  term.term.focus();
  const prevDelay = term.slowDownDelay;
  const prevDelayBatch = term.slowDownBatch;

  term.slowDownDelay = 84;
  term.slowDownBatch = 1;
  await sleep(2100);
  await term.print('ATDT127001\r\n');

  var context = new AudioContext();
  context.resume().then(() => {
    const audio = new Audio('connect.ogg');
    console.log(audio);
    audio.play();
  });

  // await sleep(28000);
  term.slowDownDelay = 1;
  term.slowDownBatch = 2;
  await term.print('CONNECT 9600\r\n');

  term.slowDownDelay = prevDelay;
  term.slowDownBatch = prevDelayBatch;

  await term.print(intro.join('\n\r') + '\n\r');
};

const ReactBasicTerminal = ({ cols, rows }: { cols: number; rows: number }) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (el.current) {
      const options = {
        cols,
        rows,
      };

      const term = new BasicTerminal(options);
      const start = async () => {
        term.open(el.current!);
        term.fit();
        await startAnimation(term);
        term.start();
      };
      start();
    } else {
      console.error('No container element found');
    }

    return () => {
      alert('unmounted');
    };
  });

  return <div ref={el} style={{ flexGrow: 1 }}></div>;
};

const App: React.FC = () => {
  return <ReactBasicTerminal cols={80} rows={25} />;
};

export default App;
