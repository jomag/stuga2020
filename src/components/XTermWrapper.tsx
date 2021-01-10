import React, { useEffect, useRef } from 'react';
import { ITerminalOptions, ITerminalAddon, Terminal } from 'xterm';
import * as WebfontAddon from 'xterm-webfont';
import 'xterm/css/xterm.css';

interface IProps {
  className?: string;
  id?: string;
  key?: React.Key;
  options?: ITerminalOptions;
  addons?: Array<ITerminalAddon>;
  onInitialized?: () => void;
}

const XTermWrapper = ({
  options,
  addons,
  className,
  id,
  key,
  onInitialized
}: IProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);

  useEffect(() => {
    const createTerminal = async () => {
      term.current = new Terminal(options);

      for (const addon of addons || []) {
        term.current.loadAddon(addon);
      }

      term.current.loadAddon(new WebfontAddon());

      await (term.current! as any).loadWebfontAndOpen(ref.current!);
      term.current!.focus();

      onInitialized && onInitialized();
    };

    createTerminal();

    return () => {
      term.current?.dispose();
      term.current = null;
    };
  }, [addons, options, onInitialized]);

  return <div className={className} id={id} key={key} ref={ref}></div>;
};

export default XTermWrapper;
