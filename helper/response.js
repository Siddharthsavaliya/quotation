const response = (status, message, data = {}) => {
  return {
    status,
    message,
    data,
  };
};

module.exports = response;
