<template>
  <div class="container">
    <a class="weather-info">
      <span v-if="weatherInfo">{{weatherInfo.now.tmp}}℃ {{weatherInfo.basic.parent_city}} {{weatherInfo.basic.location}}</span>
      <img v-if="userInfo" :src="userInfo.avatarUrl" width="20rpx" height="20rpx">
    </a>
    <div class="main" :style="{height: (clientHeight * 0.8) + 'px'}">
      <div @touchstart.prevent="dragStartEvent" @touchmove.prevent="dragMoveEvent"  @touchend.prevent="dragEndEvent" v-if="datesInfo" class="card-row" :style="{transform: 'translateX(' + (-(showIndex - currentIndex) * 750 * (0.72 + 0.04) + cardTranslate) + 'rpx)'}">
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
                <p v-if="item.format_text === '今天'">{{item.lunar.year}}</p>
                <p class="info" v-if="item.format_text !== item.date.item">{{item.format_text}}</p>
                <p class="tip" v-if="eventsCount[index].count">点击进入生日列表</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="events" v-show="myEvents[currentDate] && myEvents[currentDate].length">
      <h3 class="title text-title">我的提醒</h3>
      <ul>
        <li v-for="(event, index) in myEvents[currentDate]" :key="index">
          <h3>{{event.name}}</h3>
        </li>
      </ul>
    </div>

    <mptoast />
    <add :date="currentDate" @created="createSuccess" @showDialog="bindShowAdd"></add>
    <authDialog :show="showAuthorize" @hide="changeAuthorize(0)" />
  </div>
</template>

<script>
import mptoast from 'mptoast'
import add from '../../components/add'
import authDialog from '../../components/authorize'
import store from '@/store'
import {getLocation, getWeather, getDates, getIndexCount, getMyEvents} from '../../service'

