const handleMongoError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      status: false,
      message: `This ${field} is already registered. Please use a different ${field}.`,
      data: {},
    };
  }
  return {
    status: false,
    message: error.message,
    data: {},
  };
};

module.exports = {
  handleMongoError,
};
