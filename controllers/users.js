const User = require('../models/user');
const mongoose = require('mongoose');
const isValidFormat = mongoose.Types.ObjectId.isValid;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send(users))
    .catch(() => res.status(500).send({ message: "На сервере произошла ошибка" }))
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
    .then(user => {
      if (user === null) {
        res.status(404).send({ message: "Запрашиваемый пользователь не найден" })
      } else {
        res.send(user)
      }
    })
    .catch((err) => { res.status(400).send({ message: err.message}) })
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then(user => res.send(user))
    .catch((err) => {
      if (err.name = 'ValidationError') {
        res.status(400).send({ message: "Ошибка валидации" })
      } else {
        res.status(500).send({ message: "На сервере произошла ошибка" })
      }
    })
};

module.exports.patchUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true , runValidators: true})
    .then(user => res.send(user))
    .catch(() => res.status(400).send({ message: "На сервере произошла ошибка" }))
};

module.exports.patchAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true , runValidators: true})
    .then(user => res.send({avatar: user.avatar}))
    .catch(() => res.status(400).send({ message: "На сервере произошла ошибка" }))
};



