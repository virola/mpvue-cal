/**
 * base api
 */
import store from '@/store'
// production
const API = 'https://www.virola-eko.com/2018/wxcard-api/'
const DATA_API = 'https://www.virola-eko.com/api/v1/'
// development
// const API = 'http://localhost/2018/projects/wxcard-api/'
// const DATA_API = 'http://127.0.0.1:3000/api/v1/'

const DATA_URLS = {
  WEATHER: API + 'weather.php',
  DATES: API + 'date.php',
  LOGIN: DATA_API + 'session/login',
  GET_EVENTS: DATA_API + 'index/events',
  GET_EVENTS_COUNT: DATA_API + 'index/count',
  GET_MY_EVENTS: DATA_API + 'index/mine',
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

  // 非GET请求时，做checkSession的尝试
  if (type !== 'GET') {
    wx.checkSession({
      success () {
        // session_key 未过期，并且在本生命周期一直有效
      },
      fail () {
        // session_key 已经失效，需要重新执行登录流程
        // 重新登录
        store.dispatch('getUserInfo')
      }
    })
  }
  const resp = await new Promise((resolve, reject) => {
    // console.log(url)
    wx.request({
      url: url,
      data: params,
      method: type,
      header: headers,
      withCredentials: true,
      success (res) {
        resolve(res.data) // 把返回的数据传出去
      },
      fail (ret) {
        reject(ret) // 把错误信息传出去
      }
    })
  })
  // 数据请求成功
  if (resp.status === 'ok') {
    // session key hold
    // if (resp.session) {
    //   store.commit('setSession', resp.session)
    // }
    return resp.data
  } else {
    if (resp.status === 401) {
      // 权限问题，重新尝试登录
      store.dispatch('getUserData')
    }
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
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.userLocation" 这个 scope
    wx.getSetting({
      success (res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success () {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.getLocation({
                type: 'wgs84',
                success (res) {
                  resolve(res)
                },
                fail (ret) {
                  reject(ret)
                }
              })
            },
            fail (ret) {
              reject(ret)
            }
          })
        } else {
          // 已经授权
          wx.getLocation({
            type: 'wgs84',
            success (res) {
              resolve(res)
            },
            fail (ret) {
              reject(ret)
            }
          })
        }
      },
      fail (ret) {
        reject(ret)
      }
    })
  })
}

/**
 * 去后台登录或创建用户
 * @param {Object} params post参数
 * @param {String} params.code 微信用户登录码
 * @param {String} params.nickname 微信昵称
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
export const getEventsByDate = ({
  date = '',
  page = 1
}) => fetch(DATA_URLS.GET_EVENTS, { date, page })

export const getMyEvents = ({
  date = '',
  page = 1
}) => fetch(DATA_URLS.GET_MY_EVENTS, { date, page })

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
