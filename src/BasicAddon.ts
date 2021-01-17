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
import { once, EventEmitter } from 'events';

const moveLeft = '\x1B[D';
const moveRight = '\x1B[C';

export class BasicAddon implements ITerminalAddon {
  support: BaseSupport;
  program: Program;
  context: Context;
  allCaps: boolean = true;

  private terminal?: Terminal;

  // Listener for terminal.onData()
  private inputListener: any;

  // Contains characters received. On newline, the content
  // is appended to inputBuffer, onInput event is emitted
  // and input is emptied.
  private partialInput: string = '';

  // Unconsumed inputs
  private inputBuffer: string[] = [];

  private emitter: EventEmitter;

  // Readline mode is activated while waiting for input
  // (typically the INPUT statement). In this mode, input
  // handling is a bit more intelligent, allowing to move
  // cursor, go back in history etc
  private readlineMode: boolean = false;
  private cursor: number = 0;

  private forcedChalk = new chalk.constructor({
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
      printError: async (message: string) => {
        const message2 = message.replace(/\n/g, '\n\r');
        await this.print(this.forcedChalk.redBright(message2) + '\n\r');
      },
      readLine: async (channel: number) => {
        const text = await this.readInput();
        await this.print('\n\r');
        return text;
      },
      clearInputBuffer: () => {
        this.inputBuffer = [];
      },
      waitForInput: async (timeout: number) => {
        const res = await this.waitForInput(timeout);
        return res;
      }
    };

    const { program, context } = setupEnvironment('', this.support);
    this.program = program;
    this.context = context;
    this.emitter = new EventEmitter();
  }

  activate(terminal: Terminal): void {
    this.terminal = terminal;
    this.inputListener = terminal.onData(this.handleInput.bind(this));
  }

  dispose(): void {
    this.terminal = undefined;
    this.inputListener.dispose();
  }

  handleInputReadlineMode(data: string) {
    // This code assumes that the data received is a single
    // character string, unless the first character is escape
    // (27), in which case it may be followed by escaped data
    // flow characters.
    if (this.allCaps) {
      data = data.toUpperCase();
    }

    const code = data.charCodeAt(0);

    switch (code) {
      case 27:
        // Escape character, that is typically followed by escaped
        // data flow characters
        switch (data.substr(1)) {
          case '[A':
            // Up arrow: should go back in history
            break;

          case '[B':
            // Down arrow: should go forward in history
            break;

          case '[3~':
            // Delete
            break;

          case '[F':
            // End
            this.terminal?.write(
              moveRight.repeat(this.partialInput.length - this.cursor)
            );
            this.cursor = this.partialInput.length;
            break;

          case '[H':
            // Home
            this.terminal?.write(moveLeft.repeat(this.cursor));
            this.cursor = 0;
            break;

          case '[C':
            // Right arrow
            if (this.cursor < this.partialInput.length) {
              this.cursor++;
              this.terminal?.write(data);
            }
            break;

          case '[D':
            // Left arrow
            if (this.cursor > 0) {
              this.cursor--;
              this.terminal?.write(data);
            }
            break;

          default:
            console.log(`Unhandled escape code: ${data.substr(1)}"`);
            break;
        }
        break;

      case 13:
        this.terminal?.write(data);
        this.inputBuffer.push(this.partialInput);
        this.partialInput = '';
        this.cursor = 0;
        this.emitter.emit('input');
        break;

      case 127:
        // Backspace
        if (this.cursor > 0) {
          if (this.cursor === this.partialInput.length) {
            this.partialInput = this.partialInput.substr(
              0,
              this.partialInput.length - 1
            );
            this.cursor--;
            this.terminal?.write(`${moveLeft} ${moveLeft}`);
          } else {
            this.terminal?.write(moveLeft);
            this.terminal?.write(this.partialInput.substr(this.cursor) + ' ');
            this.terminal?.write(
              moveLeft.repeat(this.partialInput.length - this.cursor + 1)
            );
            this.partialInput =
              this.partialInput.substr(0, this.cursor - 1) +
              this.partialInput.substr(this.cursor);
            this.cursor--;
          }
        }
        break;

      default:
        if (this.cursor === this.partialInput.length) {
          this.partialInput += data;
          this.terminal?.write(`\x1B[97m${data}\x1B[0m`);
        } else {
          const tail = data + this.partialInput.substr(this.cursor);
          this.terminal?.write(tail);
          this.terminal?.write('\x1B[D'.repeat(tail.length - 1));
          this.partialInput = this.partialInput.substr(0, this.cursor) + tail;
        }
        this.cursor += data.length;
        break;
    }
  }

  handleInput(data: string) {
    if (this.readlineMode) {
      this.handleInputReadlineMode(data);
      return;
    }

    if (this.allCaps) {
      data = data.toUpperCase();
    }

    switch (data.charCodeAt(0)) {
      case 13:
        this.terminal?.write(data);
        this.inputBuffer.push(this.partialInput);
        this.partialInput = '';
        this.emitter.emit('input');
        break;

      case 27:
        const escaped = `^[${data.substr(1)}`;
        this.partialInput += escaped;
        this.terminal?.write(escaped);
        break;

      default:
        this.partialInput += data;
        this.terminal?.write(data);
        break;
    }
  }

  async load(url: string) {
    const res = await fetch(url);

    try {
      this.program = parse(await res.text());
    } catch (error) {
      this.support.printError(error.toString());
    }

    const { context } = setupEnvironment('', this.support);
    this.context = context;
  }

  async run() {
    try {
      return await run(this.program, this.context);
    } catch (error) {
      this.support.printError(error.toString());
    }
  }

  async shell() {
    try {
      return await shell(this.program, this.context);
    } catch (error) {
      this.support.printError(error.toString());
    }
  }

  async print(text: string): Promise<void> {
    this.terminal?.write(text);
  }

  addInput(text: string) {
    this.inputBuffer.push(text);
  }

  async readInput() {
    this.readlineMode = true;

    while (true) {
      const inp = this.inputBuffer.shift();

      if (inp !== undefined) {
        this.readlineMode = false;
        return inp;
      }

      await once(this.emitter, 'input');
    }
  }

  async waitForInput(timeout: number) {
    console.log('Wait for input: ', timeout);
    if (this.inputBuffer.length > 0) {
      return 1;
    }

    return new Promise(resolve => {
      const handleInput = () => {
        console.log('INPUT: ', this.inputBuffer);
        clearTimeout(id);
        resolve(1);
      };

      this.emitter.once('input', handleInput);

      const id = setTimeout(() => {
        console.log('Timeout!');
        this.emitter.removeListener('input', handleInput);
        resolve(0);
      }, timeout);
    });
  }
}
