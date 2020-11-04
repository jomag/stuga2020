<template>
  <div id="term-container"></div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import BasicTerminal from '../BasicTerminal';

let gTermHack: BasicTerminal | null = null;

const Terminal = Vue.extend({
  props: {
    autorun: { type: Boolean },
    preload: { type: Array as PropType<string[]> },
    allCaps: { type: Boolean },
    term: BasicTerminal
  },

  mounted() {
    const term = new BasicTerminal({ cols: 80, rows: 25 });
    gTermHack = term;

    const container = document.getElementById('term-container');

    if (!container) {
      throw new Error('Container not found');
    }

    for (const inp of this.preload || []) {
      term.addInput(inp);
    }

    term.open(container as HTMLDivElement).then(() => {
      term.fit();
      term.start();
      term.focus();
    });
  },

  watch: {
    allCaps: {
      immediate: true,
      handler(val) {
        gTermHack!.setAllCaps(val);
      }
    }
  }
});

export default Terminal;
</script>

<style>
#term-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
