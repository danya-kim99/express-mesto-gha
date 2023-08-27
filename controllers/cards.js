const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка"}))
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link })
    .then(card => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка"}))
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params._id)
    .then(card => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка"}))
};

