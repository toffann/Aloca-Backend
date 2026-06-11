const getHello = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello World!'
  });
};

module.exports = {
  getHello
};