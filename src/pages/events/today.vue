<template>
  <div class="page">
    <div class="page__hd">
      <h1 class="page__title">{{pageTitle}}</h1>
    </div>
    <div class="page__bd page__bd_spacing">
      <div class="card-list events-list" v-if="events.length">
        <div class="card-item" v-for="(item, index) in events" :key="index" :style="{'transform': 'translateY('+ index * 90 + 'rpx)'}" :class="{'card-show': showIndex == index, 'card-hide': showIndex > -1 && showIndex != index}">
          <div class="card-item-hd" @click="expandCard(index)">
            <h2 class="title">{{item.name}}</h2>
            <span class="date-tag">{{item.date_format}}</span>
          </div>
          <div class="card-item-bd">
            <p class="author">创建人: {{item.member.nickname}}</p>
            <p class="desc">{{item.description}}</p>
            <p class="date">{{item.date}}</p>
          </div>
        </div>
      </div>
      <div class="events-list-nodata" v-else>这天没有生日记录</div>
    </div>
    <div class="card-mask" @click="showIndex = -1" v-show="showIndex > -1"></div>
    <common-footer></common-footer>
  </div>
</template>
<script>
import mptoast from 'mptoast'
import store from '../index/store'
import commonFooter from '../../components/footer'
import {formatDate} from '../../utils'
import {getEventsByDate} from '../../service'

export default {
  data () {
    return {
      events: [],
      pageTitle: '',
      showIndex: -1
    }
  },
  components: {
    mptoast, commonFooter
  },
  created () {
    this.$mptoast('加载中...')
    // 调用应用实例的方法获取全局数据
    // this.getUserInfo()
  },
  mounted () {
    this.initData()
  },
  computed: {
    userInfo () {
      return store.state.userInfo
    },
    userData () {
      return store.state.userData
    }
  },
  methods: {
    async initData () {
      const queryDate = this.$root.$mp.query.date
      this.pageTitle = formatDate(queryDate) + '生日'
      this.events = await getEventsByDate(queryDate)
      // 如果只有一个卡片，则展开显示TA
      if (this.events.length === 1) {
        this.showIndex = 0
      }
    },
    expandCard (index) {
      this.showIndex = index
    }
  }
}
</script>
<style lang="scss" scoped>
.page__title {
  font-weight: 600;
  text-align: center;
}
.events-list {
  text-align: left;
}
.card-item-hd {
  position: relative;
}
.date, .date-tag {
  position: absolute;
  right: 20rpx;
  bottom: 30rpx;
  color: #57a3f3;
  font-size: 26rpx;
}
.date {
  display: none;
  font-size: 32rpx;
}
.card-show {
  .date-tag {
    display: none;
  }
  .date {
    display: block;
  }
}
.author {
  color: #999;
  font-size: 32rpx;
}
.events-list-nodata {
  padding: 80rpx 0;
  text-align: center;
  color: #999;
}
</style>

