import { ProductDbModel } from './database';
import { sequelize } from '../../../server/sequelize';

export async function seedProducts() {
  await Promise.all([
    ProductDbModel.create({
      price: 9,
      name: `Extra strong coffee`,
      image: '/personalization/img/extraStrong.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
    ProductDbModel.create({
      price: 7,
      name: `Strong coffee`,
      image: '/personalization/img/strong.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
    ProductDbModel.create({
      price: 6,
      name: `Smooth`,
      image: '/personalization/img/smooth.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
    ProductDbModel.create({
      price: 8,
      name: `Decaf coffee`,
      image: '/personalization/img/decaf.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
  ]);

  await sequelize.sync();
}
