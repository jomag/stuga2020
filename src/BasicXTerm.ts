import { Terminal, ITerminalOptions } from 'xterm';
import * as XtermWebfont from 'xterm-webfont';

import { FitAddon } from 'xterm-addon-fit';
import { Program, Context, setupEnvironment, shell, parse, run } from 'bajsic';
import chalk from 'chalk';
import 'xterm/css/xterm.css';

type BasicTerminalOptions = {
  cols: number;
  rows: number;
};

const moveLeft = '\x1B[D';
const moveRight = '\x1B[C';

class BasicXTerm {
  term: Terminal;
  program?: Program;
  context?: Context;
  fitAddon?: FitAddon;
  slowDownDelay: number;
  slowDownBatch: number;
  inputBuffer: string[] = [];
  allCaps = false;

  constructor(options?: BasicTerminalOptions) {
    const { cols, rows } = options || {};

    this.slowDownDelay = 0;
    this.slowDownBatch = 3;

    const termOptions: ITerminalOptions = {
      cols,
      rows,
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

    this.term = new Terminal(termOptions);
    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.loadAddon(new XtermWebfont());
  }

  fit() {
    this.fitAddon!.fit();
  }

  focus() {
    this.term.focus();
  }

  async print(text: string): Promise<void> {
    if (this.slowDownDelay === 0) {
      this.term.write(text);
    } else {
      return new Promise((resolve, reject) => {
        let remaining = text;
        const ref = setInterval(() => {
          if (remaining) {
            // console.log('WRITE: ', remaining[0]);
            this.term.write(remaining.slice(0, this.slowDownBatch));
            remaining = remaining.slice(this.slowDownBatch);
            // console.log(JSON.stringify(remaining));
          }
          if (!remaining) {
            clearInterval(ref);
            resolve();
          }
        }, this.slowDownDelay);
      });
    }
  }

  addInput(text: string) {
    this.inputBuffer.push(text);
  }

  async readInput() {
    const inp = this.inputBuffer.shift();

    if (inp !== undefined) {
      this.print(inp + '\r\n');
      return inp;
    }

    let buf = '';
    let cursor = 0;

    return new Promise<string>((resolve: any, reject: any) => {
      // This code assumes that the data received is a single
      // character string, unless the first character is escape
      // (27), in which case it may be followed by escaped data
      // flow characters.
      const listener = this.term.onData((data: string) => {
        if (this.allCaps) {
          data = data.toUpperCase();
        }

        const code = data.charCodeAt(0);

        switch (code) {
          case 27:
            switch (data.substr(1)) {
              case '[A':
                // Up arrow: should go back in history
                break;

              case '[B':
                // Down arrow: should go forward in history
                break;

              case '[3~':
                // Delete
                this.term.write('SORRY DELETE KEY IS NOT YET HANDLED!');
                break;

              case '[F':
                // End
                this.term.write(moveRight.repeat(buf.length - cursor));
                cursor = buf.length;
                break;

              case '[H':
                // Home
                this.term.write(moveLeft.repeat(cursor));
                cursor = 0;
                break;

              case '[C':
                // Right arrow
                if (cursor < buf.length) {
                  cursor++;
                  this.term.write(data);
                }
                break;

              case '[D':
                // Left arrow
                if (cursor > 0) {
                  cursor--;
                  this.term.write(data);
                }
                break;

              default:
                this.term.write(`ESC "${data.substr(1)}"`);
            }
            break;

          case 13:
            this.term.write(data);
            listener.dispose();
            resolve(buf);
            break;

          case 127:
            // Backspace
            if (cursor > 0) {
              if (cursor === buf.length) {
                buf = buf.substr(0, buf.length - 1);
                cursor--;
                this.term.write(`${moveLeft} ${moveLeft}`);
              } else {
                this.term.write(moveLeft);
                this.term.write(buf.substr(cursor) + ' ');
                this.term.write(moveLeft.repeat(buf.length - cursor + 1));
                buf = buf.substr(0, cursor - 1) + buf.substr(cursor);
                cursor--;
              }
            }
            break;

          default:
            if (cursor === buf.length) {
              buf = buf + data;
              this.term.write(data);
            } else {
              const tail = data + buf.substr(cursor);
              this.term.write(tail);
              this.term.write('\x1B[D'.repeat(tail.length - 1));
              buf = buf.substr(0, cursor) + tail;
            }
            cursor += data.length;
            break;
        }
      });
    });
  }

  async open(el: HTMLDivElement) {
    await (this.term as any).loadWebfontAndOpen(el);
  }

  start() {
    const chalkOptions: any = { enabled: true, level: 2 };
    const forcedChalk = new chalk.constructor(chalkOptions);

    const support = {
      finalize: () => {
        // empty
      },
      open: async (filename: string, mode: string, channel: number) => {
        // empty
      },
      close: async (channel: number) => {
        /* do nothing */
      },
      print: async (channel: number, value: string) => {
        const value2 = value.replace(/\n/g, '\n\r');
        await this.print(value2);
      },
      printError: async (message: string) => {
        const message2 = message.replace(/\n/g, '\n\r');
        await this.print(forcedChalk.redBright(message2) + '\n\r');
      },
      readLine: async (channel: number) => {
        const text = await this.readInput();
        await this.print('\n');
        return text;
      },
      waitForInput: async (timeout: number) => {
        // FIXME: Quick fix to not break the game too much.
        // Waits indefinitely for input. See issue #11
        return support.readLine(0);
      }
    };

    const env = setupEnvironment('', support);
    this.program = env.program;
    this.context = env.context;

    fetch('/stuga.bas')
      .then((r: Response) => {
        console.log(r);
        return r.text();
      })
      .then((r: string) => {
        this.program = parse(r);
      })
      .then(() => {
        return run(this.program!, this.context!);
      })
      .then(() => shell(this.program!, this.context!))
      .catch((e: Error) => {
        support.printError(e.toString());
      });
  }

  setAllCaps(value: boolean) {
    this.allCaps = value;
  }
}

export default BasicXTerm;
