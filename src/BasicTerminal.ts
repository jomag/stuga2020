import { Terminal, ITerminalOptions } from 'xterm';
import { Stream, Program, Context, setupEnvironment, shell } from 'bajsic';
import chalk from 'chalk';

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
    let inputBuf = '';

    const termOptions: ITerminalOptions = {
      cols,
      rows,
      cursorBlink: true,
      cursorStyle: 'underline',
      fontFamily: 'Px437 IBM EGA8',
      fontSize: 22,
    };

    this.term = new Terminal(termOptions);

    this.term.onData((text: string) => {
      this.term.write(text);

      if (text === '\n') {
        return;
      }

      inputBuf += text;

      if (text === '\r') {
        this.term.write('\r\n');

        if (this.context && this.context.inputStream) {
          this.context.inputStream.write(inputBuf);
          inputBuf = '';
        }
      }
    });
  }

  open(el: HTMLDivElement) {
    let chalkOptions: any = { enabled: true, level: 2 };
    const forcedChalk = new chalk.constructor(chalkOptions);

    this.term.open(el);

    const env = setupEnvironment();
    this.program = env.program;
    this.context = env.context;

    // Input from user/keyboard to interpreter
    this.context.inputStream = new Stream();

    // Output from interpreter, to be presented on screen
    this.context.outputStream = new Stream();
    this.context.outputStream.on('data', (data: string) => {
      console.log(`Output stream data: [${data}]`);
      const data2 = data.replace(/\n/g, '\n\r');
      this.term.write(data2);
    });

    // Error from interpreter, to be presented on screen
    this.context.errorStream = new Stream();
    this.context.errorStream.on('data', (data: string) => {
      console.log(`Error stream data: [${data}]`);
      const data2 = data.replace(/\n/g, '\n\r');
      this.term.write(forcedChalk.redBright(data2));
    });

    fetch('/stuga.bas')
      .then((r: any) => {
        console.log(r);
        return r.text();
      })
      .then((r: any) => this.program!.loadFromString(r, this.context!))
      .then(() => shell(this.program!, this.context!));
  }
}

export default BasicTerminal;
