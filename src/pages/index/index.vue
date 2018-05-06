<template>
  <div class="container">
    <a class="weather-info" v-if="weatherInfo" href="/pages/index/main">
    <img v-if="userInfo" :src="userInfo.avatarUrl" width="20rpx" height="20rpx">
    {{weatherInfo.now.tmp}}℃ {{weatherInfo.basic.parent_city}} {{weatherInfo.basic.location}}</a>
    <div class="main">
      <div v-if="datesInfo" class="card-row" :style="{transform: 'translateX(' + cardTranslate + 'rpx)'}">
        <div class="card" :class="'card-style-' + index" :style="{transform: 'translateX(' + (index - currentIndex) * 105 +'%)'}" @click="changeCard(index)" v-for="(item, index) in datesInfo" :key="index">
          <div class="card-bd">
            <div class="event-count" v-if="eventsCount && eventsCount[index]">
              <div class="circle">
                {{eventsCount[index].count}}
              </div>
            </div>
            <div class="article">
              <div class="box" @click="bindBoxClick(item.date.item)">
                <p>{{item.date.format}}</p>
                <p>{{item.lunar.date}}</p>
                <p>{{item.lunar.year}}</p>
                <p class="tip">点击进入生日列表</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <mptoast />
  </div>
</template>

<script>
import mptoast from 'mptoast'
import store from './store'
import {getLocation, getWeather, getDates, getIndexCount, getCodeIds, userLogin} from '../../service'

export default {
  data () {
    return {
      datesInfo: null,
      today: null,
      currentIndex: 0,
      eventsCount: null,
      cardTranslate: 0,
      codeParams: {}
    }
  },
  components: {
    mptoast
  },
  computed: {
    userInfo () {
      return store.state.userInfo
    },
    userData () {
      return store.state.userData
    },
    weatherInfo () {
      return store.state.weatherInfo
    }
  },
  created () {
    // 调用应用实例的方法获取全局数据
    this.getUserInfo()
    this.initData()
  },
  watch: {
    'codeParams': 'getOpenid'
  },
  methods: {
    // 日期跳转
    bindBoxClick (date) {
      const url = '/pages/events/main?date=' + date
      wx.navigateTo({ url })
    },
    async initData () {
      const location = await getLocation()
      // weather
      // cache 减少请求
      if (!this.weatherInfo) {
        let timestamp = Math.round(Date.parse(new Date()) / 1000)
        const data = await getWeather({
          location: location.longitude + ',' + location.latitude,
          t: timestamp
        })
        store.commit('setWeatherInfo', {...data})
      }
      // date cal
      this.eventsCount = (await getIndexCount()).list
      // console.log(this.eventsCount)
      const dates = await getDates()
      this.datesInfo = dates.list
      this.currentIndex = Math.floor(dates.list.length / 2)
      // this.showIndex = this.currentIndex
      this.today = dates.today
    },
    showToast (msg = '提示信息') {
      this.$mptoast(msg)
    },
    getUserInfo () {
      // this.showToast('登录中...')
      // 调用登录接口
      wx.login({
        success: (res) => {
          // const code = res.code
          this.codeParams.code = res.code
          // console.log(this.codeParams)
          // get userinfo
          if (!this.userInfo) {
            wx.getUserInfo({
              withCredentials: true,
              success: (res) => {
                store.commit('setUserInfo', {...res.userInfo})
                this.getOpenid(this.codeParams)
                this.showToast('已登录')
              }
            })
          }
        }
      })
    },
    async getOpenid (codeParams) {
      if (codeParams.code) {
        const ids = await getCodeIds(codeParams)
        // set an open_id for development
        if (!ids['open_id']) {
          ids['open_id'] = 'default_' + 200
        }
        ids['nickname'] = this.userInfo.nickName
        const resp = await userLogin(ids)
        store.commit('setUserData', {...resp})
      }
    },
    // click handler
    changeCard (index) {
      this.cardTranslate = -(index - this.currentIndex) * 750 * (0.72 + 0.04)
      // console.log(this.cardTranslate)
    }
  }
}
</script>

<style scoped lang="scss">
@import 'src/scss/mixin';

.weather-info {
  position: absolute;
  z-index: 100;
  right: 20px;
  top: 0;
  color: #656565;
  img {
    margin-top: 10rpx;
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
  }
}
.main {
  width: 100%;
  height: 100%;
}

$size: 120rpx;
.event-count {
  padding: 40rpx 0;
  width: 100%;
  display: flex; 
  justify-content: center;
  .circle {
    width: $size;
    height: $size;
    border-radius: 50%;
    background: rgba($color: #fff, $alpha: 0.3);
    text-align: center;
    line-height: $size;
    font-size: $size * 0.5;
  }
}
.article {
  // position: relative;
  @include flex-center();
  top: 0;
}
.box {
  padding: 20rpx;
  border: 1rpx solid #fff;
  text-align: center;
  p {
    margin: 20rpx;
  }
  .tip {
    padding-top: 20rpx;
    font-size: 30rpx;
    text-decoration: underline;
  }
}
</style>
