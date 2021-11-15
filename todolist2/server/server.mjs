import express from 'express';
import baseFs from 'fs';
import cors from 'cors';

const fs = baseFs.promises;

const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../client/dist'));

let users = [];

async function loadData() {
  try {
    const content = await fs.readFile('data/database.json');
    users = JSON.parse(content);
    return users;
  } catch (error) {
    throw new Error('Could not load data from database');
  }
}

app.get('/api/list/:username', async (req, res) => {
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty' });
	return;
  }
  for (let i = 0; i < users.length; i++) {
    if (users[i].user === req.params.username) {
      const lists = users[i].lists;
      res.send(lists);
      return;
    }
  }
  res.status(400).send({ 'error': 'Username not in database' });
});

app.post('/api/list/:username', async (req, res) => {
  if (req.body === undefined || req.body === null) {
    res.status(400).send({ 'error': 'JSON is empty or null' });
    return;
  }
  if (req.body.name === undefined || req.body.name === null || req.body.name === '') {
    res.status(400).send({ 'error': 'JSON: List name not found in body' });
    return;
  }
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  try {
    let userFound = false;
    const listname = req.body.name;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        for (let j = 0; j < users[i].lists.length; j++) {
          if (users[i].lists[j].name === listname) {
            res.status(400).send({ 'error': 'Name already in use' });
            return;
          }
        }
        users[i].lists.push({ name: listname, items: [] });
        userFound = true;
		break;
      }
    }
    if (userFound) {
      await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
      res.send('New list saved.');
    } else {
      res.status(400).send({ 'error': 'Username not in database' });
    }
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});

app.patch('/api/list/:username/:listname', async (req, res) => {
  if (req.body === undefined || req.body === null) {
    res.status(400).send({ 'error': 'JSON is empty or null' });
    return;
  }
  if (req.body.name === undefined || req.body.name === null || req.body.name === '') {
    res.status(400).send({ 'error': 'JSON: List name not found in body' });
    return;
  }
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  if (req.params.listname === null || req.params.listname === '') {
    res.status(400).send({ 'error': 'List name is empty or null' });
    return;
  }
  try {
    let userFound = false;
    let listFound = false;
    const newlistname = req.body.name;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        userFound = true;
        for (let j = 0; j < users[i].lists.length; j++) {
          if (users[i].lists[j].name === newlistname) {
            res.status(400).send({ 'error': 'Name is already in use' });
            return;
          }
        }
        for (let j = 0; j < users[i].lists.length; j++) {
          if (users[i].lists[j].name === req.params.listname) {
            listFound = true;
            users[i].lists[j].name = newlistname;
          }
        }
      }
    }
    if (!userFound) {
      res.status(400).send({ 'error': 'Username not in database' });
      return;
    }
    if (!listFound) {
      res.status(400).send({ 'error': 'List name not in database' });
      return;
    }
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
	res.send('New list name saved.');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});

app.delete('/api/list/:username/:listname', async (req, res) => {
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  if (req.params.listname === null || req.params.listname === '') {
    res.status(400).send({ 'error': 'List name is empty or null' });
    return;
  }
  try {
    let userFound = false;
    let listFound = false;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        userFound = true;
        for (let j = 0; j < users[i].lists.length; j++) {
          if (users[i].lists[j].name === req.params.listname) {
            listFound = true;
            users[i].lists.splice(j, 1);
          }
        }
      }
    }
    if (!userFound) {
      res.status(400).send({ 'error': 'Username not in database' });
      return;
    }
    if (!listFound) {
      res.status(400).send({ 'error': 'List name not in database' });
      return;
    }
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
	res.send('List deleted');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});

app.post('/api/item/:username/:listname', async (req, res) => {
  if (req.body === undefined || req.body === null) {
    res.status(400).send({ 'error': 'JSON is empty or null' });
    return;
  }
  if (req.body.name === undefined || req.body.name === null || req.body.name === '') {
    res.status(400).send({ 'error': 'JSON: Item name not found in body' });
    return;
  }
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  if (req.params.listname === null || req.params.listname === '') {
    res.status(400).send({ 'error': 'List name is empty or null' });
    return;
  }
  try {
    let userFound = false;
    let listFound = false;
    const item = req.body;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        userFound = true;
        for (let j = 0; j < users[i].lists.length; j++) {
          if (users[i].lists[j].name === req.params.listname) {
            listFound = true;
            for (let k = 0; k < users[i].lists[j].items[k].length; k++) {
              if (users[i].lists[j].items[k].name === item.name) {
                res.status(400).send({ 'error': 'Name is already in use' });
                return;
              }
            }
            users[i].lists[j].items.push(item);
          }
        }
      }
    }
    if (!userFound) {
      res.status(400).send({ 'error': 'Username not in database' });
      return;
    }
    if (!listFound) {
      res.status(400).send({ 'error': 'List name not in database' });
      return;
    }
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
    res.send('Item added');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});

