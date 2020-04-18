import ShareHelper from '../../../utils/share.js';

const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({
  data: {
    isFirstLoad: true,
    //用户信息
    userInfo: {
      userid: '--',
      mmbi: '--',
      readMin: '--'
    },
    //阅读记录
    readRecordSummary: {
      bookCount: '--',
      chapterCount: '--'
    },
    //小说收藏数
    bookCollectionCount: '--'
  },

  // 检查是都已微信授权
  isWechatAuth() {
    const openid = wx.getStorageSync(storageKeys.openid)
    if (openid) {
      this.setData({
        openid: openid
      })
      return true
    } else {
      wx.navigateTo({
        url: '../login/login',
      })
      return false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    if (!that.isWechatAuth()) return false
    if (that.data.isFirstLoad) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 30000
      })
      let p = that.getBookUserInfo(that.data.openid)
      p.then(res => {
        that.getBookReadRecordSummary(that.data.openid)
      })
    }
    that.setData({
      isFirstLoad: false
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return ShareHelper.DefaultSetting(e)
  },

  // /**
  //  * 跳转到个人账户页面
  //  */
  // onRedirectToAccount: function () {
  //   wx.navigateTo({
  //     url: '../account/index'
  //   })
  // },

  /**
   * 跳转到最近阅读页面
   */
  onRedirectToLastReading: function () {
    wx.navigateTo({
      url: '../lastreading/lastreading'
    })
  },

  /**
   * 跳转到收藏页面
   */
  onRedirectToCollection: function () {
    let that = this
    if (that.data.bookCollectionCount == 0) {
      wx.showToast({
        title: '您还没有任何收藏~~',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: '../collection/index'
      })
    }
  },

  /**
   * 跳转到用户系统信息页面
   */
  onRedirectToMessage: function () {
    wx.navigateTo({
      url: '../message/message'
    })
  },

  // 获取book用户信息
  getBookUserInfo(openid) {
    let that = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: remoteApiUrl.bookUser.getByOpenid,
        data: {
          openid: openid
        },
        success(res) {
          const {
            code,
            data,
            msg
          } = res.data
          if (code == 0) {
            that.setData({
              userInfo: data
            })
            resolve(data)
          } else {
            wx.showToast({
              title: msg,
              icon: 'none',
              duration: 5000
            })
          }
        }
      })
    })
  },
  // 书本阅读记录汇总信息
  getBookReadRecordSummary(openid) {
    let that = this
    wx.request({
      url: remoteApiUrl.bookReadRecord.getBookReadRecordSummary,
      data: {
        openid: openid
      },
      success(res) {
        let {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          data.readTime = that.convertTime_H_M(data.readMinutes)
          that.setData({
            readRecordSummary: data
          })
        } else {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 5000
          })
        }
        wx.hideToast()
      }
    })
  },
  //将分钟转为 x小时xx分
  convertTime_H_M: val => {
    return Math.floor(val / 60) + '小时' + ('000000000000000000' + Math.floor(val % 60)).slice(-1 * 2) + '分';
  }

})