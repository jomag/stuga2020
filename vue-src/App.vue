<template>
  <div id="app">
    <Terminal v-bind:autorun="true" v-bind:allCaps="allCaps" />
    <Menu v-bind:items="buildMenuItems()" v-on:selection="onMenuSelection" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Terminal from './components/Terminal.vue';
import Menu from './components/Menu.vue';

const App = Vue.extend({
  components: {
    Terminal,
    Menu
  },

  data: function() {
    return {
      allCaps: true
    };
  },

  methods: {
    onMenuSelection(id: string) {
      if (id === 'toggle-all-caps') {
        this.allCaps = !this.allCaps;
      }
    },

    buildMenuItems() {
      return [
        {
          id: 'about-stuga',
          label: 'About Stuga',
          icon: 'university'
        },
        {
          id: 'about-stuga-org',
          label: 'About stugan.org',
          icon: 'info'
        },
        {
          id: 'toggle-all-caps',
          label: this.allCaps ? 'ALL CAPS: Enabled' : 'ALL CAPS: Disabled',
          icon: 'keyboard'
        }
      ];
    }
  }
});

export default App;
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  height: 100vh;
  background: #000;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
}
</style>
