<template>
  <div id="menu">
    <div class="menu-item" id="root-menu" v-on:click="toggle()">
      <div class="menu-icon"><span class="fas fa-home"></span></div>
    </div>
    <ul id="menu-list" v-bind:class="{ open: open }">
      <li
        v-for="item in items"
        :key="item.id"
        v-on:click="handleSelection(item.id)"
      >
        <div class="menu-label">{{ item.label }}</div>
        <div class="menu-item">
          <div class="menu-icon">
            <span v-bind:class="`fas fa-${item.icon}`"></span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const Menu = Vue.extend({
  props: {
    items: { type: Array as PropType<MenuItem[]> }
  },

  data() {
    return {
      open: false
    };
  },

  methods: {
    toggle() {
      console.log(this.items);
      this.open = !this.open;
    },

    handleSelection(id: string) {
      this.$emit('selection', id);
      this.open = false;
    }
  }
});

export default Menu;
</script>

<style>
#menu {
  z-index: 100;
  position: absolute;
  top: 0;
  right: 0;
  margin: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

#menu-list {
  list-style-type: none;
  margin: 0;
  opacity: 0;

  transition: all 0.3s ease;
  transform: scale(0);
  transform-origin: 85% top;
}

#menu-list.open {
  opacity: 1;
  transform: scale(1);
}

#menu-list li {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.menu-item {
  width: 50px;
  height: 50px;
  margin: 0 15px 0 15px;

  border-radius: 100%;
  background: #016fb9;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transform-origin: 50% 50%;
  transition: all 0.15s ease;
}

.menu-item:hover {
  transform: scale(1.1);
  filter: brightness(120%);
}

#root-menu {
  width: 80px;
  height: 80px;
  margin: 0;
}

.menu-label {
  align-self: center;
  color: #eee;
  position: relative;
  padding-right: 20px;
}

.menu-icon {
  font-weight: bold;
  color: #eee;
}
</style>
