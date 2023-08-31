const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const NoRightsError = require('../errors/no-rights-err');
const BadRequestError = require('../errors/bad-request-err');
const AlreadyExistError = require('../errors/already-exist-err');

const { JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users) {
        throw new NotFoundError('Пользователи не найдены');
      }
      res.send(users);
    })
    .catch(next);
};

module.exports.getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с данным id не найден');
      }
      res.send({ name: user.name, about: user.about, avatar: user.avatar });
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NonExistentId'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NonExistentId') {
        throw new NotFoundError('Пользователь с данным id не найден');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Невалидные параметры запроса');
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({ _id: user._id }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new AlreadyExistError('Пользователь с таким email уже существует');
      }
    })
    .catch(next);
};

module.exports.patchUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (req.user._id === user._id) {
        res.send({ data: user });
      } else {
        throw new NoRightsError('Вы не можете редактировать профиль другого пользователя');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Невалидные параметры запроса');
      }
    })
    .catch(next);
};

module.exports.patchAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (req.user._id === user._id) {
        res.send({ avatar: user.avatar });
      } else {
        throw new NoRightsError('Вы не можете редактировать профиль другого пользователя');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Ошибка валидации, неправильный формат URL');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      }).send({ token });
    })
    .catch((err) => {
      next(err);
    });
};
