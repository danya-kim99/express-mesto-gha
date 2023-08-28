const mongoose = require('mongoose');
const Card = require('../models/card');

const isValidFormat = mongoose.Types.ObjectId.isValid;

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ _id: card._id }))
    .catch((err) => res.status(400).send({ message: err.message }));
};

module.exports.deleteCard = (req, res) => {
  if (!isValidFormat(req.params.cardId)) {
    res.status(400).send({ message: 'Переданный идентификатор карточки некорректен' });
  }
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card === null) {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(400).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  if (!isValidFormat(req.params.cardId)) {
    res.status(400).send({ message: 'Переданный идентификатор карточки некорректен' });
  }
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(400).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.send(card);
      }
    })
    .catch(() => res.status(400).send({ message: 'На сервере произошла ошибка' }));
};
