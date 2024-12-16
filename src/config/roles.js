export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COUNTRY_ADMIN: 'country_admin',
  VERIFICATION_ADMIN: 'verification_admin'
};

export const PERMISSIONS = {
  VERIFY_BETTING_CODES: 'verify_betting_codes',
  VERIFY_PAYMENTS: 'verify_payments',
  MANAGE_USERS: 'manage_users',
  VIEW_STATISTICS: 'view_statistics'
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS)
  ],
  [ROLES.COUNTRY_ADMIN]: [
    PERMISSIONS.VERIFY_BETTING_CODES,
    PERMISSIONS.VERIFY_PAYMENTS,
    PERMISSIONS.VIEW_STATISTICS
  ],
  [ROLES.VERIFICATION_ADMIN]: [
    PERMISSIONS.VERIFY_BETTING_CODES,
    PERMISSIONS.VERIFY_PAYMENTS
  ]
}; 