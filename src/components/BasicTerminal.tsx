import React, { useEffect, useRef } from 'react';
import BasicXTerm from '../BasicXTerm';

type Props = {
  allCaps?: boolean;
};

const BasicTerminal = ({ allCaps }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const term = useRef<BasicXTerm | null>(null);

  useEffect(() => {
    if (ref.current !== null) {
      term.current = new BasicXTerm({ cols: 80, rows: 25 });
      term.current.open(ref.current).then(() => {
        term.current?.start();
        term.current?.fit();
        term.current?.focus();
      });
    }
    return () => {
      term.current?.dispose();
      term.current = null;
    };
  }, []);

  useEffect(() => {
    term.current?.setAllCaps(!!allCaps);
  }, [allCaps]);

  useEffect(() => {
    term.current?.fit();
  });

  return <div id="term-container" ref={ref}></div>;
};

export default BasicTerminal;
