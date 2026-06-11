const checkHealth = (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend aloca.id berbasis Express siap digunakan!',
    data: {
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  checkHealth
};