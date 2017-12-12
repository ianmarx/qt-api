import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import User from '../models/user-model';

dotenv.config({ silent: true });

/* Create a user authentication token */
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}

/* Call when a user signs in */
export const signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user), id: req.user.id });
};

/* Call when a user signs up */
export const signup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(422).send('All fields are required.');
  }

  User.findOne({ email })
  .then((result) => {
    if (!result) {
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = password;
      user.save()
      .then((result2) => {
        res.send({ token: tokenForUser(user), id: result2._id });
      });
    } else {
      res.status(424).send('This email is already in use.');
    }
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

/* Call to fetch a user from the db */
export const fetchUser = (req, res) => {
  User.find({ _id: req.params.userId })
  .populate([{
    path: 'team',
    model: 'Team',
    populate: [{
      path: 'athletes',
      model: 'User',
    }, {
      path: 'workouts',
      model: 'Workout',
    }, {
      path: 'teamWorkouts',
      model: 'Workout',
    }],
  }, {
    path: 'workouts',
    model: 'Workout',
  }])
  .catch((error) => {
    res.status(500).json({ error });
  })
  .then((result) => {
    res.json(result[0]);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

/* Call to fetch all users from the db */
export const fetchAllUsers = (req, res) => {
  User.find()
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

/* Call to update a user in the db */
export const updateUser = (req, res) => {
  User.findById(req.params.userId)
  .then((result) => {
    result.name = req.body.name || result.name;
    result.position = req.body.position || result.position;
    result.height = req.body.height || result.height;
    result.weight = req.body.weight || result.weight;
    result.classYear = req.body.classYear || result.classYear;
    result.save()
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

export const matchAthlete = (req, res) => {
  User.find({ name: new RegExp(req.params.query, 'i'), team: req.params.teamId })
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};
