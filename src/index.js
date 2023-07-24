const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username) 

  if(!user) {
    return response.status(400).json({error: "User not found"})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (!name || !username) {
    return response.json({message: "Preencha todos os dados!"})  
  }

  if (users.length == 0) {
    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
      })

      return response.json({message: "Usuario Cadastrado com Sucesso!"})
  } else {
    const usernameInArrayUsers = users.some((user) => user.username === username);
    if (usernameInArrayUsers) {
      return response.json({message: "Username já em uso!"})
    }

    users.push({
      id: uuidv4(),
      name,
      username,
      todos: []
    })

    return response.json({message: "Usuario Cadastrado com Sucesso!"})
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request 
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request 

  const { title, deadline } = request.body

  if (!title || !deadline) {
    return response.json({error: "Preencha todos os campos"})
  }

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date() 
  })

  return response.json({message: "Todo Criado com Sucesso"})
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { title, deadline } = request.body

  if (!title || !deadline) {
    return response.json({message: "Nenhum dado alterado"}) 
  }

  if (title) {
    user.title = title
  }

  if(deadline) {
    user.deadline = deadline
  }

  return response.status(201).json({message: "Todo Atualizado com Sucesso"})
});

app.patch('/todos/:id/done', (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  
  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
})


module.exports = app;