export default {
  data () {
    return {
      dataInited: 0,
      // 授权登录mask
      showAuthorize: 0,
      datesInfo: null,
      myEvents: {},
      today: null,
      currentDate: '',
      // 最中间那个card - 今天
      currentIndex: 0,
      // 左右滑动显示的index
      showIndex: 0,
      eventsCount: null,
      cardTranslate: 0,
      codeParams: {},
      // for touch events
      winwidth: wx.getSystemInfoSync().windowWidth,
      clientHeight: wx.getSystemInfoSync().windowHeight,
      cardsWidth: 0,
      dragState: {},
      touchParams: {
        x: 0,
        y: 0
      }
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
    'showIndex': 'changeCurrentDate',
    'userData': 'changeUserLogin'
  },
  methods: {
    // 日期跳转
    bindBoxClick (date) {
      const url = '/pages/events/main?date=' + date
      wx.navigateTo({ url })
    },
    async initWeather () {
      // todo
      // 每小时更新一次天气实况
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
      this.currentIndex = Math.floor(dates.list.length / 2)
      this.showIndex = this.currentIndex
      this.today = dates.today
      // card总长度
      this.cardsWidth = this.datesInfo.length * 750 * (0.72 + 0.04)
      // set mark
      this.dataInited = 1
    },
    // 数据请求
    async changeCurrentDate (index) {
      this.currentDate = this.datesInfo[index].date.item
      if (!this.myEvents[this.currentDate]) {
        if (this.userData && this.userData.id > 0) {
          const res = await getMyEvents({
            date: this.currentDate
          })
          this.myEvents[this.currentDate] = res.list
        }
      }
    },
    showToast (msg = '提示信息') {
      this.$mptoast(msg)
    },
    getUser () {
      if (!this.userInfo) {
        store.dispatch('getUserInfo')
      }
    },
    // click handler
    changeCard (index) {
      this.showIndex = index
    },
    createSuccess (event) {
      if (event.id && event.date === this.eventsCount[this.showIndex].date) {
        // +1
        this.eventsCount[this.showIndex].count++
        // this.myEvents[this.currentDate].unshift(event)
      }
      if (event.id && this.myEvents[event.date]) {
        this.myEvents[event.date].unshift(event)
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
    },
    async changeUserLogin (vals) {
      if (vals.id > 0) {
        try {
          this.eventsCount = (await getIndexCount()).list
          const res = await getMyEvents({})
          this.myEvents[res.date] = res.list
          // console.log(this.myEvents)
        } catch (e) {
          console.log(e)
        }
      }
    },
    bindNoTouch () {
      // console.log('prevent touch')
      // return false
    },
    // for touch events
    bindTouchStart (ev) {
      let dragState = this.dragState
      let event = ev.mp

      let touch = event.changedTouches ? event.changedTouches[0] : event
      dragState.startTime = new Date()
      dragState.startLeft = touch.pageX
      dragState.startTop = touch.pageY
      dragState.startTopAbsolute = touch.clientY
      dragState.dragPage = this.showIndex
      dragState.pageWidth = this.winwidth * 0.72
      // prev & next
      dragState.prevPage = dragState.dragPage === 0 ? null : dragState.dragPage - 1
      dragState.nextPage = dragState.dragPage === this.datesInfo.length - 1 ? null : dragState.dragPage + 1
      // debug
      // console.log(dragState)
    },
    bindTouchMove (ev) {
      let dragState = this.dragState
      let event = ev.mp
      let touch = event.changedTouches ? event.changedTouches[0] : event
      dragState.currentLeft = touch.pageX
      dragState.currentTop = touch.pageY
      dragState.currentTopAbsolute = touch.clientY
      let offsetLeft = dragState.currentLeft - dragState.startLeft
      let offsetTop = dragState.currentTopAbsolute - dragState.startTopAbsolute
      let distanceX = Math.abs(offsetLeft)
      let distanceY = Math.abs(offsetTop)
      if (distanceX < 5 || (distanceX >= 5 && distanceY >= 1.73 * distanceX)) {
        this.userScrolling = true
        return
      } else {
        this.userScrolling = false
        ev.preventDefault()
      }
      offsetLeft = Math.min(Math.max(-dragState.pageWidth + 1, offsetLeft), dragState.pageWidth - 1)

      let towards = offsetLeft < 0 ? 'next' : 'prev'
      if (dragState.prevPage !== null && towards === 'prev') {
        this.translate(dragState.prevPage, offsetLeft - dragState.pageWidth)
      } else if (dragState.nextPage !== null && towards === 'next') {
        this.translate(dragState.nextPage, offsetLeft + dragState.pageWidth)
      } else {
        // when continuous=false and it's the end of each side,
        // limit swipe width with quadratic-functional ease
        // y = (-1 / dk) x (|x| - 2k)
        const k = dragState.pageWidth
        const x = offsetLeft
        const d = 6 // scroll until 1/d of screenWidth at maximum
        offsetLeft = -1 / d / k * x * (Math.abs(x) - 2 * k)
      }
      this.translate(dragState.dragPage, offsetLeft)
    },
    bindTouchEnd (ev) {
      let dragState = this.dragState
      let dragDuration = new Date() - dragState.startTime
      let towards = null
      let offsetLeft = dragState.currentLeft - dragState.startLeft
      let offsetTop = dragState.currentTop - dragState.startTop
      let pageWidth = dragState.pageWidth
      let index = this.showIndex
      let pageCount = this.datesInfo.length

      if (dragDuration < 300) {
        let fireTap = Math.abs(offsetLeft) < 5 && Math.abs(offsetTop) < 5
        if (isNaN(offsetLeft) || isNaN(offsetTop)) {
          fireTap = true
        }
        if (fireTap) {
          // this.$children[this.index].$emit('tap')
        }
      }
      if (dragDuration < 300 && dragState.currentLeft === undefined) return
      if (dragDuration < 300 || Math.abs(offsetLeft) > pageWidth / 2) {
        towards = offsetLeft < 0 ? 'next' : 'prev'
      }
      if (!this.continuous) {
        if ((index === 0 && towards === 'prev') || (index === pageCount - 1 && towards === 'next')) {
          towards = null
        }
      }
      if (this.$children.length < 2) {
        towards = null
      }
      this.doAnimate(towards)
      this.dragState = {}
    },
    dragStartEvent (event) {
      event.preventDefault()
      event.stopPropagation()
      this.dragging = true
      this.userScrolling = false
      this.bindTouchStart(event)
    },
    dragMoveEvent (event) {
      if (!this.dragging) {
        return
      }
      this.bindTouchMove(event)
    },
    dragEndEvent (event) {
      if (this.userScrolling) {
        this.dragging = false
        this.dragState = {}
        return
      }
      if (!this.dragging) {
        return
      }
      this.bindTouchEnd(event)
      this.dragging = false
    },
    translate (pageIndex, offset) {
      this.cardTranslate = offset * 750 / this.winwidth
    },
    doAnimate (towards) {
      if (towards === 'prev') {
        this.showIndex = Math.max(this.showIndex - 1, 0)
      } else if (towards === 'next') {
        this.showIndex = Math.min(this.showIndex + 1, this.datesInfo.length - 1)
      }
      this.cardTranslate = 0
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
  position: relative;
  width: $win-width;
  // background: #ccc;
  overflow: hidden;
}
.events {
  // position: absolute;
  // left: 4%;
  // width: 92%;
  // top: 84%;
  padding: 20px 40px 80px;
  .title {
    padding: 6px 20px;
    border-left: 3px solid $main-color;
  }
  ul {
    padding: 10px 20px;
  }
  li {
    color: #656565;
    // margin: 5px;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
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
