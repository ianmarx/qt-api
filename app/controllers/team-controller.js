import Team from '../models/team-model';
// import Workout from '../models/workout-model';
import User from '../models/user-model';

export const createTeam = (req, res, next) => {
  /* Get team info from user input */
  const name = req.body.name;
  const userId = req.body.userId;
  const userType = req.body.userType;

  /* Check for required fields */
  if (!name || !userId || !userType) {
    return res.status(422).send('All fields are required.');
  }

  /* Create team object and save to db */
  const team = new Team();

  team.name = name;

  if (userType === 'coach') {
    team.coaches.push(userId);
  } else {
    team.athletes.push(userId);
  }
  team.save()
  .then((result) => {
    User.findById(userId)
    .then((user) => {
      /* Add the team to the user document */
      user.team = result._id;
      user.save()
      .catch((error) => {
        res.status(500).json({ error });
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

export const joinTeam = (req, res) => {
  const name = req.body.name;
  const userId = req.body.userId;
  const userType = req.body.userType;

  /* Check for required fields */
  if (!name || !userId || !userType) {
    return res.status(422).send('All fields are required.');
  }

  Team.findOne({ name })
  .then((result) => {
    User.findById(userId)
    .then((user) => {
      user.team = result._id;
      user.save()
      .catch((error) => {
        res.status(500).json({ error });
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
    if (userType === 'coach') {
      result.coaches.push(userId);
    } else {
      result.athletes.push(userId);
    }
    result.save()
    .catch((error) => {
      res.status(500).json({ error });
    });
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

export const fetchUserTeam = (req, res) => {
  User.findById(req.params.userId)
  .populate({
    path: 'team',
    model: 'Team',
    populate: {
      path: 'athletes',
      model: 'User',
    },
  })
  .catch((error) => {
    res.status(500).json({ error });
  })
  .then((user) => {
    const userIsCoach = user.team.coaches.some((coach) => {
      return coach.equals(req.params.userId);
    });

    const teamObject = {
      team: user.team,
      isCoach: userIsCoach,
    };

    res.json(teamObject);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

export const checkTeamNameAvailability = (req, res) => {
  Team.findOne({ name: req.params.query })
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};

export const checkTeamCodeValidity = (req, res) => {
  Team.findOne({ teamCode: req.params.teamCode })
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
};
