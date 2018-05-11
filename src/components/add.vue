<template>
  <div>
    <div class="mask" v-if="showAddDialog" @click="hideDialog"></div>
    <div class="dialog" v-if="showAddDialog">
      <div class="dialog-title">创建一个生日提醒</div>
      <div class="dialog-content">
        <input class="input-control" type="date" name="date" v-model="formData.date" required>
        <input type="text" class="input-control" name="name" placeholder="生日名称：李雷" v-model="formData.name" :placeholder-style="placeholderStyle" focus="true" />
        <input class="input-control" name="description" v-model="formData.description" placeholder="这天是李雷的阴历生日" :placeholder-style="placeholderStyle">
        <div class="input-group">
          <checkbox-group @change="changePublic">
            <label class="checkbox">
              <checkbox  class="input-checkbox" name="is_public" id="is_public" value="1" :checked="formData.isPublic" />对所有人公开
            </label>
          </checkbox-group>
        </div>
        <div class="input-group">
          <button type="submit" class="btn-primary" :loading="loading" @click="addEventHandler">立即创建</button>
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
      initDate: '',
      showAddDialog: false,
      placeholderStyle: 'color:#ddd;',
      formData: {
        name: '',
        description: '',
        isPublic: false
      },
      // ajax doing
      loading: false,
      errorMessage: ''
    }
  },
  mounted () {
    const date = this.date
    if (!date) {
      const today = new Date()
      this.date = formatDate(today)
    }
    this.formData.date = this.date
  },
  watch: {
    'date': 'changeDate'
  },
  methods: {
    changeDate (newDate) {
      // console.log(newDate)
      this.date = newDate
      this.formData.date = newDate
    },
    changeDialogStatus () {
      this.showAddDialog = !this.showAddDialog
    },
    hideDialog () {
      this.showAddDialog = false
    },
    async addEventHandler () {
      this.errorMessage = ''
      if (!this.formData.name) {
        this.errorMessage = '标题不能为空'
        return
      }
      if (!this.formData.date) {
        this.errorMessage = '日期不能为空'
        return
      }
      const formData = this.formData
      formData['is_public'] = formData.isPublic
      if (this.loading) {
        return
      }
      this.loading = true
      const data = await addEvent(formData)
      // console.log(data)
      this.loading = false
      if (data.id) {
        this.errorMessage = '创建成功'
        this.resetForm()
        this.hideDialog()
        // emit parent
        this.$emit('created', data)
      } else {
        this.errorMessage = data.message
      }
    },
    changePublic () {
      this.formData.isPublic = !this.formData.isPublic
    },
    resetForm () {
      this.errorMessage = ''
      this.formData = {
        name: '',
        description: '',
        date: this.date,
        isPublic: false
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
  border-top: 1px solid $main-color;
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
