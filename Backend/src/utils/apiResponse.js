const sendSuccess = (res, data = {}, message = "Opération réussie", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data
  });
};

module.exports = {
  sendSuccess
};