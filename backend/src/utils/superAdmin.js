const SUPER_ADMIN_EMAIL = "admin@joyeria.local";

function isSuperAdmin(user) {
  return Boolean(user?.email) && String(user.email).toLowerCase() === SUPER_ADMIN_EMAIL;
}

module.exports = { SUPER_ADMIN_EMAIL, isSuperAdmin };
