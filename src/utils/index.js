function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

export function formatDate (date) {
  const nowTime = new Date()
  // dates set time to 0:00, or will be set 8:00
  const today = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate())
  let targetDate
  if (!date) {
    targetDate = today
  } else {
    targetDate = new Date(date + ' 00:00:00')
  }
  const daygap = 24 * 60 * 60 * 1000

  let textlabel
  switch (targetDate - today) {
    case 0:
      textlabel = '今天'
      break
    case daygap:
      textlabel = '明天'
      break
    case daygap * 2:
      textlabel = '后天'
      break
    case -daygap:
      textlabel = '昨天'
      break
    case -daygap * 2:
      textlabel = '前天'
      break
    default:
      textlabel = date
      break
  }
  // console.log(textlabel)
  return textlabel
}
