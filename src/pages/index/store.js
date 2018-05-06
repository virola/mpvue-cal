// https://vuex.vuejs.org/zh-cn/intro.html
// make sure to call Vue.use(Vuex) if using a module system
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    userData: null,
    userInfo: null,
    wxlogin: false,
    syslogin: false,
    weatherInfo: null
  },
  mutations: {
    // 微信端用户登录
    setUserInfo: (state, data) => {
      // console.log('setUserInfo', data)
      // const state = state
      state.userInfo = data
      state.wxlogin = true
    },
    // 系统端用户登录
    setUserData: (state, data) => {
      // console.log('setUserData')
      state.userData = data
      state.syslogin = true
    },
    setWeatherInfo: (state, data) => {
      state.weatherInfo = data
    }
  }
})

export default store
