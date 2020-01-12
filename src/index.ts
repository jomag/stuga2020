import BasicTerminal from './BasicTerminal';
import './index.css';

const startAnimation = async (term: BasicTerminal) => {
  const sleep = async (ms: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  };

  const introResponse = await fetch('/STUGA.ANS');
  const intro = await introResponse.text();

  term.term.focus();
  const prevDelay = term.slowDownDelay;
  const prevDelayBatch = term.slowDownBatch;

  term.slowDownDelay = 84;
  term.slowDownBatch = 1;
  await sleep(2100);
  await term.print('ATDT127001\r\n');

  var context = new AudioContext();
  context.resume().then(() => {
    const audio = new Audio('connect.ogg');
    console.log(audio);
    audio.play();
  });

  // await sleep(28000);
  term.slowDownDelay = 1;
  term.slowDownBatch = 2;
  await term.print('CONNECT 9600\r\n');

  term.slowDownDelay = prevDelay;
  term.slowDownBatch = prevDelayBatch;

  await term.print(intro);
};

const showIntroduction = async (term: BasicTerminal) => {
  const introResponse = await fetch('/stuga.ans');
  const intro = await introResponse.text();
  await term.print(intro);
};

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  const term = new BasicTerminal({ cols: 80, rows: 25 });
  term.open(root! as HTMLDivElement);
  term.fit();

  showIntroduction(term).then((resolve: any) => {
    term.start();
    resolve();
  });

  window.addEventListener('resize', () => term.fit());
});
