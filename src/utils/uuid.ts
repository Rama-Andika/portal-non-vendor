/**
 * Utility function to check if a given string is a valid UUID format (frontend generated).
 */
export const isFrontendUUID = (str?: string | null): boolean => {
  if (!str) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};
