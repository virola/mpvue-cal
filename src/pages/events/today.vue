<template>
  <div class="page">
    <div class="page__hd">
      <h1 class="page__title">{{pageTitle}}</h1>
    </div>
    <div class="page__bd page__bd_spacing" v-if="inited">
      <div class="card-wrap" v-if="events.length">
        <div class="card-list events-list" :style="{'min-height': events.length * 90 + 'rpx'}">
          <div class="card-item" v-for="(item, index) in events" :key="index" :style="{'transform': 'translateY('+ index * 90 + 'rpx)'}" :class="{'card-show': showIndex == index, 'card-hide': showIndex > -1 && showIndex != index}">
            <div class="card-item-hd" @click="toggleCard(index)">
              <h2 class="title">{{item.name}}</h2>
              <span class="date-tag text-info">{{item.date_format}}</span>
            </div>
            <div class="card-item-bd">
              <div class="flex-row">
                <view class="author">创建人: {{item.member.nickname}}</view>
                <view class="public">
                  <text v-if="item.is_public">公开</text>
                  <text v-else>私有</text>
                </view>
              </div>
              
              <p class="desc">{{item.description}}</p>
              <p class="date text-secondary">{{item.date}}</p>
            </div>
            <div class="card-item-operates" v-if="userData.id && userData.id == item.member_id">
              <span class="text-primary" @click="startEdit(index)">编辑</span>
              <span class="text-warn" @click="confirmDelete(index)">删除</span>
            </div>
          </div>

          <div class="card-mask" @click="toggleCard" v-show="showIndex > -1"></div>
        </div>
        <div class="card-list-loadmore loadmore" @click="handleLoadMore">
          <div class="text" v-if="showLoadMore">加载更多</div>
          <div class="loading" v-if="showLoading"><span class="animation"></span></div>
          <div class="text loadmore-over" v-if="showLoadOver">- END -</div>
        </div>
      </div>
      <div class="events-list-nodata" v-else>这天没有生日记录</div>
    </div>
    <div class="card-mask" @click="toggleCard" v-show="showIndex > -1"></div>
    <common-footer></common-footer>
    <mptoast />
    <add v-if="showIndex == -1" :date="date" @created="createSuccess" />

    <confirm-dialog v-if="showDialog" @submit="submitDelete" @cancel="showDialog = 0" :content="dialogContent" />
  </div>
</template>
<script>
import mptoast from 'mptoast'
import store from '../index/store'
import commonFooter from '../../components/footer'
import add from '../../components/add'
import confirmDialog from '../../components/dialog'
import {formatDateText} from '../../utils'
import {getEventsByDate, deleteEvent} from '../../service'

export default {
  data () {
    return {
      inited: 0,
      events: [],
      pageTitle: '',
      showIndex: -1,
      date: '',
      // 确认框
      deleteIndex: -1,
      showDialog: 0,
      dialogContent: '',
      // 加载更多参数
      page: 1,
      pagesize: 10,
      showLoadMore: 1,
      showLoading: 0,
      showLoadOver: 0
    }
  },
  components: {
    mptoast, commonFooter, add, confirmDialog
  },
  created () {
    this.$mptoast('加载中...')
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
      this.showIndex = -1
      const queryDate = this.$root.$mp.query.date
      this.date = queryDate
      this.pageTitle = formatDateText(queryDate) + '生日'
      this.events = await getEventsByDate({date: this.date})
      // 如果只有一个卡片，则展开显示TA
      if (this.events.length === 1) {
        this.showIndex = 0
      }
      if (this.events.length < this.pagesize) {
        this.showLoadMore = 0
        this.showLoadOver = 1
      }
      this.inited = 1
    },
    toggleCard (index) {
      if (this.showIndex > -1) {
        this.showIndex = -1
      } else {
        this.showIndex = index
      }
    },
    // edit card
    startEdit (index) {
      const data = this.events[index]
      console.log('edit', data.id)
    },
    // delete card
    confirmDelete (index) {
      this.deleteIndex = index
      const data = this.events[index]
      this.dialogContent = '确定要删除 ' + data.name + ' 吗？'
      this.showDialog = 1
    },
    // 确认删除卡片的操作
    async submitDelete () {
      const data = this.events[this.deleteIndex]
      if (data && data.id) {
        let result = await deleteEvent(data.id)
        // console.log(result)
        if (result.status) {
          // fail
          this.$mptoast(result.message)
        } else {
          // success
          this.$mptoast('删除成功')
          // 隐藏&重置
          this.showIndex = -1
          this.events.splice(this.deleteIndex, 1)
          this.deleteIndex = -1
          this.showDialog = 0
        }
      }
    },
    async handleLoadMore () {
      if (this.showLoadOver) {
        return
      }
      this.showLoading = 1
      this.page++
      const list = await getEventsByDate({date: this.date, page: this.page})
      if (list.length) {
        this.showLoadMore = 1
        this.events = this.events.concat(list)
      }
      if (list.length < this.pagesize) {
        this.showLoadMore = 0
        this.showLoadOver = 1
      }
      this.showLoading = 0
    },
    // 新建成功
    createSuccess (event) {
      if (event.id && event.date === this.date) {
        this.events.unshift(event)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../scss/mixin';
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
  right: 30rpx;
  bottom: 30rpx;
  font-size: 26rpx;
}
.date {
  display: none;
  font-size: 32rpx;
}
.card-item-operates {
  position: absolute;
  left: 30rpx;
  bottom: 30rpx;
  display: none;
  span {
    margin-right: 30rpx;
  }
}
.text-info {
  color: #17a2b8!important;
}
.text-primary {
  color: #007bff!important;
}
.text-warn {
  color: #dc3545!important;
}
.text-secondary {
  color: #6c757d!important;
}
.card-show {
  .date-tag {
    display: none;
  }
  .date, .card-item-operates {
    display: block;
  }
  .title {
    color: $main-color;
  }
}
.author, .public {
  color: #999;
  font-size: 32rpx;
}
.desc {
  margin-top: 20px;
  word-wrap: break-word;
}
.events-list-nodata {
  padding: 80rpx 0;
  text-align: center;
  color: #999;
}
</style>

