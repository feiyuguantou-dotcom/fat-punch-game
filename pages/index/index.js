// pages/index/index.js
const app = getApp();

Page({
  data: {
    showGuide: false,
    guideStep: 0,
    userCount: 12856 // 模拟用户数
  },

  onLoad(options) {
    console.log('Index onLoad:', options);

    // 处理分享进入的情况
    if (options.from === 'share' && options.inviterId) {
      this.handleInvitation(options.inviterId);
    }

    // 检查是否首次进入
    const hasSeenGuide = wx.getStorageSync('hasSeenGuide');
    if (!hasSeenGuide) {
      this.setData({ showGuide: true });
    }

    // 埋点:页面浏览
    app.trackEvent('page_view', {
      page: 'index',
      from: options.from || 'direct'
    });

    // 获取真实用户数
    this.getUserCount();
  },

  onReady() {
    console.log('Index onReady');
  },

  onShow() {
    console.log('Index onShow');
  },

  onHide() {
    console.log('Index onHide');
  },

  onUnload() {
    console.log('Index onUnload');
  },

  onShareAppMessage() {
    return {
      title: '失恋了?来揍前任吧!',
      path: '/pages/index/index?from=share&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-default.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '失恋反击战 - 打完就释怀,笑着向前看',
      query: 'from=timeline&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-timeline.jpg'
    };
  },

  // 获取用户数
  async getUserCount() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'analytics',
        data: {
          action: 'getUserCount'
        }
      });

      if (res.result.success) {
        this.setData({
          userCount: res.result.data.count || this.data.userCount
        });
      }
    } catch (error) {
      console.error('Get user count failed:', error);
    }
  },

  // 处理邀请关系
  async handleInvitation(inviterId) {
    try {
      await wx.cloud.callFunction({
        name: 'share',
        data: {
          action: 'recordInvitation',
          inviterId: inviterId
        }
      });

      console.log('Invitation recorded:', inviterId);

      // 埋点:邀请进入
      app.trackEvent('enter_from_invitation', {
        inviterId: inviterId
      });
    } catch (error) {
      console.error('Record invitation failed:', error);
    }
  },

  // 开始游戏
  startGame() {
    console.log('Start game');

    // 检查登录
    if (!app.globalData.userId) {
      this.doLogin().then(() => {
        this.navigateToGame();
      });
    } else {
      this.navigateToGame();
    }

    // 埋点:开始游戏点击
    app.trackEvent('click_start_game', {
      from: 'index'
    });

    // 关闭引导
    if (this.data.showGuide) {
      this.closeGuide();
    }
  },

  // 从引导开始游戏
  startGameFromGuide() {
    wx.setStorageSync('hasSeenGuide', true);
    this.closeGuide();
    this.startGame();
  },

  // 跳转到游戏页面
  navigateToGame() {
    wx.navigateTo({
      url: '/pages/game/game'
    });
  },

  // 开始测试
  startTest() {
    console.log('Start test');

    // 埋点:测试点击
    app.trackEvent('click_start_test', {
      from: 'index'
    });

    wx.navigateTo({
      url: '/pages/test/test'
    });
  },

  // 去社区
  goCommunity() {
    console.log('Go to community');

    // 埋点:社区点击
    app.trackEvent('click_community', {
      from: 'index'
    });

    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  // 登录
  async doLogin() {
    try {
      const res = await app.login();
      if (!res.success) {
        wx.showToast({
          title: '登录失败,请重试',
          icon: 'none'
        });
      }
      return res;
    } catch (error) {
      console.error('Login failed:', error);
      wx.showToast({
        title: '登录异常',
        icon: 'none'
      });
      return { success: false };
    }
  },

  // 引导相关
  nextGuide() {
    const nextStep = this.data.guideStep + 1;
    this.setData({
      guideStep: nextStep
    });
  },

  onGuideChange(e) {
    this.setData({
      guideStep: e.detail.current
    });
  },

  closeGuide() {
    wx.setStorageSync('hasSeenGuide', true);
    this.setData({
      showGuide: false,
      guideStep: 0
    });
  }
});
