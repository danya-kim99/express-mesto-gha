const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then(cards => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: "На сервере произошла ошибка" }))
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send(card._id))
    .catch((err) => res.status(400).send({ message: err.message }))
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params._id)
    .then(card => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: "На сервере произошла ошибка" }))
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
.then(card => res.send(card))
.catch(() => res.status(500).send({ message: "На сервере произошла ошибка" }))}

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
.then(card => res.send(card))
.catch(() => res.status(500).send({ message: "На сервере произошла ошибка" }))}

