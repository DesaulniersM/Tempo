const parseDate = (dateStr) => {
  let formattedDate = ''
  const parts = dateStr.split(/[-/]/)
  if (parts.length === 3) {
    const month = parts[0].padStart(2, '0')
    const day = parts[1].padStart(2, '0')
    let year = parts[2]
    if (year.length === 2) year = `20${year}`
    if (parseInt(month) <= 12 && parseInt(day) <= 31) {
      formattedDate = `${year}-${month}-${day}`
    }
  }
  return formattedDate
}

const sampleData = `Date	Research	TA	Homework	Classes & meetings	NREL	Total	Weekly Total	Average per day	Notes
9-5-25	0.5	1.1		0.8		2.4			
9-6-25			4.21			4.21			
9-7-25	2.6	0.2				2.8			`

const rows = sampleData.trim().split('\n')
const firstRow = rows[0]
const delimiter = firstRow.includes('\t') ? '\t' : ','
const headers = firstRow.split(delimiter).map(h => h.trim())
const ignoredColumns = ['date', 'total', 'weekly total', 'average per day', 'notes', 'cumulative total', 'total days off']

console.log('Delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA')
console.log('Headers:', headers)

for (let i = 1; i < rows.length; i++) {
  const cols = rows[i].split(delimiter).map(c => c.trim())
  const dateStr = cols[0]
  const formattedDate = parseDate(dateStr)
  console.log(`Row ${i} Date: ${dateStr} -> ${formattedDate}`)
  
  for (let j = 1; j < cols.length; j++) {
    if (!headers[j] || ignoredColumns.includes(headers[j].toLowerCase())) continue
    const duration = parseFloat(cols[j])
    if (!isNaN(duration) && duration > 0) {
      console.log(`  Match: Category="${headers[j]}" Duration=${duration}`)
    }
  }
}
