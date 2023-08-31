const Card = require('../models/card');

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
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Ошибка валидации, неправильный формат параметров' });
      } else { res.status(500).send({ message: 'На сервере произошла ошибка' }); }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NonexistentId'))
    .then((card) => {
      if (req.user._id === card.owner) {
        res.send({ data: card });
      } else {
        throw new Error('NotYours');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена, проверьте формат id' });
      } else if (err.message === 'NonexistentId') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      } else if (err.message === 'NotYours') {
        res.status(403).send({ message: 'Вы не можете удалить карточку другого пользователя' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NonexistentId'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена, проверьте формат id' });
      } else if (err.message === 'NonexistentId') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NonexistentId'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Запрашиваемая карточка не найдена, проверьте формат id' });
      } else if (err.message === 'NonexistentId') {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
