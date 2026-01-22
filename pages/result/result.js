// pages/result/result.js
const app = getApp();

Page({
  data: {
    gameResult: null,
    reliefMessage: '',
    gameDurationText: '',
    currentDate: '',
    showPosterModal: false,
    posterUrl: ''
  },

  onLoad(options) {
    console.log('Result onLoad:', options);

    // 获取游戏结果
    if (options.result) {
      try {
        const result = JSON.parse(decodeURIComponent(options.result));
        this.setData({
          gameResult: result
        });

        // 生成释怀文案
        this.setData({
          reliefMessage: this.getReliefMessage()
        });

        // 格式化游戏时长
        this.setData({
          gameDurationText: this.formatDuration(result.gameDuration)
        });

        // 获取当前日期
        this.setData({
          currentDate: this.getCurrentDate()
        });

        // 埋点
        app.trackEvent('result_page_view', {
          attackCount: result.attackCount,
          maxCombo: result.maxCombo
        });

        // 同步游戏结果到服务器
        this.syncGameResult(result);
      } catch (error) {
        console.error('Parse result failed:', error);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        title: '游戏数据异常',
        icon: 'none'
      });
    }
  },

  onReady() {
    console.log('Result onReady');
  },

  onShow() {
    console.log('Result onShow');
  },

  onHide() {
    console.log('Result onHide');
  },

  onUnload() {
    console.log('Result onUnload');
  },

  onShareAppMessage() {
    return {
      title: `我暴揍了${this.data.gameResult.attackCount}次渣男,超解压!`,
      path: '/pages/index/index?from=share&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-result.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '分手第X天,我终于释怀啦❤️',
      query: 'from=timeline&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-timeline.jpg'
    };
  },

  // 获取释怀文案
  getReliefMessage() {
    const messages = app.globalData.reliefMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  },

  // 格式化时长
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}秒`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainSeconds = seconds % 60;
      return `${minutes}分${remainSeconds}秒`;
    }
  },

  // 获取当前日期
  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  },

  // 同步游戏结果
  async syncGameResult(result) {
    try {
      await wx.cloud.callFunction({
        name: 'gameLogic',
        data: {
          action: 'endGame',
          gameResult: result
        }
      });
    } catch (error) {
      console.error('Sync game result failed:', error);
    }
  },

  // 再玩一次
  playAgain() {
    console.log('Play again');

    // 埋点
    app.trackEvent('click_play_again', {
      attackCount: this.data.gameResult.attackCount
    });

    wx.redirectTo({
      url: '/pages/game/game'
    });
  },

  // 分享战绩
  shareResult() {
    console.log('Share result');

    // 显示分享选项
    wx.showActionSheet({
      itemList: ['分享给微信好友', '生成朋友圈海报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.shareToChat();
        } else if (res.tapIndex === 1) {
          this.generatePoster();
        }
      }
    });

    // 埋点
    app.trackEvent('click_share_result', {
      attackCount: this.data.gameResult.attackCount
    });
  },

  // 分享给好友
  shareToChat() {
    // 触发微信分享
    // 实际分享在 onShareAppMessage 中处理
  },

  // 生成海报
  generatePoster() {
    console.log('Generate poster');

    this.setData({
      showPosterModal: true
    });

    // 绘制海报
    setTimeout(() => {
      this.drawPoster();
    }, 100);

    // 埋点
    app.trackEvent('generate_poster', {
      attackCount: this.data.gameResult.attackCount
    });
  },

  // 绘制海报
  async drawPoster() {
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res[0]) {
          console.error('Canvas node not found');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        // 设置canvas尺寸
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = 500 * dpr;
        canvas.height = 888 * dpr;
        ctx.scale(dpr, dpr);

        // 绘制背景
        const gradient = ctx.createLinearGradient(0, 0, 0, 888);
        gradient.addColorStop(0, '#FFE5EC');
        gradient.addColorStop(1, '#FFF5F7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 500, 888);

        // 绘制标题
        ctx.fillStyle = '#FF6B9D';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('失恋反击战 - 我释怀啦!', 250, 80);

        // 绘制数据
        ctx.fillStyle = '#333';
        ctx.font = '28px sans-serif';
        ctx.fillText(`暴揍次数: ${this.data.gameResult.attackCount}`, 250, 200);

        // 绘制释怀文案
        ctx.fillStyle = '#666';
        ctx.font = '24px sans-serif';
        ctx.fillText(this.data.reliefMessage, 250, 300);

        // 绘制日期
        ctx.fillStyle = '#999';
        ctx.font = '20px sans-serif';
        ctx.fillText(this.data.currentDate, 250, 400);

        // 绘制底部提示
        ctx.fillStyle = '#FF6B9D';
        ctx.font = '22px sans-serif';
        ctx.fillText('扫码揍前任', 250, 800);

        // 生成临时图片
        wx.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => {
            this.setData({
              posterUrl: res.tempFilePath
            });
            console.log('Poster generated:', res.tempFilePath);
          },
          fail: (err) => {
            console.error('Generate poster failed:', err);
          }
        });
      });
  },

  // 保存海报
  savePoster() {
    if (!this.data.posterUrl) {
      wx.showToast({
        title: '海报生成中...',
        icon: 'none'
      });
      return;
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterUrl,
      success: () => {
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        });

        this.closePosterModal();

        // 埋点
        app.trackEvent('save_poster', {
          success: true
        });
      },
      fail: (err) => {
        console.error('Save poster failed:', err);

        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要您授权保存相册',
            showCancel: false,
            success: (res) => {
              wx.openSetting();
            }
          });
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }

        // 埋点
        app.trackEvent('save_poster', {
          success: false,
          error: err.errMsg
        });
      }
    });
  },

  // 关闭海报弹窗
  closePosterModal() {
    this.setData({
      showPosterModal: false
    });
  },

  // 解锁高级功能
  unlockFeature(e) {
    const feature = e.currentTarget.dataset.feature;

    // 埋点
    app.trackEvent('click_unlock_feature', {
      feature: feature
    });

    wx.showModal({
      title: '解锁高级内容',
      content: '此功能需要付费解锁,是否继续?',
      confirmText: '去解锁',
      success: (res) => {
        if (res.confirm) {
          // 跳转到支付页面
          this.navigateToPayment(feature);
        }
      }
    });
  },

  // 跳转到支付页面
  navigateToPayment(feature) {
    const prices = {
      love: 3,
      karma: 3,
      fortune: 6
    };

    // 这里应该调用微信支付
    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
    });

    // TODO: 实际支付流程
    // wx.requestPayment({
    //   ...支付参数
    // })
  }
});
