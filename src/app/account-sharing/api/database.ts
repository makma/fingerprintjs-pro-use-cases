import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../../server/sequelize';
import { defaultUser } from '../const';
import { hashString } from '../../../server/server-utils';

/** Accounts */
interface AccountAttributes
  extends Model<InferAttributes<AccountAttributes>, InferCreationAttributes<AccountAttributes>> {
  passwordHash: string;
  username: string;
}

// Defines db model for login attempt.
export const UserDbModel = sequelize.define<AccountAttributes>('account_sharing_user', {
  passwordHash: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
});

UserDbModel.sync({ force: false });

// Seed the database with the default user.
UserDbModel.findOrCreate({
  where: { username: defaultUser.username },
  defaults: { username: defaultUser.username, passwordHash: hashString(defaultUser.password) },
});

export type User = Attributes<AccountAttributes>;

/** Logins */
interface LoginAttributes extends Model<InferAttributes<LoginAttributes>, InferCreationAttributes<LoginAttributes>> {
  visitorId: string;
  username: string;
  timestamp: Date;
  operation: 'login' | 'logout';
  success: boolean;
}

export const LoginDbModel = sequelize.define<LoginAttributes>('account_sharing_login', {
  visitorId: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
  operation: {
    type: DataTypes.ENUM('login', 'logout'),
  },
  success: {
    type: DataTypes.BOOLEAN,
  },
});

LoginDbModel.sync({ force: false });

export type Login = Attributes<LoginAttributes>;

/** Sessions */
interface SessionAttributes
  extends Model<InferAttributes<SessionAttributes>, InferCreationAttributes<SessionAttributes>> {
  visitorId: string;
  username: string;
  sessionId: string;
  timestamp: Date;
}

export const SessionDbModel = sequelize.define<SessionAttributes>('account_sharing_session', {
  visitorId: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  sessionId: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

SessionDbModel.sync({ force: false });

export type Session = Attributes<SessionAttributes>;

/** Current Devices */
interface DeviceAttributes extends Model<InferAttributes<DeviceAttributes>, InferCreationAttributes<DeviceAttributes>> {
  visitorId: string;
  username: string;
  deviceName: string;
  deviceLocation: string;
}

export const DeviceDbModel = sequelize.define<DeviceAttributes>('account_sharing_device', {
  visitorId: {
    type: DataTypes.STRING,
  },
  deviceName: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  deviceLocation: {
    type: DataTypes.STRING,
  },
});

DeviceDbModel.sync({ force: false });

export type Device = Attributes<DeviceAttributes>;
