const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const authorize = require('../middleware/auth');
const userSchema = require('../models/users');



router.post('/signin-user', (req, res, next) => {
    let getUser;
    userSchema
      .findOne({
        email: req.body.email,
      })
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            message: 'Authentication failed',
          });
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
      })
      .then((response) => {
        if (!response) {
          return res.status(401).json({
            message: 'Authentication failed',
          });
        }
        let jwtToken = jwt.sign(
          {
            email: getUser.email,
            userId: getUser._id,
          },
          'longer-secret-is-better',
          {
            expiresIn: '1h',
          }
        );
        res.status(200).json({
          token: jwtToken,
          expiresIn: 3600,
          msg: getUser,
        });
      })
      .catch((err) => {
        return res.status(401).json({
          message: 'Authentication failed',
        });
      });
  });

  // Signup User
router.post(
    '/register-user',
(req, res, next) => {
      {
        bcrypt.hash(req.body.password, 10).then((hash) => {
          const user = new userSchema({
            name: req.body.name,
            email: req.body.email,
            password: hash,
          });
          user
            .save()
            .then((response) => {
              res.status(201).json({
                message: 'User successfully created!',
                result: response,
              });
            })
            .catch((error) => {
              res.status(500).json({
                error: error,
              });
            });
        });
      }
    }
  );

  router.route('/all-user').get(authorize, (req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})



  module.exports = router;