const generateRoomFields = (capacity) => {
  switch (capacity) {
    case 1:
      return {
        price: 500,
        type: 'ENKEL',
      };
    case 2:
      return {
        price: 1000,
        type: 'DUBBEL',
      };
    case 3:
      return {
        price: 1500,
        type: 'SVIT',
      };
    default:
      return {
        error: true,
        message: `Not possible to make rooms for ${capacity} amount of people.`,
      };
  }
};

module.exports = generateRoomFields;
