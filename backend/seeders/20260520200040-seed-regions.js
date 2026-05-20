'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Regions', [
      { id: 1, name: 'Japan',          createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Asia',        createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Europe', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'North America', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'South America',        createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'Africa',       createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: 'Oceania',       createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: 'Antarctica',       createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Regions', null, {});
  }
};