import { Terminal, ITerminalOptions } from "xterm";
import { Stream, Program, Context, setupEnvironment, shell } from "bajsic";

type BasicTerminalOptions = {
  cols: number;
  rows: number;
};

class BasicTerminal {
  term: Terminal;
  program?: Program;
  context?: Context;

  constructor(options?: BasicTerminalOptions) {
    const { cols, rows } = options || {};
    let inputBuf = "";

    const termOptions: ITerminalOptions = {
      cols,
      rows
    };

    this.term = new Terminal(termOptions);

    this.term.onData((text: string) => {
      this.term.write(text);
      inputBuf += text;

      if (text === "\r") {
        this.term.write("\n");
        console.log("NEW LINE: ", inputBuf);
        if (this.context && this.context.inputStream) {
          this.context.inputStream.write(inputBuf);
          inputBuf = "";
        }
      }
    });
  }

  open(el: HTMLDivElement) {
    this.term.open(el);

    const env = setupEnvironment("");
    this.program = env.program;
    this.context = env.context;

    this.context.inputStream = new Stream();

    this.context.outputStream = new Stream();
    this.context.outputStream.on("data", () => {
      if (this.context && this.context.outputStream) {
        const data = this.context.outputStream.read();
      }
    });

    this.context.outputStream.on("data", (data: string) => {
      this.term.write(data);
    });

    shell(this.program, this.context);
  }
}

export default BasicTerminal;
