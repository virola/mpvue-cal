// https://vuex.vuejs.org/zh-cn/intro.html
// make sure to call Vue.use(Vuex) if using a module system
import Vue from 'vue'
import Vuex from 'vuex'
import {userLogin} from '@/service'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    code: '',
    userData: null,
    userInfo: null,
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
          // 用code去server端验证，并创建登录用户
          const resp = await userLogin({
            code: state.code,
            nickname: state.userInfo.nickName
          })
          if (resp.id > 0) {
            commit('setUserData', {...resp})
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
})

export default store
