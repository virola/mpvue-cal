/**
 * base api
 */
import store from '../pages/index/store'
// const API = 'https://virola-eko.com/2018/wxcard-api/'
const API = 'http://localhost/2018/projects/wxcard-api/'
const DATA_API = 'http://127.0.0.1:3000/api/v1/'

const DATA_URLS = {
  WEATHER: API + 'weather.json',
  DATES: API + 'date.php',
  GET_IDS: API + 'decode/demo.php',

  LOGIN: DATA_API + 'session/login',
  GET_EVENTS: DATA_API + 'index/events',
  GET_EVENTS_COUNT: DATA_API + 'index/count',
  EVENTS (id) {
    if (!id) {
      return DATA_API + 'events'
    }
    return DATA_API + `events/${id}`
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
  const usertoken = store.state.userData ? `Token token=${store.state.userData.token}, username=${store.state.userData.username}` : ''
  let headers = {
    'X-Requested-With': 'XMLHttpRequest',
    'content-type': 'application/json' // 默认值
  }
  if (usertoken) {
    // console.log(usertoken)
    headers['Authorization'] = usertoken
  }
  type = type.toUpperCase()
  const resp = await new Promise((resolve, reject) => {
    console.log(url)
    wx.request({
      url: url,
      data: params,
      method: type,
      header: headers,
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
 * @param {number} page 页码
 */
export const getEventsByDate = ({date = '', page = 1}) => fetch(DATA_URLS.GET_EVENTS, {date, page})

/**
 * 新增生日
 * @param {Object} data 字段
 */
export const addEvent = (data) => fetch(DATA_URLS.EVENTS(), data, 'post')

/**
 * 根据ID删除生日
 * @param {Number} id ID
 */
export const deleteEvent = (id) => fetch(DATA_URLS.EVENTS(id), '', 'delete')

/**
 * 更新生日
 * @param {Object} params 字段
 */
export const updateEvent = (params) => fetch(DATA_URLS.EVENTS(params.id), params, 'put')
