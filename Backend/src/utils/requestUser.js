const getRequestUserId = (req) => {
  return req.user?.id_utilisateur || req.user?.id || null;
};

const getRequestAdminId = (req) => {
  return req.user?.id_admin || req.user?.id || null;
};

module.exports = {
  getRequestUserId,
  getRequestAdminId,
};