app.put('/api/item/:username/:listname/:itemname', async (req, res) => {
  if (req.body === undefined || req.body === null) {
    res.status(400).send({ 'error': 'JSON is empty or null' });
    return;
  }
  if (req.body.name === undefined || req.body.name === null || req.body.name === '' 
    || req.body.done === undefined || req.body.done === null || req.body.done === '') {
    res.status(400).send({ 'error': 'JSON: item.name or item.done not found in body' });
    return;
  }
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  if (req.params.listname === null || req.params.listname === '') {
    res.status(400).send({ 'error': 'List name is empty or null' });
    return;
  }
  try {
    let userFound = false;
    let listFound = false;
    let itemFound = false;
    const newitem = req.body;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        userFound = true;
        for (let j = 0; j < users[i].lists.length; j++) {
          if (users[i].lists[j].name === req.params.listname) {
            listFound = true;
            for (let k = 0; k < users[i].lists[j].items.length; k++) {
              if (users[i].lists[j].items[k].name === newitem.name) {
                res.status(400).send({ 'error': 'Name is already in use' });
                return;
              }
            }
            for (let k = 0; k < users[i].lists[j].items.length; k++) {
              if (users[i].lists[j].items[k].name === req.params.itemname) {
                itemFound = true;
                users[i].lists[j].items[k] = newitem;
              }
            }
          }
        }
      }
    }
    if (!userFound) {
      res.status(400).send({ 'error': 'Username not in database' });
      return;
    }
    if (!listFound) {
      res.status(400).send({ 'error': 'List name not in database' });
      return;
    }
    if (!itemFound) {
      res.status(400).send({ 'error': 'Item name not in database' });
      return;
    }
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
    res.send('Item updated');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});

app.delete('/api/item/:username/:listname/:itemname', async (req, res) => {
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  if (req.params.listname === null || req.params.listname === '') {
    res.status(400).send({ 'error': 'List name is empty or null' });
    return;
  }
  if (req.params.itemname === null || req.params.itemname === '') {
    res.status(400).send({ 'error': 'Item name is empty or null' });
    return;
  }
  try {
  let userFound = false;
  let listFound = false;
  let itemFound = false;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        userFound = true;
        for (let j = 0; j < users[i].lists.length; j++) {
          if (users[i].lists[j].name === req.params.listname) {
            listFound = true;
            for (let k = 0; k < users[i].lists[j].items.length; k++) {
              if (users[i].lists[j].items[k].name === req.params.itemname) {
                itemFound = true;
                users[i].lists[j].items.splice(k, 1);
              }
            }
          }
        }
      }
    }
    if (!userFound) {
      res.status(400).send({ 'error': 'Username not in database' });
      return;
    }
    if (!listFound) {
      res.status(400).send({ 'error': 'List name not in database' });
      return;
    }
    if (!itemFound) {
      res.status(400).send({ 'error': 'Item name not in database' });
      return;
    }
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
    res.send('Item deleted');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});

app.get('/api/user', async (req, res) => {
  try {
    users = await loadData();
    const userarray = [];
    for (let i = 0; i < users.length; i++) {
      userarray.push({ user: users[i].user });
    }
    res.send(userarray);
  } catch(error) {
    res.status(500).send({ 'error': error.message });
  }
});

app.post('/api/user', async (req, res) => {
  if (req.body === undefined || req.body === null) {
    res.status(400).send({ 'error': 'JSON is empty or null' });
    return;
  }
  if (req.body.user === undefined || req.body.user === null || req.body.user === '') {
    res.status(400).send({ 'error': 'JSON: User attribute user not found in body' });
    return;
  }
  try {
    const newusername = req.body.user;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === newusername) {
        res.status(400).send({ 'error': 'Name already in use' });
        return;
      }
    }
    users.push({ user: newusername, lists: [] });
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
	res.send('user added');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});

app.patch('/api/user/:username', async (req, res) => {
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  if (req.body === undefined || req.body === null) {
    res.status(400).send({ 'error': 'JSON is empty or null' });
    return;
  }
  if (req.body.user === undefined || req.body.user === null || req.body.user === '') {
    res.status(400).send({ 'error': 'JSON: User attribute user not found in body' });
    return;
  }
  try {
    let userFound = false;
    const newusername = req.body.user;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === newusername) {
        res.status(400).send({ 'error': 'Name already in use' });
        return;
      }
    }
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        userFound = true;
        users[i].user = newusername;
      }
    }
    if (!userFound) {
      res.status(400).send({ 'error': 'Username not in database' });
      return;
    }
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
    res.send('user updated');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
 }
});

app.delete('/api/user/:username', async (req, res) => {
  if (req.params.username === null || req.params.username === '') {
    res.status(400).send({ 'error': 'Username is empty or null' });
    return;
  }
  try {
    let userFound = false;
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === req.params.username) {
        userFound = true;
        users.splice(i, 1);
      }
    }
    if (!userFound) {
      res.status(400).send({ 'error': 'Username not in database' });
      return;
    }
    await fs.writeFile('data/database.json', JSON.stringify(users, null, '\t'));
    res.send('user deleted');
  } catch (error) {
    res.status(500).send({ 'error': 'Could not write to database' });
  }
});


app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});