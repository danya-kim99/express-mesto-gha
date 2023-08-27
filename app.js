const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000, BASE_PATH = `http://localhost:${PORT}`} = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '64ea11eb4274ec180cf9e258' // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/', require('./routes/users'));

app.listen(PORT, () => {
  console.log('Ссылка на сервер');
  console.log(BASE_PATH)
});
