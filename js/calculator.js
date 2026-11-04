/**
 * Dias Passados - Time & Statistics Calculator
 * Computes elapsed days, remaining days, percentage and period data
 */

function calculateStats(state) {
  const now = new Date();
  const year = now.getFullYear();

  if (state.viewMode === 'goals') {
    const goalDays = Math.max(7, Math.min(365, parseInt(state.goalDays, 10) || 30));
    const start = state.goalStartDate ? new Date(state.goalStartDate + 'T00:00:00') : new Date(year, now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const msInDay = 24 * 60 * 60 * 1000;
    let elapsedDays = Math.floor((today - start) / msInDay);
    if (isNaN(elapsedDays)) elapsedDays = 0;

    const currentDayIndex = Math.min(goalDays - 1, Math.max(0, elapsedDays));
    const remainingDays = Math.max(0, goalDays - (currentDayIndex + 1));
    const percent = Math.min(100, Math.max(0, ((currentDayIndex + 1) / goalDays) * 100));

    return {
      total: goalDays,
      completed: currentDayIndex + 1,
      currentIndex: currentDayIndex,
      remaining: remainingDays,
      percent: percent,
      isMonthMode: false,
      isGoalsMode: true
    };
  } else if (state.viewMode === 'month') {
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayOfMonth = now.getDate(); // 1..daysInMonth
    const currentDayIndex = dayOfMonth - 1;
    const remainingDays = Math.max(0, daysInMonth - dayOfMonth);
    const percent = Math.min(100, (dayOfMonth / daysInMonth) * 100);

    return {
      total: daysInMonth,
      completed: dayOfMonth,
      currentIndex: currentDayIndex,
      remaining: remainingDays,
      percent: percent,
      monthName: window.MONTH_NAMES[month],
      year: year,
      isMonthMode: true,
      isGoalsMode: false
    };
  } else {
    // Days of the Current Year (15 columns x 25 rows = 365/366 days in dots)
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;

    const todayStart = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const msInDay = 24 * 60 * 60 * 1000;
    const dayOfYear = Math.min(totalDays - 1, Math.max(0, Math.round((todayStart - startOfYear) / msInDay)));
    const currentDayIndex = dayOfYear;
    const remainingDays = Math.max(0, totalDays - (dayOfYear + 1));
    const percent = Math.min(100, Math.max(0, ((dayOfYear + 1) / totalDays) * 100));

    return {
      total: totalDays,
      completed: dayOfYear + 1,
      currentIndex: currentDayIndex,
      remaining: remainingDays,
      percent: percent,
      year: year,
      isMonthMode: false,
      isGoalsMode: false
    };
  }
}

window.calculateStats = calculateStats;

