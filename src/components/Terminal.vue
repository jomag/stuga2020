<template>
  <div id="term-container"></div>
</template>

<script lang="ts">
// import { Component, Vue } from 'vue-property-decorator';
import BasicTerminal from '../BasicTerminal';
// import intro from '../assets/stuga.ans';
// const intro = 'hejhej';

export default {
  mounted() {
    const term = new BasicTerminal({ cols: 80, rows: 25 });
    const container = document.getElementById('term-container');
    if (!container) {
      throw new Error('Container not found');
    }

    term.open(container as HTMLDivElement).then(() => {
      term.fit();
      term.start();
    });
  }
};
</script>

<style>
#term-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
