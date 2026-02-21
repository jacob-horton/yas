export function isExpired(expiry: string) {
  const expiryDate = new Date(expiry);
  const now = new Date();

  return now > expiryDate;
}
