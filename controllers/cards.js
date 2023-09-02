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
        next(new BadRequestError('Невалидные параметры запроса'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new NotFoundError('Запрашиваемая карточка не найдена'))
    .then((card) => {
      if (req.user._id !== card.owner.toString()) {
        throw new NoRightsError('Вы не можете удалять карточки других пользователей');
      } else {
        return Card.findByIdAndRemove(req.params.cardId)
          .then((deletedCard) => {
            res.send({ message: `Карточка ${deletedCard._id} успешно удалена` });
          });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Запрашиваемая карточка не найдена, проверьте формат id'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFoundError('Запрашиваемая карточка не найдена'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Запрашиваемая карточка не найдена, проверьте формат id'));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFoundError('Запрашиваемая карточка не найдена'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Запрашиваемая карточка не найдена, проверьте формат id'));
      } else {
        next(err);
      }
    });
};
