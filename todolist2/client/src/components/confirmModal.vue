<template>
  <div v-bind:class="{ isActive : active , inactive : !active}">
    <div class="content">
      <div class="message">
        <slot></slot>
      </div>
      <div class="buttons">
        <button class="confirm" type="button" v-on:click="confirm"> Confirm </button>
        <button class="cancel" type="button" v-on:click="cancel"> Cancel </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'confirmModal',
  props: {
    active: Boolean
  },
  methods: {
    confirm () {
      this.$emit('confirm');
    },
    cancel () {
      this.$emit('cancel');
    },
  },
};
</script>

<style scoped>
.inactive {
  display: none;
}

.isActive {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
}

.content {
  background-color: #cccccc;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  border: 2px solid black;
  border-right: 3px solid black;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.buttons {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
}
button {
  padding: 10px;
}
.confirm {
  background-color: #999999;
}
.cancel {
  background-color: #e55757;
}
</style>
