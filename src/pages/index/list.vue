<template>
  <div class="container">
    <a class="weather-info">
      <span v-if="weatherInfo">{{weatherInfo.now.tmp}}℃ {{weatherInfo.basic.parent_city}} {{weatherInfo.basic.location}}</span>
      <img v-if="userInfo" :src="userInfo.avatarUrl" width="20rpx" height="20rpx">
    </a>
    <div class="main">
      <div v-if="datesInfo" class="card-row" :style="{transform: 'translateX(' + -(showIndex - currentIndex) * 750 * (0.72 + 0.04) + 'rpx)'}">
        <div class="card" :class="'card-style-' + index" :style="{transform: 'translateX(' + (index - currentIndex) * 105 +'%)'}" @click="changeCard(index)" @tap="changeCard(index)" v-for="(item, index) in datesInfo" :key="index">
          <div class="card-bd">
            <div class="event-count" v-if="eventsCount && eventsCount[index] && eventsCount[index].count">
              <div class="circle">
                <span v-if="eventsCount[index].count < 100">{{eventsCount[index].count}}</span>
                <span class="small-size" v-else>99+</span>
              </div>
            </div>
            <div class="article">
              <div class="box" @click="bindBoxClick(item.date.item)">
                <p>{{item.date.format}}</p>
                <p>{{item.lunar.date}}</p>
                <p>{{item.lunar.year}}</p>
                <p class="info" v-if="item.format_text !== item.date.item">{{item.format_text}}</p>
                <p class="tip" v-if="eventsCount[index].count">点击进入生日列表</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <add :date="currentDate" @created="createSuccess" @showDialog="bindShowAdd"></add>
    </div>
    <mptoast />

    <authDialog :show="showAuthorize" @hide="changeAuthorize(0)" />
  </div>
</template>

<script>
import mptoast from 'mptoast'
import add from '../../components/add'
import authDialog from '../../components/authorize'
import store from '@/store'
import {getLocation, getWeather, getDates, getIndexCount} from '../../service'

export default {
  data () {
    return {
      // 授权登录mask
      showAuthorize: false,
      datesInfo: null,
      today: null,
      currentDate: '',
      // 最中间那个card - 今天
      currentIndex: 0,
      // 左右滑动显示的index
      showIndex: 0,
      eventsCount: null,
      cardTranslate: 0,
      codeParams: {}
    }
  },
  components: {
    mptoast,
    add,
    authDialog
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
    this.getUser()
    this.initData()
    this.initWeather()
  },
  watch: {
    'showIndex': 'changeCurrentDate'
  },
  methods: {
    // 日期跳转
    bindBoxClick (date) {
      const url = '/pages/events/main?date=' + date
      wx.navigateTo({ url })
    },
    async initWeather () {
      if (!this.weatherInfo) {
        const location = await getLocation()
        // weather
        // cache 减少请求
        let timestamp = Math.round(Date.parse(new Date()) / 1000)
        const data = await getWeather({
          location: location.longitude + ',' + location.latitude,
          t: timestamp
        })
        store.commit('setWeatherInfo', {...data})
      }
    },
    async initData () {
      // date cal
      this.eventsCount = (await getIndexCount()).list
      const dates = await getDates()
      this.datesInfo = dates.list
      // console.log(this.datesInfo)
      this.currentIndex = Math.floor(dates.list.length / 2)
      this.showIndex = this.currentIndex
      this.today = dates.today
    },
    changeCurrentDate (index) {
      this.currentDate = this.datesInfo[index].date.item
    },
    showToast (msg = '提示信息') {
      this.$mptoast(msg)
    },
    getUser () {
      if (!this.userInfo) {
        store.dispatch('getUserInfo')
      }
      // 调用登录接口
    },
    // click handler
    changeCard (index) {
      this.showIndex = index
    },
    createSuccess (event) {
      if (event.id && event.date === this.eventsCount[this.showIndex].date) {
        // +1
        this.eventsCount[this.showIndex].count++
      }
    },
    // 显示新建事件的时候，需要验证用户权限
    bindShowAdd (params) {
      if (!this.userInfo) {
        this.showAuthorize = 1
      }
    },
    changeAuthorize (val) {
      this.showAuthorize = val
    }
  }
}
</script>

<style scoped lang="scss">
@import 'src/scss/mixin';

$img-size: 60rpx;
.weather-info {
  position: absolute;
  z-index: 100;
  right: 20px;
  top: 10px;
  color: #656565;
  img {
    width: $img-size;
    height: $img-size;
    margin-left: 20rpx;
    border-radius: 50%;
    transform: translateY(10rpx);
  }
}
.main {
  width: 100%;
  height: 100%;
  overflow: hidden;
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
    .small-size {
      font-size: $size * 0.45;
    }
  }
}
.article {
  // position: relative;
  @include flex-center();
  top: 0;
}
.box {
  padding: 40rpx;
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
  .info {
    font-weight: 600;
  }
}
</style>
