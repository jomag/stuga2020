import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Terminal, ITerminalOptions } from 'xterm';
import './App.css';
import 'xterm/dist/xterm.css';
import { any } from 'prop-types';
import { Stream, Writable } from 'stream';

// FIXME: add types
const setupEnvironment = require('bajsic/src/utils');

const ReactTerminal = ({
  cols,
  rows,
  inputStream,
  outputStream,
  errorStream,
}: {
  cols: number;
  rows: number;
  inputStream: Stream | undefined;
  outputStream: Stream | undefined;
  errorStream: Stream | undefined;
}) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('MOUNT!');

    if (el.current) {
      const options: ITerminalOptions = {
        cols,
        rows,
      };

      const term = new Terminal(options);
      term.open(el.current);
      term.write('Hello!');
      term.onData((text: string) => {
        if (text === '\n') console.log('NEWLINE');
        if (text === '\r') {
          term.write('\n\r');
        }
        console.log(text);
        term.write(text);
      });
      term.onLineFeed(() => {
        console.log('LINE FEED!');
      });
    } else {
      console.error('No container element found');
    }

    return () => {
      console.log('UNMOUNT!');
    };
  });

  return <div ref={el}></div>;
};

const BasicShell = ({ cols, rows }: { cols: number; rows: number }) => {
  const env = useRef<{ program: any; context: any }>();
  const inputStream = useRef<Stream>();
  const outputStream = useRef<Stream>();
  const errorStream = useRef<Stream>();

  useEffect(() => {
    env.current = setupEnvironment('');
    inputStream.current = new Writable({
      write(chunk, encoding, callback) {},
    });

    setTimeout(() => {
      inputStream;
    });

    return () => {};
  });

  return (
    <ReactTerminal
      cols={cols}
      rows={rows}
      inputStream={inputStream.current}
      outputStream={outputStream.current}
      errorStream={errorStream.current}
    />
  );
};

const App: React.FC = () => {
  return (
    <div>
      <h1 style={{ margin: '40px 80px 0 80px' }}>Stuga 2020</h1>
      <div style={{ margin: '40px 80px 40px 80px', border: '4px solid #888' }}>
        <BasicShell cols={80} rows={25} />
      </div>
    </div>
  );
};

export default App;
