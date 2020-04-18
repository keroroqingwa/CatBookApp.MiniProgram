import ShareHelper from '../../utils/share.js';

const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({
  data: {
    openid: '',
    searchWord: null,
    isLoading: false,
    //书本分类
    bookCategoryList: null,
    rule: null,
    //书本列表
    bookList: null,
    //最后一页
    isLastPn: false,
    //是否显示填写反馈信息表单
    showFeedback: false
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
    //console.info('options', options)
    that.setData({
      searchWord: decodeURIComponent(options.s)
    })
    //获取所有搜索来源分类
    this.GetBookSearchList();
  },
  onShow: function () {
    // 不写在onLoad方法中，因为授权登录跳转后需要重新刷新页面变量[openid]
    const openid = wx.getStorageSync(storageKeys.openid)
    if (openid) {
      this.setData({
        openid: openid
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return ShareHelper.DefaultSetting(e)
  },

  /**
   * 搜索
   */
  formSubmit: function (e) {
    let that = this
    let _txt = e.detail.value.s_name.trim();
    if (_txt != '') {
      that.setData({
        searchWord: _txt,
        bookList: null
      })
      that.GetBookList(1);
    }
  },
  confirmEvent: function (e) {
    let that = this
    let _txt = e.detail.value.trim();
    if (_txt != '') {
      that.setData({
        searchWord: _txt,
        bookList: null
      })
      that.GetBookList(1);
    }
  },

  /**
   * 获取所有搜索来源分类
   */
  GetBookSearchList() {
    let that = this
    wx.request({
      url: remoteApiUrl.bookSearch.getBookCategoryList,
      data: {},
      success(res) {
        console.info('获取所有搜索来源分类', res.data)
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          that.setData({
            bookCategoryList: data
          })
          data.forEach((row, index, mapObj) => {
            if (row.active) {
              that.setData({
                rule: row.value
              })
            }
          })
          //搜索小说
          that.GetBookList(1);
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
   * 搜索小说
   */
  GetBookList(pn) {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 30000
    })
    let that = this
    wx.request({
      url: remoteApiUrl.bookSearch.getBooks,
      data: {
        q: that.data.searchWord,
        pn,
        rule: that.data.rule
      },
      success(res) {
        console.info('搜索小说', res.data)
        const {
          code,
          data,
          msg
        } = res.data
        //更新列表数据
        if (code == 0 && !!data) {
          let _books = that.data.bookList || []
          _books.push(...data)
          that.setData({
            bookList: _books
          })
        } else {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 5000
          })
        }
        //更新状态
        that.setData({
          isLoading: false
        });
        wx.hideToast();
        //判断是否已是最后一页
        if (!data || data.length != 10) {
          that.setData({
            isLastPn: true
          })
        }
        //没有搜索到书本
        if (pn == 1 && data.length == 0) {
          that.setData({
            showFeedback: true
          })
        }
      }
    })
  },

  /**
   * 按搜索来源搜索
   */
  SearchByRule: function (e) {
    let that = this
    const {
      rule
    } = e.target.dataset
    if (that.data.rule == rule) return;
    that.setData({
      rule: rule,
      bookList: null
    });
    that.GetBookList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.info('onReachBottom')
    let that = this
    if (that.data.isLoading) return;
    if (that.data.isLastPn) return;
    that.setData({
      isLoading: true
    });
    const _pn = that.data.bookList.length / 10 + 1;
    that.GetBookList(_pn);
  },

  /**
   * 跳转到小说介绍页
   */
  onRedirectToIntro(e) {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 30000
    })
    let that = this
    const idx = encodeURIComponent(e.currentTarget.dataset.idx)
    const bookObj = that.data.bookList[idx];
    bookObj.rule = that.data.rule;
    wx.navigateTo({
      url: `../intro/intro?rule=${bookObj.rule}&bookLink=${bookObj.bookLink}&bookClassify=${bookObj.bookClassify}&coverImage=${bookObj.coverImage}`
    })
  },

})