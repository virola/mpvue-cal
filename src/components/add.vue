<template>
  <div>
    <div class="mask" v-show="showAddDialog" @click="hideDialog"></div>
    <div class="dialog" v-show="showAddDialog">
      <div class="dialog-title">创建一个生日提醒</div>
      <div class="dialog-content">
        <input class="input-control" type="date" name="date" v-model="date" required>
        <input type="text" class="input-control" name="name" placeholder="生日名称：李雷" v-model="name" :placeholder-style="placeholderStyle" focus="true" />
        <input class="input-control" name="description" v-model="description" placeholder="这天是李雷的阴历生日" :placeholder-style="placeholderStyle">
        <div class="input-group">
          <input type="checkbox" class="input-checkbox" name="is_public" id="is_public" v-model="is_public">
          <label for="is_public">对所有人公开</label>
        </div>
        <div class="input-group">
          <button type="submit" class="btn-primary" @click="addEvent">立即创建</button>
        </div>
        <div v-if="errorMessage" class="error-message">{{errorMessage}}</div>
      </div>
    </div>
    <div class="icon-wrap">
      <div @click="changeDialogStatus" class="icon" :class="{'icon-add': !showAddDialog, 'icon-close': showAddDialog}">
        <div class="icon-text">+</div>
      </div>
    </div>
  </div>
</template>
<script>
import {formatDate} from '../utils'
import {addEvent} from '../service'
export default {
  props: [ 'date' ],
  data () {
    return {
      showAddDialog: false,
      placeholderStyle: 'color:#ddd;',
      name: '',
      description: '',
      'is_public': false,
      errorMessage: ''
    }
  },
  mounted () {
    const date = this.date
    if (!date) {
      const today = new Date()
      this.date = formatDate(today)
    }
  },
  methods: {
    changeDialogStatus () {
      this.showAddDialog = !this.showAddDialog
    },
    hideDialog () {
      this.showAddDialog = false
    },
    async addEvent () {
      const formData = {
        name: this.name,
        description: this.description,
        date: this.date,
        'is_public': this['is_public']
      }
      if (!formData.name) {
        this.errorMessage = '标题不能为空'
        return
      }
      if (!formData.date) {
        this.errorMessage = '日期不能为空'
      }
      // console.log(formData)
      const resp = await addEvent(formData)
      // console.log(resp)
      if (resp.status !== 'ok') {
        this.errorMessage = resp.message
      } else {
        this.errorMessage = ''
        this.hideDialog()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../scss/mixin';

$size: 100rpx;
.icon-wrap {
  position: fixed;
  z-index: 100;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: $size;
  height: $size;

  .icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: $main-color;
    color: #fff;
    text-align: center;
    transition: all .3s linear;
  }
  .icon-text {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    font-size: $size;
    line-height: 0.8;
  }
  .icon-close {
    background: #aaa;
    transform: rotate(45deg);
  }
}
.mask {
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: .5;
  background: #000;
}
.dialog {
  position: fixed;
  z-index: 102;
  top: 10%;
  left: 10%;
  width: 80%;
  background: #fff;
  border-radius: 6rpx;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
}
.dialog-title {
  margin: 20rpx 40rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #dedede;
  font-size: 40rpx;
  color: $main-color;
  text-align: center;
}
.dialog-content {
  padding: 20rpx 40rpx;
  color: #878787;
}
.input-control, .input-group {
  width: 100%;
  margin-bottom: 40rpx;
}
// .input-group {
//   padding-bottom: 20rpx;
// }
textarea {
  height: 10;
}
.input-checkbox {
  margin-right: 10rpx;
}
.btn {
  margin: 50rpx 0;
}
.error-message {
  color: red;
}
</style>
