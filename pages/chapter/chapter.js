import ShareHelper from '../../utils/share.js';

const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({
  data: {
    options: null,
    isPageOnShow: true,
    bookInfo: null, //当前章节的书本章节信息
    bookInfoByNext: null, //下一章的书本章节信息
    bookReadRecordId: null, //当前书本阅读记录id
    isLoadSuccess: false,
    scrollTop: 0, //设置竖向滚动条位置
    scrollTopByScrolling: 0, //滚动条滚动结束后的 滚动条位置
    windowHeight: 0,
    showSetting: false, //是否显示个人设置
    showModal: false, //是否显示模态框
    personSetting: {
      iconBgColor: null, //背景色选项
      iconFontColor: null, //字体色选项
      fontFamilySelect: null, //字体选项
      dayOrNight: null, //日夜模式切换
      keepScreenOn: null, //是否屏幕常亮
      backgroundColor: null, //当前背景色
      fontSize: null, //当前文字大小
      fontColor: null, //当前字体色
      fontFamily: null, //当前字体
    },
  },

  // 初始化个人设置
  initPersonSetting() {
    this.setData({
      personSetting: {
        //背景色选项
        iconBgColor: [
          '#000', '#666', '#EAEAEF', '#fff', '#FAF9DE', '#FFF2E2', '#FDE6E0', '#E3EDCD', '#DCE2F1', '#E9EBFE'
        ],
        //字体色选项
        iconFontColor: [
          '#000', '#666', '#EAEAEF', '#fff', '#FAF9DE', '#FFF2E2', '#FDE6E0', '#E3EDCD', '#DCE2F1', '#E9EBFE'
        ],
        //字体色选项
        fontFamilySelect: [
          {key: 'Microsoft YaHei', text: '微软雅黑'},{key: 'cursive', text: '草书字体'},{key: 'serif', text: '有衬线字体'}
        ],
        dayOrNight: 'daytime', //日夜模式切换
        keepScreenOn: false, //是否屏幕常亮
        backgroundColor: '#fff', //当前背景色
        fontSize: 18, //当前文字大小
        fontColor: '#000', //当前字体色
        fontFamily: 'Microsoft YaHei', //字体
      }
    })
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
  onLoad: function (options) {
    let that = this;
    that.setData({
      options
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 30000
    })
    if (!that.isWechatAuth()) return false
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    //获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    });
    //创建一个计时器，用来做“上传阅读时长”的相关业务
    that.createTaskByReadDuration();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    if (!that.isWechatAuth()) return false
    that.initLoad()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      isPageOnShow: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      isPageOnShow: false
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return ShareHelper.DefaultSetting(e)
  },

  // 初始化处理
  initLoad() {
    let that = this
    const options = that.data.options
    if (options.bookReadRecordId) {
      // 从首页等地方进入
      let p = that.getBookReadRecord(options.bookReadRecordId)
      p.then(res => {
        that.setData({
          rule: res.rule,
          bookReadRecordId: res.id,
          prePageParams: {
            author: res.author,
            bookClassify: res.bookClassify,
            coverImage: res.coverImage
          }
        })
        //获取小说内容
        this.GetBookContent(res.chapterLink);
      })
    } else {
      // 从书本简介页(intro)进入
      let chapterLink = decodeURIComponent(options.chapterLink);
      that.setData({
        rule: options.rule,
        bookReadRecordId: options.bookReadRecordId,
        prePageParams: {
          author: options.author,
          bookClassify: options.bookClassify,
          coverImage: options.coverImage
        }
      })
      //获取小说内容
      this.GetBookContent(chapterLink);
    }
    //偏好设置初始化
    that.onInitSetting();
    //
    that.setData({
      isPageOnShow: true
    })
  },

  /**
   * 获取书本阅读记录信息
   */
  getBookReadRecord: function (bookReadRecordId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: remoteApiUrl.bookReadRecord.get,
        data: {
          id: bookReadRecordId
        },
        success(res) {
          const {
            code,
            data,
            msg
          } = res.data
          if (code == 0) {
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
  /**
   * 获取小说内容
   */
  GetBookContent: function (link) {
    let that = this
    wx.request({
      url: remoteApiUrl.bookSearch.getBookContent,
      data: {
        chapterLink: link,
        rule: that.data.rule
      },
      success(res) {
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          that.showBookContent(data)
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
   * 获取小说内容(下一章)
   */
  GetBookContentByNextChapter: function (link) {
    let that = this
    wx.request({
      url: remoteApiUrl.bookSearch.getBookContent,
      data: {
        chapterLink: link,
        rule: that.data.rule
      },
      success: res => {
        console.info('获取小说内容(下一章)', res)
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          that.setData({
            bookInfoByNext: data
          })
        }
      }
    })
  },
  /**
   * 显示小说内容
   */
  timerByLoadNextChapter: null, //定时器（自动加载下一章）
  showBookContent(data) {
    let that = this
    that.setData({
      bookInfo: data,
      scrollTop: 0,
      isLoadSuccess: true,
      bookInfoByNext: null
    })
    //设置标题
    wx.setNavigationBarTitle({
      title: `${data.chapterName} - ${data.bookName}`
    })
    wx.hideToast();
    //新增或更新章节阅读记录
    that.onAddReadingRecord()
    that.timerByLoadNextChapter = setTimeout(() => {
      //加载下一章
      that.GetBookContentByNextChapter(data.nextChapterLink);
    }, 1000 * 3);
  },
  /**
   * 新增或更新章节阅读记录
   */
  onAddReadingRecord: function () {
    let that = this
    let _bookInfo = that.data.bookInfo
    let params = {
      openid: that.data.openid,
      rule: that.data.rule,
      author: that.data.prePageParams.author,
      bookClassify: that.data.prePageParams.bookClassify,
      coverImage: that.data.prePageParams.coverImage,
      //bookIntro: that.data.prePageParams.intro,
      bookName: _bookInfo.bookName,
      bookLink: _bookInfo.bookLink,
      chapterName: _bookInfo.chapterName,
      chapterLink: _bookInfo.chapterLink,
      numberOfWords: _bookInfo.number_Of_Words,
      readSeconds: 0
    }
    wx.request({
      url: remoteApiUrl.bookReadRecord.createOrUpdate,
      data: params,
      method: 'post',
      success(res) {
        console.info('新增书本阅读记录', res.data)
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          that.setData({
            bookReadRecordId: data.id
          })
        }
      }
    })
  },
  /**
   * 上一章
   */
  bindPrevTap(e) {
    let that = this
    let prevChapterLink = e.currentTarget.dataset.link;
    if (!prevChapterLink || prevChapterLink == this.data.bookInfo.chapterLink) {
      wx.showToast({
        title: '前面没有啦~',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 30000
    })
    this.GetBookContent(prevChapterLink);
  },
  /**
   * 下一章
   */
  bindNextTap(e) {
    let that = this
    let nextChapterLink = e.currentTarget.dataset.link;
    if (!nextChapterLink || nextChapterLink == that.data.bookInfo.chapterLink) {
      wx.showToast({
        title: '后面没有啦~',
        icon: 'none',
        duration: 2000
      })
      return
    }
    //清除定时器（自动加载下一章）
    clearTimeout(that.timerByLoadNextChapter)
    if (that.data.bookInfoByNext) {
      that.showBookContent(that.data.bookInfoByNext)
    } else {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 30000
      })
      that.GetBookContent(nextChapterLink)
    }
  },
  /**
   * 目录
   */
  bindChapterTap(e) {
    let that = this
    wx.redirectTo({
      url: `../intro/intro?rule=${that.data.rule}&bookLink=${that.data.bookInfo.bookLink}&author=${that.data.prePageParams.author}&bookClassify=${that.data.prePageParams.bookClassify}&coverImage=${that.data.prePageParams.coverImage}`
    })
  },
  /**
   * 翻页
   */
  bindScrollTap: function (e) {
    //console.info('bindScrollTap', e);
    let that = this
    let clientY = e.touches[0].clientY;
    if (clientY < this.data.windowHeight / 3) {
      //上
      this.setData({
        scrollTop: this.data.scrollTopByScrolling - this.data.windowHeight,
      })
    } else if (clientY > this.data.windowHeight / 3 && clientY < this.data.windowHeight / 3 * 2) {
      //中
      this.setData({
        showSetting: !this.data.showSetting
      })
    } else {
      //下
      this.setData({
        scrollTop: this.data.scrollTopByScrolling + this.data.windowHeight
      })
    }
  },
  /**
   * scroll滚动时触发
   */
  scrollHandler: function (e) {
    //console.info('scroll滚动时触发', e)
    this.setData({
      //lastScrollTime: new Date(),
      //scrollTop: e.detail.scrollTop
      scrollTopByScrolling: e.detail.scrollTop
    })
  },
  /**
   * 打开字体&背景设置
   */
  onshowFontSetting: function () {
    this.setData({
      showModal: true,
      showSetting: false
    })
  },

  //////////////////////////////////// 偏好设置 start ////////////////////////////////////
  /**
   * 日夜模式切换
   */
  switchDayNightChange: function (e) {
    const val = e.detail.value ? 'nighttime' : 'daytime'
    if (val == 'daytime') {
      this.setData({
        'personSetting.backgroundColor': '#fff',
        'personSetting.fontColor': '#000',
        'personSetting.dayOrNight': val
      })
    } else {
      this.setData({
        'personSetting.backgroundColor': '#000',
        'personSetting.fontColor': '#fff',
        'personSetting.dayOrNight': val
      })
    }
    this.onChangeNavigationBar()
  },
  /**
   * 屏幕常亮
   */
  switchKeepScreenOnChange: function (e) {
    const val = e.detail.value
    this.setData({
      'personSetting.keepScreenOn': val
    })
    wx.setKeepScreenOn({
      keepScreenOn: val
    })
  },
  /**
   * 字体大小
   */
  sliderFontSizechange: function (e) {
    const val = e.detail.value
    this.setData({
      'personSetting.fontSize': val
    })
  },
  sliderFontSizechanging: function (e) {
    const val = e.detail.value
    this.setData({
      'personSetting.fontSize': val
    })
  },
  /**
   * 背景色
   */
  onbackgroundChange: function (e) {
    const val = e.currentTarget.dataset.color
    this.setData({
      'personSetting.backgroundColor': val
    })
    this.onChangeNavigationBar()
  },
  /**
   * 字体色
   */
  onFontColorChange: function (e) {
    const val = e.currentTarget.dataset.color
    this.setData({
      'personSetting.fontColor': val
    })
  },
  /**
   * 字体
   */
  onFontFamilyChange: function (e) {
    const val = e.currentTarget.dataset.fontfamily
    console.info('字体 -> val', val)
    this.setData({
      'personSetting.fontFamily': val
    })
  },
  /**
   * 动态设置导航栏样式
   */
  onChangeNavigationBar: function () {
    const bgColor = this.data.personSetting.backgroundColor
    const isBlack = (bgColor == '#000') ? false : true
    wx.setNavigationBarColor({
      frontColor: isBlack ? '#000000' : '#ffffff', //微信仅支持 #ffffff 和 #000000
      backgroundColor: bgColor
    })
  },
  /**
   * 初始化偏好设置
   */
  onInitSetting: function () {
    let that = this
    try {
      //let res = {}
      that.initPersonSetting()
      return new Promise(function (resolve, reject) {
        let r = wx.getStorageSync(storageKeys.userpreference)
        if (r) {
          //console.info('缓存中取偏好设置', r)
          resolve(r)
        } else {
          wx.request({
            url: remoteApiUrl.bookUserPreference.getByOpenid,
            data: {
              openid: that.data.openid
            },
            success(res) {
              console.info('获取用户偏好设置', res.data)
              const {
                code,
                data,
                msg
              } = res.data
              if (code == 0) {
                //本地存储
                wx.setStorage({
                  key: storageKeys.userpreference,
                  data: data
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
        }
      }).then(res => {
        if (res) {
          const {
            fontSize,
            fontColor,
            fontFamily,
            backgroundColor,
            keepScreenOn
          } = res
          that.setData({
            'personSetting.fontSize': fontSize,
            'personSetting.fontColor': fontColor,
            'personSetting.fontFamily': fontFamily,
            'personSetting.backgroundColor': backgroundColor
          })
          that.onInitSetting2(keepScreenOn)
        } else {
          that.onInitSetting2(false)
        }
        that.onChangeNavigationBar()
      })
    } catch (e) {
      wx.showToast({
        title: '初始化偏好设置失败',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //初始化屏幕常亮
  onInitSetting2: function (keepScreenOn) {
    let that = this
    //设置屏幕常亮
    let isKeep = keepScreenOn == true
    //if (keepScreenOn != null) {
    wx.setKeepScreenOn({
      keepScreenOn: isKeep,
      success: function () {
        that.setData({
          'personSetting.keepScreenOn': isKeep
        })
      }
    })
    //}
  },
  /**
   * 取消偏好设置
   */
  onCancelSetting: function () {
    let that = this
    that.setData({
      showModal: false
    })
    that.onInitSetting()
    //that.onInitSetting2(false)
  },
  /**
   * 确定保存设置
   */
  onSaveSetting: function () {
    let that = this
    wx.showToast({
      title: '正在保存...',
      icon: 'loading',
      duration: 30000
    })
    const params = that.data.personSetting
    params.openid = that.data.openid
    wx.request({
      url: remoteApiUrl.bookUserPreference.createOrUpdate,
      data: params,
      method: 'post',
      success(res) {
        console.info('设置用户偏好设置', res.data)
        const {
          code,
          data,
          msg
        } = res.data
        if (code == 0) {
          //本地存储
          wx.setStorage({
            key: storageKeys.userpreference,
            data: params
          })
          that.setData({
            showModal: false
          })
          wx.showToast({
            title: '设置成功',
            icon: 'none',
            duration: 2000
          })
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
  //////////////////////////////////// 偏好设置 end ////////////////////////////////////

  //////////////////////////////////// 上传阅读时长 start ////////////////////////////////////
  //相关业务：用户每隔一段时间将上传阅读时长
  uploadTimeInterval: 20, //上传阅读时长的时间间隔
  //新建一个计时器
  createTaskByReadDuration: function () {
    let that = this
    setInterval(function () {
      if (that.data.isPageOnShow) {
        that.uploadReadTimes()
      }
    }, 1000 * that.uploadTimeInterval)
  },
  //上传阅读时长
  uploadReadTimes: function () {
    console.info('上传阅读时长', this.data.bookReadRecordId, this.uploadTimeInterval)
    if (this.data.bookReadRecordId)
      wx.request({
        url: remoteApiUrl.bookReadRecord.updateDuration,
        data: {
          id: this.data.bookReadRecordId,
          seconds: this.uploadTimeInterval
        },
        success(res) {}
      })
  },
  //////////////////////////////////// 上传阅读时长 end ////////////////////////////////////



})