<template>
  <div v-bind:class="{ isActive : active , inactive : !active}">
    <div class="content">
      <div class="input">
        <slot></slot>
        <input type="text" ref="input" class="modalinput">
      </div>
      <div class="buttons">
        <button type="button" v-on:click="confirm"> Add </button>
        <button class="cancel" type="button" v-on:click="cancel"> Cancel </button>
      </div>
        <AlertModal :active="openAlertWindow" v-on:close="closeAlertWindow">
          <p> Name is empty! </p>
        </AlertModal>
    </div>
  </div>
</template>

<script>
import AlertModal from './alertModal.vue';
export default {
  name: 'addModal',
  components: {
    AlertModal
  },
  props: {
    active: Boolean
  },
  methods: {
    confirm () {
      if (this.$refs.input.value === null || this.$refs.input.value === '') {
        this.openAlertWindow = true;
        return;
      }
      this.$emit('confirm', this.$refs.input.value);
      this.$refs.input.value = '';
    },
    cancel () {
      this.$emit('cancel');
      this.$refs.input.value = '';
    },
    closeAlertWindow () {
      this.openAlertWindow = false;
    }
  },
  data () {
    return {
      name,
      openAlertWindow: false
    };
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
  border: 2px solid black;
  border-right: 3px solid black;
  background-color: #cccccc;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.input {
  padding: 10px;
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
.cancel {
  background-color: #e55757;
}
</style>
