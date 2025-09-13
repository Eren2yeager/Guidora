export const ADMIN_EMAILS = new Set(['gautamdaksh29@gmail.com']);

export function isAdminSession(session) {
  return !!(session?.user?.email && ADMIN_EMAILS.has(session.user.email));
}