<template>
  <div id="app">
    <header>
      <div class="userstext">
        <h1>USERS: </h1>
      </div>
      <div class="user" v-for="username in users" v-bind:key="username.user">
        <button class="usernamebutton" type="button" v-on:click="switchUser(username.user)" ref="switchUserButton">{{username.user}}</button>
      </div>
      <div class="user">
        <button class="userbutton" type="button" v-on:click="addUserPopUp">+ Add new user</button>
      </div>
    </header>
    <main>
      <Todolist v-for="(list) in currentUser.lists" v-bind:key="list.name" :name="list.name" :items="list.items" :username="currentUser.user" v-on:editListName="editListName" v-on:deleteList="deleteList"/>
      {{currentUser.lists.name}}
      <div class="addList">
        <button class="userbutton" type="button" v-on:click="addListPopUp">+ Add List</button>
      </div>
      <AddModal :active="openAddListWindow" v-on:confirm="addList" v-on:cancel="closeAddListWindow">
        <p> Add List: </p>
      </AddModal>
      <AddModal :active="openAddUserWindow" v-on:confirm="addUser" v-on:cancel="closeAddUserWindow">
        <p> Add User: </p>
      </AddModal>
      <ConfirmModal :active="openConfirmModal" v-on:confirm="confirmDeleteUser" v-on:cancel="cancelDeleteUser">
        <p> Are you sure you wish to delete this user? </p>
      </ConfirmModal>
      <ConfirmModal :active="openEditUsernameModal" v-on:confirm="confirmEditUsername" v-on:cancel="cancelEditUsername">
        <input type="text" class="editUsernameInput" ref="newUsername" placeholder="New name:">
      </ConfirmModal>
      <AlertModal :active="openAlertWindow" v-on:close="closeAlertWindow">
        <p> {{ message }} </p>
      </AlertModal>
    </main>
    <footer>
      <div class="currentUser">
        <p> Current user: {{this.currentUser.user}} </p>
        <button class="editUsernameButton" v-on:click="editUsername" type="button">Edit username</button>
        <button class="deleteUserButton" v-on:click="deleteUser" type="button">Delete this user</button>
      </div>
    </footer>
  </div>
</template>

