import { Attributes, DataTypes, FindOptions, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../../../server/sequelize';
import { EventResponseBotData } from '../../../../utils/types';

interface BotVisitAttributes
  extends Model<InferAttributes<BotVisitAttributes>, InferCreationAttributes<BotVisitAttributes>> {
  visitorId: string;
  requestId: string;
  ip: string;
  timestamp: string;
  botResult: string;
  botType: string;
  url: string;
  userAgent: string;
}

const BotVisitDbModel = sequelize.define<BotVisitAttributes>('bot_visits', {
  visitorId: {
    type: DataTypes.STRING,
  },
  requestId: {
    type: DataTypes.STRING,
  },
  ip: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
  botResult: {
    type: DataTypes.STRING,
  },
  botType: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
  },
  userAgent: {
    type: DataTypes.STRING,
  },
});

BotVisitDbModel.sync({ force: false });

export type BotVisit = Attributes<BotVisitAttributes>;

export const saveBotVisit = async (botData: EventResponseBotData, visitorId: string) => {
  if (!botData) {
    return;
  }

  BotVisitDbModel.create({
    ip: botData.ip,
    visitorId: visitorId,
    requestId: botData.requestId,
    timestamp: botData.time,
    botResult: botData.bot.result,
    botType: botData.bot.type ?? '',
    userAgent: botData.userAgent,
    url: botData.url,
  });
};

export const getBotVisits = async (limit?: number) => {
  const options: FindOptions = {
    order: [['timestamp', 'DESC']],
  };
  if (limit) {
    options.limit = limit;
  }
  return await BotVisitDbModel.findAll(options);
};
