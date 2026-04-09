function calculateStreak(recentEntries) {
    const dates = [...new Set(recentEntries.map(e => e.date))].sort().reverse()
    console.log('Unique Dates (desc):', dates)
    if (dates.length === 0) return 0
    
    let currentStreak = 0
    const now = new Date()
    // Local date components
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
    let checkDate = new Date(y, m, d)
    
    const dToStr = (date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    
    const todayStr = dToStr(checkDate)
    console.log('Today:', todayStr)
    
    let dateIdx = 0
    // If no entry today, check if yesterday had one to keep streak alive
    if (dates[0] !== todayStr) {
      checkDate.setDate(checkDate.getDate() - 1)
      const yesterdayStr = dToStr(checkDate)
      console.log('Checking Yesterday:', yesterdayStr)
      if (dates[0] !== yesterdayStr) {
        console.log('Streak broken (neither today nor yesterday found)');
        return 0
      }
    }

    // Reset checkDate to today for the walk-back
    checkDate = new Date(y, m, d)
    // If today has no entry, start walking back from yesterday
    if (dates[0] !== todayStr) {
        checkDate.setDate(checkDate.getDate() - 1)
    }

    while (dateIdx < dates.length) {
      const dStr = dToStr(checkDate)
      if (dates[dateIdx] === dStr) {
        currentStreak++
        dateIdx++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return currentStreak
}

// Sample data test
console.log('Streak Result:', calculateStreak([{date: '2026-04-07'}, {date: '2026-04-06'}]));
