export const date2unix = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

export const sortPrompts = (prompts: any[]) => {
  return [...prompts].sort((a, b) => b.updatedAt - a.updatedAt);
}; 