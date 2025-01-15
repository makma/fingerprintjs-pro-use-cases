import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../../server/sequelize';
import { defaultUser } from '../const';
import { hashString } from '../../../server/server-utils';

/** Users */
interface AccountAttributes
  extends Model<InferAttributes<AccountAttributes>, InferCreationAttributes<AccountAttributes>> {
  passwordHash: string;
  username: string;
  createdWithVisitorId: string;
}

export const UserDbModel = sequelize.define<AccountAttributes>('account_sharing_user', {
  passwordHash: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  createdWithVisitorId: {
    type: DataTypes.STRING,
  },
});

UserDbModel.sync({ force: false });

// Seed the database with the default user.
UserDbModel.findOrCreate({
  where: { username: defaultUser.username },
  defaults: {
    username: defaultUser.username,
    passwordHash: hashString(defaultUser.password),
    createdWithVisitorId: '',
  },
});

export type User = Attributes<AccountAttributes>;

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
