import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/* Schema for the User model */
const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  workouts: [{ type: Schema.Types.ObjectId, ref: 'Workout' }],
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  userType: { type: String },
  phone: { type: String },
  ergTotal: { type: Number, default: 0 },
  rowTotal: { type: Number, default: 0 },
  runTotal: { type: Number, default: 0 },
  bikeTotal: { type: Number, default: 0 },
  position: { type: String },
  height: { type: Number },
  weight: { type: Number },
  classYear: { type: Number },
});

UserSchema.set('toJSON', {
  virtuals: true,
});

UserSchema.pre('save', function hashPassword(next) {
  const user = this;

  // exit the function if the password hasn't been changed
  if (!user.isModified('password')) return next();

  // generate the salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // hash the user's password with the salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // replace the existing plaintext password with the hash
      user.password = hash;

      // proceed
      next();
    });
  });
});

/* Check the hash of a candidate password against the stored password hash */
UserSchema.methods.validatePassword = function validatePassword(candidate, callback) {
  bcrypt.compare(candidate, this.password, (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
