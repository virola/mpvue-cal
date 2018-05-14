// https://vuex.vuejs.org/zh-cn/intro.html
// make sure to call Vue.use(Vuex) if using a module system
import Vue from 'vue'
import Vuex from 'vuex'
import {getCodeIds, userLogin} from '@/service'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    code: '',
    userData: null,
    userInfo: null,
    wxlogin: false,
    syslogin: false,
    weatherInfo: null
  },
  mutations: {
    setCode (state, code) {
      state.code = code
    },
    // 微信端用户登录
    setUserInfo: (state, data) => {
      state.userInfo = data
      state.wxlogin = true
    },
    // 系统端用户登录
    setUserData: (state, data) => {
      state.userData = data
      state.syslogin = true
    },
    setWeatherInfo: (state, data) => {
      state.weatherInfo = data
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
            commit('setCode', res.code)
            dispatch('getUserData')
            // get userinfo
            if (!state.userInfo) {
              wx.getUserInfo({
                withCredentials: true,
                success (res) {
                  commit('setUserInfo', {...res.userInfo})
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
      commit, state
    }) {
      if (state.code) {
        console.log('sys.setLogin')
        const ids = await getCodeIds({code: state.code})
        // set an open_id for development
        if (!ids['open_id']) {
          ids['open_id'] = 'default_' + 200
        }
        ids['nickname'] = state.userInfo.nickName
        // console.log(ids)
        const resp = await userLogin(ids)
        // console.log(resp)
        commit('setUserData', {...resp})
      }
    }
  }
})

export default store
