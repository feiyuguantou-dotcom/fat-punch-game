// pages/user/user.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    userId: '',
    userStats: {
      totalGames: 0,
      totalAttacks: 0,
      totalShares: 0
    }
  },

  onLoad(options) {
    console.log('User onLoad:', options);
  },

  onShow() {
    // 加载用户信息
    this.loadUserInfo();
    this.loadUserStats();
  },

  onShareAppMessage() {
    return {
      title: '失恋反击战 - 超解压的小游戏',
      path: '/pages/index/index?from=share&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-default.jpg'
    };
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {};
    const userId = app.globalData.userId || '';

    this.setData({
      userInfo: userInfo,
      userId: userId
    });

    if (!userId) {
      // 未登录,尝试登录
      app.login();
    }
  },

  // 加载用户统计
  async loadUserStats() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getStatistics'
        }
      });

      if (res.result.success) {
        this.setData({
          userStats: res.result.data
        });
      }
    } catch (error) {
      console.error('Load user stats failed:', error);
    }
  },

  // 充值
  recharge() {
    wx.showToast({
      title: '充值功能开发中',
      icon: 'none'
    });

    // 埋点
    app.trackEvent('click_recharge', {});

    // TODO: 实现充值功能
  },

  // 查看成就
  viewAchievements() {
    wx.showToast({
      title: '成就功能开发中',
      icon: 'none'
    });

    app.trackEvent('click_view_achievements', {});
  },

  // 查看历史
  viewHistory() {
    wx.showToast({
      title: '历史记录功能开发中',
      icon: 'none'
    });

    app.trackEvent('click_view_history', {});
  },

  // 邀请好友
  shareInvite() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    wx.showToast({
      title: '点击右上角分享给好友',
      icon: 'none'
    });

    app.trackEvent('click_share_invite', {});
  },

  // 设置
  viewSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });

    app.trackEvent('click_view_settings', {});
  },

  // 联系客服
  contactUs() {
    wx.showModal({
      title: '联系客服',
      content: '如有问题,请添加客服微信:xxxxxx',
      showCancel: false
    });

    app.trackEvent('click_contact_us', {});
  },

  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '失恋反击战 v1.0\n一个可以安全地"揍前任"的微信小程序小游戏\n\n打完就释怀,笑着向前看',
      showCancel: false
    });

    app.trackEvent('click_about_us', {});
  }
});
