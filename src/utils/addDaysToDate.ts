const addDaysToDate = (date: Date, dayDuration: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + dayDuration);
  return d;
};

export default addDaysToDate;
