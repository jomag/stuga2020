import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import 'xterm/css/xterm.css';
import BasicTerminal from './BasicTerminal';

const ReactBasicTerminal = ({ cols, rows }: { cols: number; rows: number }) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (el.current) {
      const options = {
        cols,
        rows,
      };

      const term = new BasicTerminal(options);
      term.open(el.current);
      term.fit();
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
