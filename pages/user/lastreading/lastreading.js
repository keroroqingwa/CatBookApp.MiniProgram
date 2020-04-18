import ShareHelper from '../../../utils/share.js';

const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({
  data: {
    isLoadSuccessed: false,
    booklist: [],
    bookCount: 0,
    showLoadMoreBtn: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    const openid = wx.getStorageSync(storageKeys.openid)
    //获取用户最近阅读
    that.onLoadData(openid);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return ShareHelper.DefaultSetting(e)
  },

  /**
   * 加载数据
   */
  onLoadData: function (openid) {
    let that = this
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 30000
    })
    wx.request({
      url: remoteApiUrl.bookReadRecord.getPagedByLastReading,
      data: {
        openid,
        MaxResultCount: 10,
        SkipCount: that.data.booklist.length
      },
      success(res) {
        console.info('获取最近阅读记录', res.data)
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          data.items.map((row, idx) => {
            row.time = row.lastModificationTime || row.creationTime
            row.time = row.time.split('T')[0]
          })
          that.setData({
            booklist: that.data.booklist.concat(...data.items),
            bookCount: data.totalCount,
            isLoadSuccessed: true,
            showLoadMoreBtn: that.data.booklist.concat(...data.items).length < data.totalCount
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

  /**
   * 加载更多
   */
  onLoadMore: function () {
    let that = this
    const openid = wx.getStorageSync(storageKeys.openid)
    that.onLoadData(openid)
  },

  /**
   * 跳转到小说介绍页面
   */
  onRedirectToBookIntro: function (e) {
    let id = encodeURIComponent(e.currentTarget.dataset.id)
    //跳转到书本章节阅读页
    wx.navigateTo({
      url: `../../chapter/chapter?bookReadRecordId=${id}`
    })

  }
})