const addMonthToDate = (date: Date, monthDuration: number): Date => {
  const d = new Date(date);
  const day = d.getDate();

  d.setMonth(d.getMonth() + monthDuration);

  if (d.getDate() < day) {
    d.setDate(0);
  }

  return d;
};

export default addMonthToDate