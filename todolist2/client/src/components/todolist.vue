<template>
  <div>
    <div class="listcontainer">
      <div class="top">
        <h1>{{listname}}</h1>
        <button type="button" class="editButton" v-on:click="editListName"> Edit name </button>
        <p>{{percentage}}% completed</p>
      </div>
      <ul ref="ulist">
        <li v-for="(item, index) in listitems" v-bind:key="index" v-bind:class="{checked: item.done}">
          <input type="checkbox" v-model="item.done" v-on:change="updateItem(item.name)" aria-label="Checkbox">
          <label ref="check">{{item.name}}</label>
          <div class="editItemButtons">
            <button type="button" v-on:click="editItemName(item.name)">edit</button>
            <button class="deleteItemButton" v-on:click="deleteItem(item.name)" type="button">x</button>
          </div>
        </li>
      </ul>
      <div class="bottom">
        <input type="text" class="addItem" ref="input" placeholder="Add new item: ">
        <button type="button" class="addButton" v-on:click="addItem">></button>
      </div>
    </div>
    <button type="button" class="deleteButton" v-on:click="deleteList">Delete List</button>
    <ConfirmModal :active="openConfirmDeleteListModal" v-on:confirm="confirmDeleteList" v-on:cancel="cancelDeleteList">
      <p> Are you sure you wish to delete this list? </p>
    </ConfirmModal>
    <ConfirmModal :active="openConfirmDeleteItemModal" v-on:confirm="confirmDeleteItem" v-on:cancel="cancelDeleteItem">
      <p> Are you sure you wish to delete this item? </p>
    </ConfirmModal>
    <ConfirmModal :active="openEditListNameModal" v-on:confirm="confirmEditListName" v-on:cancel="cancelEditListName">
      <input type="text" class="editNameInput" ref="newListName" placeholder="New name:">
    </ConfirmModal>
    <ConfirmModal :active="openEditItemNameModal" v-on:confirm="confirmEditItemName" v-on:cancel="cancelEditItemName">
      <input type="text" class="editNameInput" ref="newItemName" placeholder="New name:">
    </ConfirmModal>
    <AlertModal :active="openAlertWindow" v-on:close="closeAlertWindow">
        <p> {{ message }} </p>
    </AlertModal>
  </div>
</template>

