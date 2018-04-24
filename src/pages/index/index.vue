<template>
  <div class="container">
    <a class="weather-info" v-if="weatherInfo" href="/pages/index/main">
    <img v-if="userInfo" :src="userInfo.avatarUrl" width="20rpx" height="20rpx">
    {{weatherInfo.now.tmp}}℃ {{weatherInfo.basic.parent_city}} {{weatherInfo.basic.location}}</a>
    <div class="main">
      <swiper v-if="dateInfo" class="swiper" :indicator-dots="indicatorDots">
        <block v-for="(item, index) in dateInfo" :key="index">
          <swiper-item>
            <img class="cover" :src="'http://virola-eko.com/topic/magazine/mock/bg/' + (index + 1) + '.jpg'">
            <div class="article">
              <div class="box">
                <p>{{item.date.format}}</p>
                <p>{{item.lunar.date}}</p>
                <p>{{item.lunar.year}}</p>
              </div>
            </div>
          </swiper-item>
        </block>
      </swiper>
    </div>
    <mptoast />
  </div>
</template>

<script>
import mptoast from 'mptoast'
import {getLocation, getWeather, getDate, userLogin} from '../../service'

export default {
  data () {
    return {
      userInfo: {},
      weatherInfo: null,
      dateInfo: null
    }
  },
  components: {
    mptoast
  },
  created () {
    // 调用应用实例的方法获取全局数据
    this.getUserInfo()
    this.initData()
  },
  methods: {
    async initData () {
      const location = await getLocation()
      // weather
      let timestamp = Math.round(Date.parse(new Date()) / 1000)
      const data = await getWeather({
        location: location.longitude + ',' + location.latitude,
        t: timestamp
      })
      this.weatherInfo = {...data}
      // date cal
      this.dateInfo = await getDate()
    },
    showToast (msg = '提示信息') {
      this.$mptoast(msg)
    },
    getUserInfo () {
      this.showToast('正在登录中...')
      // 调用登录接口
      wx.login({
        success: (res) => {
          const code = res.code
          
          // get userinfo
          wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
              this.userInfo = res.userInfo
              const encryptedData = res.encryptedData
              // 去登录
              userLogin({code, encryptedData})
              console.log(this.userInfo)
              this.showToast('已登录')
            }
          })
        }
      })
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
  // background: rgb(123, 187, 252);
}
.swiper {
  width: 100%;
  height: 100%;
  position: relative;
}
.article {
  position: relative;
  @include flex-center();
}
.cover {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: .6;
}
.box {
  padding: 20rpx;
  border: 1rpx solid #fff;
  p {
    margin: 20rpx;
  }
}
</style>
