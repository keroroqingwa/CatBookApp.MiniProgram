//app.js
import config from './constants/config.js';

App({
  globalData: {
    // 后端api地址
    remoteApiUrl: {
      // 微信相关后端接口
      wechat: {
        jscode2session: `${config.apiDomain}/api/Wechat/Jscode2session`
      },
      // book用户
      bookUser: {
        // 新增或更新
        createOrUpdate: `${config.apiDomain}/api/BookUser/CreateOrUpdate`,
        // 获取数据
        getByOpenid: `${config.apiDomain}/api/BookUser/GetByOpenid`
      },
      // 书本阅读记录
      bookReadRecord: {
        // 新增或更新书本阅读记录
        createOrUpdate: `${config.apiDomain}/api/BookReadRecord/CreateOrUpdate`,
        // 获取最近阅读记录
        getPagedByLastReading: `${config.apiDomain}/api/BookReadRecord/GetPagedByLastReading`,
        // 更新阅读时长
        updateDuration: `${config.apiDomain}/api/BookReadRecord/UpdateDuration`,
        // 获取数据
        get: `${config.apiDomain}/api/BookReadRecord/Get`,
        // 书本阅读记录汇总信息
        getBookReadRecordSummary: `${config.apiDomain}/api/BookReadRecord/GetBookReadRecordSummary`
      },
      // 书本搜索
      bookSearch: {
        // 获取所有搜索来源分类
        getBookCategoryList: `${config.apiDomain}/api/bookSearch/GetBookCategoryList`,
        // 搜索书本
        getBooks: `${config.apiDomain}/api/bookSearch/GetBooks`,
        // 获取小说章节目录信息
        getBookChapters: `${config.apiDomain}/api/bookSearch/GetBookChapters`,
        // 获取小说的内容
        getBookContent: `${config.apiDomain}/api/bookSearch/GetBookContent`,
      },
      // 用户偏好
      bookUserPreference: {
        // 新增或更新
        createOrUpdate: `${config.apiDomain}/api/BookUserPreference/createOrUpdate`,
        // 获取数据
        getByOpenid: `${config.apiDomain}/api/BookUserPreference/getByOpenid`
      }
    },
    // 缓存key
    storageKeys: {
      // openid
      openid: `mmbook_storage_user_openid_${config.version}`,
      // 用户偏好
      userpreference: `mmbook_storage_user_preference_${config.version}`
    }
  }
})