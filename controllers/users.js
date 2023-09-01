const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const NoRightsError = require('../errors/no-rights-err');
const BadRequestError = require('../errors/bad-request-err');
const AlreadyExistError = require('../errors/already-exist-err');

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
    email, password, name, about, avatar,
  } = req.body;

  if (!password) {
    throw new BadRequestError('Невалидные параметры запроса');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }), { runValidators: true })
    .then((user) => res.status(201).send({ _id: user._id }))
    .catch((err) => {
      if (err.code === 11000) {
        throw new AlreadyExistError('Пользователь с таким email уже существует');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Невалидные параметры запроса');
      }
    })
    .catch(next);
};

module.exports.patchUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (req.user._id !== user._id) {
        throw new NoRightsError('Вы не можете редактировать профиль другого пользователя');
      } else {
        res.send({ data: user });
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
      if (req.user._id !== user._id) {
        throw new NoRightsError('Вы не можете редактировать профиль другого пользователя');
      } else {
        res.send({ avatar: user.avatar });
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
      const token = jwt.sign({ _id: user._id }, '67bee4de13ac5c802aaa75ceea5f9db72ca74d5836ad4c74eb2f25780ece1a33', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      }).send({ token });
    })
    .catch(next);
};
