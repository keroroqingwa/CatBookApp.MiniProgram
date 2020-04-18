//index.js
import ShareHelper from '../../utils/share.js';

const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({
  data: {
    openid: '',
    bookReadRecordList: [],
    bookReadRecordLoading: false,
  },
  onLoad: function () {},
  onShow: function () {
    // 不写在onLoad方法中，因为授权登录跳转后需要重新刷新页面变量[openid]
    const openid = wx.getStorageSync(storageKeys.openid)
    if (openid) {
      this.setData({
        openid: openid
      })
      this.loadBookReadRecord(this.data.openid)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return ShareHelper.DefaultSetting(e)
  },
  // 跳转至个人中心
  onRedirectToUserPage: function (e) {
    if (!this.data.openid) {
      // 未登录，跳转至授权登录页
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.navigateTo({
        url: '../user/index/index',
      })
    }
  },
  // 搜索
  formSubmit: function (e) {
    let _txt = e.detail.value.s_name.trim();
    this.redirectFunc(encodeURIComponent(_txt));
  },
  confirmEvent: function (e) {
    let _txt = e.detail.value.trim();
    this.redirectFunc(encodeURIComponent(_txt));
  },
  // 跳转到搜索页
  redirectFunc: function (name) {
    if (name == '') {
      wx.showToast({
        title: '请输入书名或作者名称',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: '../search/search?s=' + name
      })
    }
  },
  // 获取最近阅读记录
  loadBookReadRecord: function (openid) {
    let that = this
    that.setData({
      bookReadRecordLoading: true,
      bookReadRecordLoadingTips: '数据获取中......'
    })
    wx.request({
      url: remoteApiUrl.bookReadRecord.getPagedByLastReading,
      data: {
        openid
      },
      success(res) {
        console.info('获取最近阅读记录', res.data)
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          that.setData({
            bookReadRecordList: data.items
          })
        } else {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 5000
          })
        }
        that.setData({
          bookReadRecordLoading: false
        })
      }
    })
  },
  // 跳转到文章页面
  onRedirectToBookChapter: function (e) {
    let id = encodeURIComponent(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: `../chapter/chapter?bookReadRecordId=${id}`
    })
  },
})