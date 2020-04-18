// pages/login/login.js
const app = getApp()
const remoteApiUrl = app.globalData.remoteApiUrl
const storageKeys = app.globalData.storageKeys

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!this.data.canIUse) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本不支持授权登录，请更新微信版本至最新后再试',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateBack()
          } else if (res.cancel) {
            console.log('用户点击取消')
            wx.navigateBack()
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // 微信授权登录
  auth: function (e) {
    let that = this
    let userInfo = e.detail.userInfo
    console.info('获取用户信息', e, userInfo)
    // 拒绝授权的情况
    if (!userInfo) {
      // 返回上一页面
      wx.navigateBack()
      return
    };
    // 同意授权
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    })
    wx.login({
      success(res) {
        console.info('请求后端接口：使用 code 换取 openid', res)
        if (res.code) {
          // 发起网络请求
          wx.request({
            url: remoteApiUrl.wechat.jscode2session,
            data: {
              code: res.code
            },
            success: res => {
              const {
                code,
                msg,
                data
              } = res.data
              if (code == 0) {
                // 获取用户详细信息并调用后端接口更新用户信息
                that.CreateOrUpdateUser(data.openid, function () {
                  // 设置缓存
                  wx.setStorageSync(storageKeys.openid, data.openid)
                  wx.showToast({
                    title: `登录成功`,
                  })
                  setTimeout(() => {
                    // 返回上一页面
                    wx.navigateBack()
                  }, 1000 * 1);
                })
              } else {
                wx.showToast({
                  title: `授权登录失败：${msg}，请稍后再试`,
                  icon: 'none',
                  duration: 5000
                })
              }
            },
            fail: res => {
              wx.showToast({
                title: `授权登录失败：${res.errMsg}，请稍后再试`,
                icon: 'none',
                duration: 5000
              })
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  // 获取用户详细信息并调用后端接口更新用户信息
  CreateOrUpdateUser: (openid, callback) => {
    wx.getUserInfo({
      success: res => {
        console.info('获取用户详细信息并调用后端接口更新用户信息', res)
        const {
          userInfo
        } = res
        userInfo.openid = openid
        wx.request({
          url: remoteApiUrl.bookUser.createOrUpdate,
          data: userInfo,
          method: 'post',
          success: res => {
            const {
              code,
              msg,
              data
            } = res.data
            if (code == 0) {
              if (callback) callback()
            } else {
              wx.showToast({
                title: `后端接口新增/更新用户信息时失败：${msg}，请稍后再试`,
                icon: 'none',
                duration: 5000
              })
            }
          }
        })
      }
    })
  }
})