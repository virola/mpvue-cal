/**
 * base api
 */
import store from '../pages/index/store'
// const API = 'https://virola-eko.com/2018/wxcard-api/'
const API = 'http://localhost/2018/projects/wxcard-api/'
const DATA_API = 'http://127.0.0.1:3000/'

const DATA_URLS = {
  WEATHER: API + 'weather.json',
  DATES: API + 'date.php',
  GET_IDS: API + 'decode/demo.php',
  LOGIN: DATA_API + 'sessions/login_open_id',
  GET_EVENTS: DATA_API + 'index/events.json',
  GET_EVENTS_COUNT: DATA_API + 'index/count.json',
  ADD_EVENT () {
    // console.log(store.state.userData)
    let id = store.state.userData.id
    return DATA_API + `members/${id}/events.json`
  }
}

/**
 * 发起一次数据请求，基于axios
 * @param {string} url URL
 * @param {Object} params 请求参数/数据
 * @param {String} type 请求类型 'post' / 'get'/ 'patch' / 'put' / 'delete'
 */
export const fetch = async (url, params = {}, type = 'GET') => {
  if (!url) {
    return (new Promise()).resolve()
  }
  type = type.toUpperCase()
  const resp = await new Promise((resolve, reject) => {
    console.log(url)
    wx.request({
      url: url,
      data: params,
      method: type,
      header: {
        'content-type': 'application/json' // 默认值
      },
      withCredentials: true,
      success (res) {
        resolve(res.data)  // 把返回的数据传出去
      },
      fail (ret) {
        reject(ret)   // 把错误信息传出去
      }
    })
  })
  // 数据请求成功
  if (resp.status === 'ok') {
    return resp.data
  } else {
    // 数据请求失败
    return {
      status: resp.status || 'error',
      message: resp.message || '请求错误',
      data: null
    }
  }
}

/**
 * 获取天气
 * @param {Object} params 参数
 */
export const getWeather = (params) => fetch(DATA_URLS.WEATHER, params)

/**
 * 获取农历日历、节气
 * @param {String} date 日期格式的字符串。如 2018-4-20
 */
export const getDates = (date = '') => fetch(DATA_URLS.DATES, date)

/**
 * 封装微信API获取位置
 * 返回值示例:
 * { accuracy: 65, altitude: 0, errMsg: "getLocation:ok", horizontalAccuracy: 65, latitude: 28.22778, longitude: 112.93886, speed: -1, verticalAccuracy: 65 }
 */
export const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        resolve(res)
      },
      fail (ret) {
        reject(ret)
      }
    })
  })
  // return resp
}

/**
 * 获取OPEN_ID
 * @param {Object} params post参数
 * @param {String} params.code code
 * @param {String} params.encryptedData encryptedData
 */
export const getCodeIds = (params) => fetch(DATA_URLS.GET_IDS, params, 'post')

/**
 * 去后台登录或创建用户
 * @param {Object} params post参数
 * @param {String} params.open_id 用户登录码
 * @param {String} params.username 用户名
 */
export const userLogin = (params) => fetch(DATA_URLS.LOGIN, params, 'post')

/**
 * 今日所有事件
 */
export const getEventsToday = () => fetch(DATA_URLS.GET_EVENTS)

export const getIndexCount = () => fetch(DATA_URLS.GET_EVENTS_COUNT)
/**
 * 根据日期获取事件
 * @param {string} date 日期格式 yyyy-mm-dd
 */
export const getEventsByDate = (date = '') => fetch(DATA_URLS.GET_EVENTS, {date})

export const addEvent = (data) => fetch(DATA_URLS.ADD_EVENT(), data, 'post')
