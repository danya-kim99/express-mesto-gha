const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }))
};

module.exports.getUser = (req, res) => {
  User.findOne(req.params._id)
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }))
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }))
};

module.exports.patchUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about })
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }))
};

module.exports.patchAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar })
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }))
};



