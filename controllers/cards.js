const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const NoRightsError = require('../errors/no-rights-err');
const BadRequestError = require('../errors/bad-request-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ _id: card._id }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Невалидные параметры запроса');
      }
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NonExistentId'))
    .then((card) => {
      if (req.user._id === card.owner) {
        res.send({ data: card });
      } else {
        throw new NoRightsError('Вы не можете удалять карточки других пользователей');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Запрашиваемая карточка не найдена, проверьте формат id');
      } else if (err.message === 'NonExistentId') {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NonExistentId'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Запрашиваемая карточка не найдена, проверьте формат id');
      } else if (err.message === 'NonExistentId') {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NonExistentId'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Запрашиваемая карточка не найдена, проверьте формат id');
      } else if (err.message === 'NonExistentId') {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
    })
    .catch(next);
};
