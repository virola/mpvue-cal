/**
 * base api
 */
const API_BASE = 'https://virola-eko.com/2018/wxcard-api/'

/**
 * 发起一次数据请求，基于axios
 * @param {string} url URL
 * @param {Object} params 请求参数/数据
 * @param {String} type 请求类型 'post' / 'get'
 */
export const fetch = async (url, params = {}, type = 'GET') => {
  type = type.toUpperCase()
  // console.log(params)
  const resp = await new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + url,
      data: params,
      method: type,
      header: {
        'content-type': 'application/json' // 默认值
      },
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
      message: resp.msg || '请求错误',
      data: {}
    }
  }
}

/**
 * 获取天气
 * @param {Object} params 参数
 */
export const getWeather = (params) => fetch('weather.json', params)

/**
 * 获取农历日历、节气
 * @param {String} date 日期格式的字符串。如 2018-4-20
 */
export const getDate = (date = '') => fetch('date.php', date)

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
 * 去后台登录用户
 * @param {Object} params post参数
 * @param {String} params.code 用户登录码
 * @param {String} params.encryptedData
 */
export const userLogin = (params) => fetch('login.php', params, 'post')
