import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./App.css";
import "xterm/dist/xterm.css";
import BasicTerminal from "./BasicTerminal";

const ReactBasicTerminal = ({ cols, rows }: { cols: number; rows: number }) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("MOUNT!");

    if (el.current) {
      const options = {
        cols,
        rows
      };

      const term = new BasicTerminal(options);
      term.open(el.current);

      // term.onData((text: string) => {
      //   if (text === "\n") console.log("NEWLINE");
      //   if (text === "\r") {
      //     term.write("\n\r");
      //   }
      //   console.log(text);
      //   term.write(text);
      // });
      // term.onLineFeed(() => {
      //   console.log("LINE FEED!");
      // });
    } else {
      console.error("No container element found");
    }

    return () => {
      console.log("UNMOUNT!");
    };
  });

  return <div ref={el}></div>;
};

const App: React.FC = () => {
  return (
    <div>
      <h1 style={{ margin: "40px 80px 0 80px" }}>Stuga 2020</h1>
      <div style={{ margin: "40px 80px 40px 80px", border: "4px solid #888" }}>
        <ReactBasicTerminal cols={80} rows={25} />
      </div>
    </div>
  );
};

export default App;
