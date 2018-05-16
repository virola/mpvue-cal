// https://vuex.vuejs.org/zh-cn/intro.html
// make sure to call Vue.use(Vuex) if using a module system
import Vue from 'vue'
import Vuex from 'vuex'
import {getCodeIds, userLogin, getMyEvents} from '@/service'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    code: '',
    userData: null,
    userInfo: null,
    myEvents: {},
    weatherInfo: null
  },
  mutations: {
    setCode (state, code) {
      state.code = code
    },
    // 微信端用户登录
    setUserInfo (state, data) {
      state.userInfo = data
    },
    // 系统端用户登录
    setUserData (state, data) {
      state.userData = data
    },
    setWeatherInfo (state, data) {
      state.weatherInfo = data
    },
    setEventsByDate (state, res) {
      if (res.date) {
        state.myEvents[res.date] = res.data
      }
    }
  },
  actions: {
    getUserInfo ({
      commit,
      state,
      dispatch
    }) {
      console.log('wx.login')
      wx.login({
        success (res) {
          if (res.code) {
            // 用户登录或未登录都有一个code，大概表示会话状态
            commit('setCode', res.code)
            // get userinfo
            if (!state.userInfo) {
              wx.getUserInfo({
                withCredentials: true,
                success (res) {
                  // console.log(res)
                  commit('setUserInfo', {...res.userInfo})
                  dispatch('getUserData')
                }
              })
            }
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        },
        fail (res) {
          console.log(res)
        }
      })
    },
    async getUserData ({
      commit, state, dispatch
    }) {
      if (state.code) {
        console.log('sys.setLogin')
        try {
          const ids = await getCodeIds({code: state.code})
          // set an open_id for development
          if (!ids['open_id']) {
            ids['open_id'] = 'default_' + 200
          }
          ids['nickname'] = state.userInfo.nickName
          const resp = await userLogin(ids)
          if (resp.id > 0) {
            commit('setUserData', {...resp})
          }
        } catch (e) {
          console.log(e)
        }
      }
    },
    async getUserEvents ({
      commit, state
    }, { date = '', page = 1 }) {
      // 已登录
      if (state.userData) {
        try {
          const events = await getMyEvents({ date, page })
          commit('setEventsByDate', {
            date: events.date,
            data: events.list
          })
        } catch (e) {
          console.log(e)
        }
      } else {
        console.log('not login')
      }
    }
  }
})

export default store
