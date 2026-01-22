// app.js
App({
  globalData: {
    userInfo: null,
    userId: null,
    openId: null,
    systemInfo: null,
    // 游戏配置
    gameConfig: {
      maxBlood: 100,
      baseDamage: 1,
      comboThreshold: 500, // 连击判定时间(ms)
      longPressTime: 500, // 长按蓄力时间(ms)
      specialDamage: 10 // 蓄力大招伤害
    },
    // 渣男类型数据
    characterTypes: [
      {
        id: 'cold_violence',
        name: '冷暴力渣男',
        emoji: '💀',
        tagline: '我忙',
        description: '不回消息、忽冷忽热，让你在等待中耗尽热情'
      },
      {
        id: 'cheating',
        name: '出轨渣男',
        emoji: '🔥',
        tagline: '劈腿',
        description: '精神或肉体出轨，背叛你的信任'
      },
      {
        id: 'stingy',
        name: '抠门渣男',
        emoji: '💰',
        tagline: '太贵了',
        description: '一毛不拔、精打细算，连杯奶茶都舍不得'
      },
      {
        id: 'liar',
        name: '撒谎渣男',
        emoji: '🎭',
        tagline: '相信我',
        description: '满嘴跑火车，谎言张口就来'
      },
      {
        id: 'mama_boy',
        name: '妈宝渣男',
        emoji: '👻',
        tagline: '我妈说',
        description: '什么都听妈妈的，没有自己的主见'
      },
      {
        id: 'rebound',
        name: '无缝衔接渣男',
        emoji: '💔',
        tagline: '还是朋友',
        description: '分手立刻有新欢，早已准备退路'
      }
    ],
    // 释怀文案库
    reliefMessages: [
      '你已经放下啦,前方有更好的人等你❤️',
      '错的不是你,是他不懂得珍惜',
      '所有的不好都会过去,你值得最好的',
      '感谢他的不娶之恩,你值得更好的',
      '放下过去,拥抱未来,你是最棒的',
      '时间会治愈一切,你要相信爱情',
      '他的离开,是上天在给你安排更好的人',
      '你值得被温柔对待,不要为不值得的人难过',
      '今天开始,做回自己,活出精彩',
      '放下包袱,轻装前行,幸福在前方等你'
    ],
    // 渣男道歉语录
    apologyMessages: [
      '对不起,是我不好了...',
      '是我错了,原谅我吧...',
      '我不该那样对你...',
      '都是我的错,对不起...',
      '我后悔了,可以重来吗...'
    ]
  },

  onLaunch() {
    console.log('App Launch');

    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 请替换为您的云开发环境ID
        traceUser: true,
      });
    }

    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res;
        console.log('System Info:', res);
      }
    });

    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    console.log('App Show');
  },

  onHide() {
    console.log('App Hide');
  },

  // 检查登录状态
  checkLoginStatus() {
    const userId = wx.getStorageSync('userId');
    const userInfo = wx.getStorageSync('userInfo');

    if (userId && userInfo) {
      this.globalData.userId = userId;
      this.globalData.userInfo = userInfo;
      console.log('User already logged in:', userId);
    } else {
      console.log('User not logged in');
    }
  },

  // 用户登录
  async login() {
    try {
      // 获取微信登录凭证
      const loginRes = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'login'
        }
      });

      if (loginRes.result.success) {
        const { userId, openId, isNewUser, userInfo } = loginRes.result.data;

        // 保存用户信息
        this.globalData.userId = userId;
        this.globalData.openId = openId;
        this.globalData.userInfo = userInfo;

        wx.setStorageSync('userId', userId);
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('openId', openId);

        console.log('Login success:', userId);
        return { success: true, userId, isNewUser };
      } else {
        console.error('Login failed:', loginRes.result);
        return { success: false, message: '登录失败' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: '登录异常' };
    }
  },

  // 数据埋点
  trackEvent(eventName, eventData = {}) {
    const data = {
      eventName,
      eventData: {
        ...eventData,
        userId: this.globalData.userId,
        openId: this.globalData.openId,
        timestamp: new Date().getTime(),
        systemInfo: this.globalData.systemInfo
      }
    };

    wx.cloud.callFunction({
      name: 'analytics',
      data: {
        action: 'reportEvent',
        ...data
      }
    }).catch(err => {
      console.error('Track event failed:', err);
    });
  }
});
