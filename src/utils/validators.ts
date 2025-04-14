export const isBlank = (str: string | null | undefined): boolean => {
  return str === null || str === undefined || str.trim() === '';
};

export const isNotBlank = (str: string | null | undefined): boolean => {
  return !isBlank(str);
}; 