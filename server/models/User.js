// // const mongoose = require('mongoose');
// // const bcrypt = require('bcryptjs');

// // const userSchema = new mongoose.Schema({
// //   // Basic Info
// //   name: {
// //     type: String,
// //     required: [true, 'Please provide a name'],
// //     trim: true
// //   },
// //   email: {
// //     type: String,
// //     required: [true, 'Please provide an email'],
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
// //   },
// //   password: {
// //     type: String,
// //     required: function() {
// //       return this.authProvider === 'local';
// //     },
// //     minlength: [6, 'Password must be at least 6 characters'],
// //     select: false // Don't return password by default
// //   },
// //   phone: {
// //     type: String,
// //     required: [true, 'Please provide a phone number'],
// //     match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number']
// //   },
  
// //   // Role & Auth
// //   role: {
// //     type: String,
// //     enum: ['donor', 'patient', 'hospital'],
// //     required: [true, 'Please select a role']
// //   },
// //   authProvider: {
// //     type: String,
// //     enum: ['local', 'google'],
// //     default: 'local'
// //   },
// //   googleId: {
// //     type: String,
// //     sparse: true
// //   },
  
// //   // Location (Manual Entry)
// //   location: {
// //     address: {
// //       type: String,
// //       required: [true, 'Please provide an address']
// //     },
// //     city: {
// //       type: String,
// //       required: [true, 'Please provide a city']
// //     },
// //     state: {
// //       type: String,
// //       required: [true, 'Please provide a state']
// //     },
// //     pincode: {
// //       type: String,
// //       required: [true, 'Please provide a pincode'],
// //       match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
// //     },
// //     coordinates: {
// //       latitude: Number,
// //       longitude: Number
// //     }
// //   },
  
// //   // Donor-Specific Fields
// //   bloodType: {
// //     type: String,
// //     enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
// //     required: function() {
// //       return this.role === 'donor';
// //     }
// //   },
// //   available: {
// //     type: Boolean,
// //     default: true,
// //     required: function() {
// //       return this.role === 'donor';
// //     }
// //   },
// //   lastDonationDate: {
// //     type: Date,
// //     default: null
// //   },
  
// //   // Hospital-Specific Fields
// //   hospitalName: {
// //     type: String,
// //     required: function() {
// //       return this.role === 'hospital';
// //     }
// //   },
// //   registrationNumber: {
// //     type: String,
// //     required: function() {
// //       return this.role === 'hospital';
// //     }
// //   },
  
// //   // Common Fields
// //   profilePicture: {
// //     type: String,
// //     default: null
// //   },
// //   isActive: {
// //     type: Boolean,
// //     default: true
// //   },
  
// // }, {
// //   timestamps: true
// // });

// // // Hash password before saving
// // userSchema.pre('save', async function(next) {
// //   if (!this.isModified('password') || !this.password) {
// //     return next();
// //   }
  
// //   const salt = await bcrypt.genSalt(10);
// //   this.password = await bcrypt.hash(this.password, salt);
// //   next();
// // });

// // // Compare password method
// // userSchema.methods.comparePassword = async function(candidatePassword) {
// //   return await bcrypt.compare(candidatePassword, this.password);
// // };

// // // Check if donor can donate (90 days gap)
// // userSchema.methods.canDonate = function() {
// //   if (this.role !== 'donor') return false;
// //   if (!this.lastDonationDate) return true;
  
// //   const daysSinceLastDonation = Math.floor(
// //     (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
// //   );
  
// //   return daysSinceLastDonation >= 90;
// // };

// // // Get user without sensitive data
// // userSchema.methods.toJSON = function() {
// //   const user = this.toObject();
// //   delete user.password;
// //   delete user.__v;
// //   return user;
// // };

// // module.exports = mongoose.model('User', userSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//     },

//     password: {
//       type: String,
//       required: function () {
//         return this.authProvider === 'local'; // Only required for local auth
//       },
//       minlength: 6,
//       select: false,
//     },

//     phone: {
//       type: String,
//       required: function () {
//         return this.authProvider === 'local'; // Only required initially for local
//       },
//       match: /^[6-9]\d{9}$/,
//     },

//     role: {
//       type: String,
//       enum: ['donor', 'patient', 'hospital'],
//       required: true,
//     },

//     authProvider: {
//       type: String,
//       enum: ['local', 'google'],
//       default: 'local',
//     },

//     googleId: {
//       type: String,
//       sparse: true, // Allows null/undefined, but must be unique if present
//       unique: true,
//     },

//     location: {
//       address: {
//         type: String,
//         required: function () {
//           return this.authProvider === 'local';
//         },
//       },
//       city: {
//         type: String,
//         required: function () {
//           return this.authProvider === 'local';
//         },
//       },
//       state: {
//         type: String,
//         required: function () {
//           return this.authProvider === 'local';
//         },
//       },
//       pincode: {
//         type: String,
//         required: function () {
//           return this.authProvider === 'local';
//         },
//         match: /^\d{6}$/,
//       },
//       coordinates: {
//         latitude: Number,
//         longitude: Number,
//       },
//     },

//     // ... rest of your schema remains the same
//     bloodType: {
//       type: String,
//       enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
//       required: function () {
//         return this.role === 'donor';
//       },
//     },

//     available: {
//       type: Boolean,
//       default: true,
//       required: function () {
//         return this.role === 'donor';
//       },
//     },

//     lastDonationDate: {
//       type: Date,
//       default: null,
//     },

//     hospitalName: {
//       type: String,
//       required: function () {
//         return this.role === 'hospital';
//       },
//     },

//     registrationNumber: {
//       type: String,
//       required: function () {
//         return this.role === 'hospital';
//       },
//     },

//     profilePicture: {
//       type: String,
//       default: null,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     // ADD THIS FIELD
//     profileComplete: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// // Update pre-save hook to handle Google OAuth
// userSchema.pre('save', async function (next) {
//   // Only hash password if it exists and is modified
//   if (!this.isModified('password') || !this.password) return next();
  
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Rest of your methods remain the same
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// userSchema.methods.canDonate = function () {
//   if (this.role !== 'donor') return false;
//   if (!this.lastDonationDate) return true;

//   const days = Math.floor(
//     (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
//   );

//   return days >= 90;
// };

// userSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   delete user.__v;
//   return user;
// };

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      match: /^[6-9]\d{9}$/,
    },

    role: {
      type: String,
      enum: ['donor', 'patient', 'hospital'],
      required: true,
    },

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    location: {
      address: {
        type: String,
        required: function () {
          return this.authProvider === 'local';
        },
      },
      city: {
        type: String,
        required: function () {
          return this.authProvider === 'local';
        },
      },
      state: {
        type: String,
        required: function () {
          return this.authProvider === 'local';
        },
      },
      pincode: {
        type: String,
        required: function () {
          return this.authProvider === 'local';
        },
        match: /^\d{6}$/,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: function () {
        return this.role === 'donor';
      },
    },

    available: {
      type: Boolean,
      default: true,
      required: function () {
        return this.role === 'donor';
      },
    },

    lastDonationDate: {
      type: Date,
      default: null,
    },

    hospitalName: {
      type: String,
      required: function () {
        return this.role === 'hospital';
      },
    },

    registrationNumber: {
      type: String,
      required: function () {
        return this.role === 'hospital';
      },
    },

    profilePicture: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    profileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.canDonate = function () {
  if (this.role !== 'donor') return false;
  if (!this.lastDonationDate) return true;

  const days = Math.floor(
    (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return days >= 90;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
