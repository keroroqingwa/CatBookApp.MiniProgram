/**
 * 配置文件
 */
const config = {
  // appid
  appid: 'wx091d1b55e2fcb4a6',
  // 请求后端的接口的域名（本地调试开发时请改为自己的后端api地址）
  //apiDomain: 'http://localhost:55633',
  apiDomain: 'https://v3.wechatApi.book.somethingwhat.com',
  // 自定义分享内容
  share: {
    title: '喵喵看书 - 来自一条书虫的分享',
    path: '/pages/index/index',
    imageUrl: 'https://book.somethingwhat.com/images/cat-avatar.png'
  },
  // 版本号，方便更新本地缓存
  version: '3.0.6' //版本号
}

export default config;