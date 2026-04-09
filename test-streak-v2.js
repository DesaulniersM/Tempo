function calculateStreak(recentEntries) {
    const dates = [...new Set(recentEntries.map(e => e.date))].sort().reverse()
    console.log('Available Dates (First 5):', dates.slice(0, 5))
    if (dates.length === 0) return 0
    
    let currentStreak = 0
    // Simulation today as April 8, 2026
    const now = new Date(2026, 3, 8) 
    let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const dToStr = (d) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    
    const todayStr = dToStr(checkDate)
    console.log('Simulation Today:', todayStr)
    
    let dateIdx = 0
    // If no entry today, check if yesterday had one to keep streak alive
    if (dates[0] !== todayStr) {
      console.log('No entry today (${todayStr}), checking yesterday...')
      checkDate.setDate(checkDate.getDate() - 1)
      const yesterdayStr = dToStr(checkDate)
      if (dates[0] !== yesterdayStr) {
        console.log('Streak broken (neither today nor yesterday found)');
        return 0
      }
      console.log('Streak alive from yesterday (${yesterdayStr})')
    } else {
      console.log('Streak has entry for today (${todayStr})')
    }

    // Now walk back
    while (dateIdx < dates.length) {
      const targetStr = dToStr(checkDate)
      console.log(`Comparing dates[${dateIdx}] (${dates[dateIdx]}) with target (${targetStr})`)
      if (dates[dateIdx] === targetStr) {
        currentStreak++
        dateIdx++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        console.log('Gap found, stopping.')
        break
      }
    }
    return currentStreak
}

const entries = [{date: '2026-04-07'}, {date: '2026-04-06'}, {date: '2026-04-05'}];
console.log('FINAL STREAK:', calculateStreak(entries));