<script>
import ConfirmModal from './confirmModal.vue';
import AlertModal from './alertModal.vue';
import { serverURL } from '../config.js';
export default {
  props: {
    name: {
      type: String
    },
    items: {
      type: Array
    },
    username: {
      type: String
    }
  },
  components: {
    ConfirmModal,
    AlertModal
  },
  methods: {
    async addItem () {
      const text = this.$refs.input.value;
      if (text === null || text === '') {
        this.message = 'Item name is empty!';
        this.openAlertWindow = true;
        return;
      }
      for (let i = 0; i < this.listitems.length; i++) {
        if (this.listitems[i].name === text) {
          this.message = 'Name is already in use!';
          this.openAlertWindow = true;
          return;
        }
      }
      this.$refs.input.value = '';
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/item/' + this.username + '/' + this.name, {
          method: 'POST',
          body: JSON.stringify({ name: text, done: false }),
          headers: {
            'Content-type': 'application/json'
          }
        }));
        if (response.ok) {
          this.$set(this.listitems, this.listitems.length, { name: text, done: false });
        } else {
          const error = await response.json();
          this.message = 'Http-error: ' + response.status + ': \n' + error.error;
          this.openAlertWindow = true;
        }
      } catch (error) {
        this.message = error.message;
        this.openAlertWindow = true;
      }
    },
    async updateItem (itemname) {
      let updatedItem = {};
      for (let i = 0; i < this.listitems.length; i++) {
        if (this.listitems[i].name === itemname) {
          updatedItem = this.listitems[i];
        }
      }
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/item/' + this.username + '/' + this.name + '/' + updatedItem.name, {
          method: 'PUT',
          body: JSON.stringify(updatedItem),
          headers: {
            'Content-type': 'application/json'
          }
        }));
        if (!response.ok) {
          const error = await response.json();
          this.message = 'Http-error ' + response.status + ': \n' + error.error;
          this.openAlertWindow = true;
          if (updatedItem.done) {
            updatedItem.done = false;
          } else {
            updatedItem.done = true;
          }
        }
      } catch (error) {
        this.message = error.message;
        this.openAlertWindow = true;
      }
    },
    editListName () {
      this.openEditListNameModal = true;
    },
    confirmEditListName () {
      const newname = this.$refs.newListName.value;
      this.$refs.newListName.value = '';
      if (newname === null || newname === '') {
        this.message = 'Name is empty!';
        this.openAlertWindow = true;
        return;
      }
      this.openEditListNameModal = false;
      this.$emit('editListName', [this.name, newname]);
    },
    cancelEditListName () {
      this.openEditListNameModal = false;
    },
    editItemName (itemname) {
      this.editedItem = itemname;
      this.openEditItemNameModal = true;
    },
    async confirmEditItemName () {
      const oldName = this.editedItem;
      const newName = this.$refs.newItemName.value;
      this.$refs.newItemName.value = '';
      if (newName === null || newName === '') {
        this.message = 'Name is empty!';
        this.openAlertWindow = true;
        return;
      }
      let index = -1;
      let bool = false;
      for (let i = 0; i < this.listitems.length; i++) {
        if (this.listitems[i].name === newName) {
          this.message = 'Name is already in use!';
          this.openAlertWindow = true;
          return;
        }
        if (this.listitems[i].name === oldName) {
          index = i;
          bool = this.listitems[i].done;
        }
      }
      this.openEditItemNameModal = false;
      this.editedItem = '';
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/item/' + this.username + '/' + this.name + '/' + oldName, {
          method: 'PUT',
          body: JSON.stringify({ name: newName, done: bool }),
          headers: {
            'Content-type': 'application/json'
          }
        }));
        if (response.ok) {
          this.$set(this.listitems, index, { name: newName, done: bool });
        } else {
          const error = await response.json();
          this.message = 'Http-error ' + response.status + ': \n' + error.error;
          this.openAlertWindow = true;
        }
      } catch (error) {
        this.message = error.message;
        this.openAlertWindow = true;
      }
    },
    cancelEditItemName () {
      this.openEditItemNameModal = false;
    },
    deleteItem (itemname) {
      this.editedItem = itemname;
      this.openConfirmDeleteItemModal = true;
    },
    async confirmDeleteItem () {
      const itemname = this.editedItem;
      this.openConfirmDeleteItemModal = false;
      this.editedItem = '';
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/item/' + this.username + '/' + this.name + '/' + itemname, {
          method: 'DELETE',
        }));
        if (response.ok) {
          for (let i = 0; i < this.listitems.length; i++) {
            if (this.listitems[i].name === itemname) {
              this.listitems.splice(i, 1);
              break;
            }
          }
        } else {
          const error = await response.json();
          this.message = 'Http-error ' + response.status + ': \n' + error.error;
          this.openAlertWindow = true;
        }
      } catch (error) {
        this.message = error.message;
        this.openAlertWindow = true;
      }
    },
    cancelDeleteItem () {
      this.openConfirmDeleteItemModal = false;
    },
    deleteList () {
      this.openConfirmDeleteListModal = true;
    },
    confirmDeleteList () {
      this.openConfirmDeleteListModal = false;
      this.$emit('deleteList', this.name);
    },
    cancelDeleteList () {
      this.openConfirmDeleteListModal = false;
    },
    closeAlertWindow () {
      this.openAlertWindow = false;
      this.message = '';
    },
    timeout (ms, promise) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Error: request timed out'));
        }, ms);
        promise.then(resolve, reject);
      });
    }
  },
  computed: {
    percentage () {
      let count = 0;
      if (this.listitems.length === 0) {
        return 0;
      }
      for (let i = 0; i < this.listitems.length; i++) {
        if (this.listitems[i].done === true) {
          count++;
        }
      }
      return Math.floor(count / this.listitems.length * 100);
    }
  },
  data () {
    return {
      listitems: this.items,
      listname: this.name,
      openConfirmDeleteListModal: false,
      openEditListNameModal: false,
      openAlertWindow: false,
      openEditItemNameModal: false,
      editedItem: '',
      openConfirmDeleteItemModal: false,
      message: '',
    };
  }
};
</script>

<style scoped>

:focus {
  box-shadow: 0 0 1pt 0.5pt black;
}

.listcontainer {
  border-radius: 10px;
  border-style: double;
  min-width: auto;
  min-height: auto;
  max-width: 400px;
  overflow-wrap: break-word;
  margin: 20px;
  margin-bottom: 5px;
  padding: 0px;
  background-color: white;
}

@media (max-width: 800px) , (orientation: portrait) {
  .listcontainer {
    width: 250px;
    height: auto;
  }
}

h1 {
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 5px;
}

ul {
  list-style-type:none;
  border-top: 3px solid black;
  border-bottom: 3px solid black;
  padding: 0px;
  margin: 0px;
  padding-bottom: 10px;
  padding-top: 10px;
}

li {
  margin-left: 20px;
  margin-right: 2px;
  display: flex;
  justify-content: space-between;
}

.editItemButtons {
  margin-left: 5px;
}

.editItemButtons button {
  border-radius: 5px;
  border: 1px solid black;
  padding: 4px;
  background-color: white;
}

.top {
  margin: 0px;
  padding: 0px;
}
.bottom {
  margin: 10px;
  padding-bottom: 30px;
}

.addItem {
  padding: 5px;
  float:left;
  border: 1px solid;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  width: 65%;
}

.checked {
  text-decoration: line-through;
}
.addButton {
  float: left;
  padding: 5px;
  border: 1px solid;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  background-color: #56E939;
  width: 25%;
}

.deleteButton {
  padding:5px;
  border: 1px solid;
  border-radius: 10px;
}

.editButton {
  border: 1px solid;
  border-radius: 10px;
  padding: 5px;
}

.editNameInput {
  padding: 5px;
  margin: 5px;
  margin-bottom: 10px;
}

.deleteItemButton {
  color: red;
}

</style>
