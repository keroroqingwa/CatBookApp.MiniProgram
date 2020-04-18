import ShareHelper from '../../utils/share.js';

const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({
  data: {
    bookInfo: null,
    bookLink: null,
    bookClassify: null,
    coverImage: null,
    rule: null,
    curSort: 'asc',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 30000
    })
    console.info('options', options)
    that.setData({
      bookLink: decodeURIComponent(options.bookLink),
      rule: options.rule,
      bookClassify: options.bookClassify,
      coverImage: options.coverImage,
    })
    //获取小说目录信息
    this.GetBookChapters();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return ShareHelper.DefaultSetting(e)
  },

  /**
   * 小说目录信息
   */
  GetBookChapters: function () {
    let that = this
    wx.request({
      url: remoteApiUrl.bookSearch.getBookChapters,
      data: {
        bookLink: that.data.bookLink,
        rule: that.data.rule
      },
      success(res) {
        console.info('小说目录信息', res.data)
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          that.setData({
            bookInfo: data
          })
          setTimeout(function () {
            wx.hideToast();
          }, 1000 * 1);
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
   * 跳转到小说章节内容页
   */
  onRedirectToChapter(e) {
    let that = this
    const _link = e.currentTarget.dataset.chapterlink
    wx.navigateTo({
      url: `../chapter/chapter?rule=${that.data.rule}&chapterLink=${encodeURIComponent(_link)}&bookClassify=${that.data.bookClassify}&author=${that.data.bookInfo.author}&bookLink=${that.data.bookLink}&coverImage=${that.data.coverImage}`
    })
  },

  /**
   * 章节正序/倒序
   */
  changeChaptersSort: function (e) {
    let that = this
    const _sort = e.currentTarget.dataset.sort
    if (that.data.curSort != _sort) {
      that.data.bookInfo.chapterlist.reverse();
      that.setData({
        bookInfo: that.data.bookInfo,
        curSort: _sort
      });
    }
  }

})