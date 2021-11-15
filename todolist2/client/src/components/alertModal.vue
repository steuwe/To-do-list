<template>
  <div v-bind:class="{ isActive : active , inactive : !active}">
    <div class="content">
      <div class="input">
        <slot></slot>
      </div>
      <div class="buttons">
        <button type="button" v-on:click="close"> Ok </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'alertModal',
  props: {
    active: Boolean
  },
  methods: {
    close () {
      this.$emit('close');
    }
  }
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
  width: 200px;
  background-color: #cccccc;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  border: 4px solid #cc2222;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.input {
  padding: 10px;
  color: #cc2222;
}

input {
  padding: 10px;
}
.buttons {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
}
button {
  padding: 10px;
}
</style>