<script>
import Todolist from './components/todolist.vue';
import AddModal from './components/addModal.vue';
import AlertModal from './components/alertModal.vue';
import ConfirmModal from './components/confirmModal.vue';
import { serverURL } from './config.js';
document.title = 'To-Do Lists';
export default {
  name: 'App',
  components: {
    Todolist,
    AddModal,
    AlertModal,
    ConfirmModal,
  },
  methods: {
    addUserPopUp () {
      this.openAddUserWindow = true;
    },
    async addUser (username) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].user === username) {
          this.message = 'User already exists!';
          this.openAlertWindow = true;
          return;
        }
      }
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/user', {
          method: 'POST',
          body: JSON.stringify({ user: username }),
          headers: {
            'Content-type': 'application/json'
          }
        }));
        if (response.ok) {
          this.users.push({ user: username, lists: [] });
          this.currentUserVariable = username;
          this.openAddUserWindow = false;
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
    switchUser (newCurrentUsername) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].user === newCurrentUsername) {
          this.currentUserVariable = this.users[i].user;
        }
      }
    },
    editUsername () {
      this.openEditUsernameModal = true;
    },
    async confirmEditUsername () {
      const newName = this.$refs.newUsername.value;
      this.$refs.newUsername.value = '';
      let oldIndex = -1;
      if (newName === null || newName === '') {
        this.message = 'Name is empty!';
        this.openAlertWindow = true;
        return;
      }
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].user === this.currentUser.user) {
          oldIndex = i;
        }
        if (this.users[i].user === newName) {
          this.message = 'Name is already in use!';
          this.openAlertWindow = true;
          return;
        }
      }
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/user/' + this.currentUser.user, {
          method: 'PATCH',
          body: JSON.stringify({ user: newName }),
          headers: {
            'Content-type': 'application/json'
          }
        }));
        if (response.ok) {
          this.users[oldIndex].user = newName;
          this.currentUserVariable = newName;
          this.openEditUsernameModal = false;
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
    cancelEditUsername () {
      this.openEditUsernameModal = false;
    },
    addListPopUp () {
      this.openAddListWindow = true;
    },
    async addList (listname) {
      for (let i = 0; i < this.currentUser.lists.length; i++) {
        if (this.currentUser.lists[i].name === listname) {
          this.message = 'Name is already in use!';
          this.openAlertWindow = true;
          return;
        }
      }
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/list/' + this.currentUser.user, {
          method: 'POST',
          body: JSON.stringify({ name: listname }),
          headers: {
            'Content-type': 'application/json'
          }
        }));
        if (response.ok) {
          this.currentUser.lists.push({ name: listname, items: [] });
          this.openAddListWindow = false;
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
    async editListName (names) {
      const oldName = names[0];
      const newName = names[1];
      console.log('old name: ' + oldName + ' new name: ' + newName);
      let oldIndex = -1;
      for (let i = 0; i < this.currentUser.lists.length; i++) {
        if (this.currentUser.lists[i].name === newName) {
          this.message = 'Name is already in use!';
          this.openAlertWindow = true;
          return;
        }
        if (this.currentUser.lists[i].name === oldName) {
          oldIndex = i;
        }
      }
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/list/' + this.currentUser.user + '/' + oldName, {
          method: 'PATCH',
          body: JSON.stringify({ name: newName }),
          headers: {
            'Content-type': 'application/json'
          }
        }));
        if (response.ok) {
          this.currentUser.lists[oldIndex].name = newName;
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
    async deleteList (name) {
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/list/' + this.currentUser.user + '/' + name, {
          method: 'DELETE',
        }));
        if (response.ok) {
          for (let i = 0; i < this.currentUser.lists.length; i++) {
            if (this.currentUser.lists[i].name === name) {
              this.currentUser.lists.splice(i, 1);
              break;
            }
          }
        } else {
          const error = await response.json();
          console.log(error.error);
          this.message = 'Http-error ' + response.status + ': \n' + error.error;
          this.openAlertWindow = true;
        }
      } catch (error) {
        this.message = error.message;
        this.openAlertWindow = true;
      }
    },
    deleteUser () {
      this.openConfirmModal = true;
    },
    async confirmDeleteUser () {
      try {
        const response = await this.timeout(5000, fetch(serverURL + '/api/user/' + this.currentUser.user, {
          method: 'DELETE',
        }));
        if (response.ok) {
          for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].user === this.currentUser.user) {
              this.currentUserVariable = this.users[0].user;
              this.users.splice(i, 1);
              break;
            }
          }
          this.openConfirmModal = false;
        } else {
          const error = await response.json();
          this.openConfirmModal = false;
          this.message = 'Http-error ' + response.status + ': \n' + error.error;
          this.openAlertWindow = true;
        }
      } catch (error) {
        this.message = error.message;
        this.openAlertWindow = true;
      }
    },
    cancelDeleteUser () {
      this.openConfirmModal = false;
    },
    closeAddListWindow () {
      this.openAddListWindow = false;
    },
    closeAddUserWindow () {
      this.openAddUserWindow = false;
    },
    closeAlertWindow () {
      this.message = '';
      this.openAlertWindow = false;
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
  data () {
    return {
      users: [],
      hasLoaded: false,
      currentUserVariable: 'default',
      openAddListWindow: false,
      openAddUserWindow: false,
      openAlertWindow: false,
      openConfirmModal: false,
      openEditUsernameModal: false,
      message: ''
    };
  },
  computed: {
    currentUser () {
      if (!this.hasLoaded) {
        return { user: 'default', lists: [] };
      }
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].user === this.currentUserVariable) {
          return this.users[i];
        }
      }
      return this.users[0];
    },
  },
  async mounted () {
    try {
      const response = await this.timeout(5000, fetch(serverURL + '/api/user'));
      if (response.ok) {
        const data = await response.json();
        for (let i = 0; i < data.length; i++) {
          this.users.push({ user: data[i].user, lists: [] });
        }
      } else {
        const error = await response.json();
        this.message = 'Http-error ' + response.status + ': \n' + error.error;
        this.openAlertWindow = true;
        return;
      }
      for (let i = 0; i < this.users.length; i++) {
        const res = await this.timeout(5000, fetch(serverURL + '/api/list/' + this.users[i].user));
        if (res.ok) {
          const getLists = await res.json();
          this.users[i].lists = getLists;
        } else {
          const error = await res.json();
          this.message = 'Http-error ' + res.status + ': \n' + error.error;
          this.openAlertWindow = true;
          return;
        }
      }
      this.hasLoaded = true;
    } catch (error) {
      this.message = error.message;
      this.openAlertWindow = true;
    }
  }
};
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  left: 0;
  top: 0;
  min-height: 100%;
  height: auto;
  width: 100%;
  background-color: #bbbbbb;
}

:focus {
  border: 3px solid black;
}

.userbutton:focus {
  box-shadow: 0 0 1pt 0.5pt black;
}

header {
  position: relative;
  left: 0;
  top: 0;
  background-color: #333333;
  margin-top: 0px;
  margin-bottom: 5px;
  padding-bottom: 0px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  height: auto;
}

.userstext {
  color: #eeeeee;
  border: 2px solid black;
  height: auto;
  width: 20%;
  padding-left: 5px;
  padding-right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user {
  border: 2px solid gray;
  min-height: 50px;
  max-height: auto;
  padding: 0px;
  margin: 0px;
}
.userbutton {
  min-height: 100%;
  max-height: auto;
  margin-left: 0px;
}

.usernamebutton {
  max-width: 200px;
  overflow-wrap: break-word;
  min-height: 100%;
  max-height: auto;
  margin-left: 1px;
  background-color: #4AC731;
}

html, body {
  height: 100%;
}

.currentUser {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.currentUser > p {
  margin: 10px;
}

.addList {
  margin: 30px;
}

.addList > Button {
  height: 100%;
  border: 2px solid gray;
  border-radius: 10px;
  padding: 10px;
}

main {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 50px;
  margin-left: 30px;
}

footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: #303030;
  color: white;
  text-align: center;
}

.deleteUserButton {
  color: #cc0000;
}
.editUsernameButton {
  margin-left: 20px;
}

.editUsernameInput {
  padding: 5px;
  margin: 5px;
  margin-bottom: 10px;
}

@media (max-width: 800px) , (orientation: portrait) {
  #app {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: center;
  }
  .userstext {
    min-width: 20%;
    width: auto;
    padding-left: 10px;
    padding-right: 10px;
    margin: 0px;
    border: none;
  }
  .userstext > h1 {
    font-size: 25px;
  }
  .usernamebutton {
    max-width: 100px;
  }
  main {
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    margin: 20px;
    margin-bottom: 50px;
  }
}

</style>
