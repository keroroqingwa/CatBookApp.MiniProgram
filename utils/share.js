import config from '../constants/config.js';

/**
 * 微信分享
 */
const ShareHelper = {
  //返回默认设置
  DefaultSetting: (e) => {
    const { share } = config
    return {
      title: share.title,
      path: share.path,
      success: function (e) {
        console.info('转发成功', e)
      },
      fail: function (e) {
        console.info('转发失败', e)
      }
    }
  }
};

export default ShareHelper;