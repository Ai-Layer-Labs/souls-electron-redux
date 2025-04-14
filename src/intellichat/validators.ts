export const isValidTemperature = (temp: number | undefined): boolean => {
  if (temp === undefined) return false;
  return !isNaN(temp) && temp >= 0 && temp <= 2;
}; 