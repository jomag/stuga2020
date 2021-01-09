import {
  Context,
  Program,
  BaseSupport,
  setupEnvironment,
  parse,
  run,
  shell
} from 'bajsic';
import { Terminal, ITerminalAddon } from 'xterm';
import chalk from 'chalk';

const moveLeft = '\x1B[D';
const moveRight = '\x1B[C';

export class BasicAddon implements ITerminalAddon {
  terminal?: Terminal;
  support: BaseSupport;
  program: Program;
  context: Context;
  inputBuffer: string[] = [];
  allCaps: boolean = true;
  forcedChalk = new chalk.constructor({
    enabled: true,
    level: 2
  });

  constructor() {
    this.support = {
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
      readLine: async (channel: number) => {
        const text = await this.readInput();
        await this.print('\n');
        return text;
      }
    };

    const { program, context } = setupEnvironment('', this.support);
    this.program = program;
    this.context = context;
  }

  activate(terminal: Terminal): void {
    this.terminal = terminal;
  }

  dispose(): void {
    this.terminal = undefined;
  }

  async load(url: string) {
    const res = await fetch(url);

    try {
      this.program = parse(await res.text());
    } catch (error) {
      this.printError(error.toString());
    }

    const { context } = setupEnvironment('', this.support);
    this.context = context;
  }

  async run() {
    try {
      return await run(this.program, this.context);
    } catch (error) {
      this.printError(error.toString());
    }
  }

  async shell() {
    try {
      return await shell(this.program, this.context);
    } catch (error) {
      this.printError(error.toString());
    }
  }

  async print(text: string): Promise<void> {
    this.terminal?.write(text);
  }

  addInput(text: string) {
    this.inputBuffer.push(text);
  }

  async readInput() {
    const term = this.terminal;

    if (!term) {
      return;
    }

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
      const listener = term.onData((data: string) => {
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
                term.write('SORRY DELETE KEY IS NOT YET HANDLED!');
                break;

              case '[F':
                // End
                term.write(moveRight.repeat(buf.length - cursor));
                cursor = buf.length;
                break;

              case '[H':
                // Home
                term.write(moveLeft.repeat(cursor));
                cursor = 0;
                break;

              case '[C':
                // Right arrow
                if (cursor < buf.length) {
                  cursor++;
                  term.write(data);
                }
                break;

              case '[D':
                // Left arrow
                if (cursor > 0) {
                  cursor--;
                  term.write(data);
                }
                break;

              default:
                term.write(`ESC "${data.substr(1)}"`);
            }
            break;

          case 13:
            term.write(data);
            listener.dispose();
            resolve(buf);
            break;

          case 127:
            // Backspace
            if (cursor > 0) {
              if (cursor === buf.length) {
                buf = buf.substr(0, buf.length - 1);
                cursor--;
                term.write(`${moveLeft} ${moveLeft}`);
              } else {
                term.write(moveLeft);
                term.write(buf.substr(cursor) + ' ');
                term.write(moveLeft.repeat(buf.length - cursor + 1));
                buf = buf.substr(0, cursor - 1) + buf.substr(cursor);
                cursor--;
              }
            }
            break;

          default:
            if (cursor === buf.length) {
              buf = buf + data;
              term.write(`\x1B[97m${data}\x1B[0m`);
            } else {
              const tail = data + buf.substr(cursor);
              term.write(tail);
              term.write('\x1B[D'.repeat(tail.length - 1));
              buf = buf.substr(0, cursor) + tail;
            }
            cursor += data.length;
            break;
        }
      });
    });
  }

  async printError(message: string) {
    const message2 = message.replace(/\n/g, '\n\r');
    await this.print(this.forcedChalk.redBright(message2) + '\n\r');
  }

  async waitForInput(timeout: number) {
    // FIXME: Quick fix to not break the game too much.
    // Waits indefinitely for input. See issue #11
    return this.support?.readLine(0);
  }
}
