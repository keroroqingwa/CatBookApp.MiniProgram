import ShareHelper from '../../../utils/share.js';

const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({
  data: {
    btnDisabled: '',
    messages: null,
    inputValue: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    //获取系统信息记录
    wx.request({
      url: remoteApiUrl.bookUserMessage.getAll,
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
          data.map((row, idx) => {
            row.time = row.lastModificationTime || row.creationTime
            row.time = row.time.split('T')[0]
          })
          that.setData({
            messages: data
          });
        } else {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 5000
          })
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return ShareHelper.DefaultSetting(e)
  }
})