export const ROLE_PRIORITY = ['admin', 'accounts', 'sales', 'user']

export const HOME_BY_ROLE = {
  admin:    '/admin',
  accounts: '/accounts/invoices',
  sales:    '/sales/orders',
  user:     '/profile',
}

export function pickHomePath(roleNames = []) {
  const best = ROLE_PRIORITY.find(r => roleNames.includes(r)) || 'user';
  return HOME_BY_ROLE[best];
}