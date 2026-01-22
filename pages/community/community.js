// pages/community/community.js
const app = getApp();

Page({
  data: {
    posts: []
  },

  onLoad(options) {
    console.log('Community onLoad:', options);

    // 加载帖子
    this.loadPosts();

    // 埋点
    app.trackEvent('community_page_view', {});
  },

  onShow() {
    // 刷新帖子列表
    this.loadPosts();
  },

  onShareAppMessage() {
    return {
      title: '释怀树洞 - 分享你的故事',
      path: '/pages/index/index?from=share&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-community.jpg'
    };
  },

  // 加载帖子
  async loadPosts() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'share',
        data: {
          action: 'getPosts'
        }
      });

      if (res.result.success) {
        this.setData({
          posts: res.result.data.posts || []
        });
      }
    } catch (error) {
      console.error('Load posts failed:', error);

      // 使用模拟数据
      this.setData({
        posts: this.getMockPosts()
      });
    }
  },

  // 获取模拟数据
  getMockPosts() {
    return [
      {
        id: 1,
        avatar: '👩',
        author: '匿名用户',
        time: '2小时前',
        content: '今天玩了这个小游戏,暴揍了100次,感觉心情好多了!姐妹们也来试试吧~',
        tags: ['释怀', '推荐'],
        likeCount: 128,
        commentCount: 32,
        liked: false
      },
      {
        id: 2,
        avatar: '💔',
        author: '匿名用户',
        time: '5小时前',
        content: '分手第30天,终于可以笑着说出这一切了。感谢这个游戏,让我找到了宣泄的出口。',
        tags: ['分手', '疗愈'],
        likeCount: 256,
        commentCount: 58,
        liked: false
      },
      {
        id: 3,
        avatar: '🌸',
        author: '匿名用户',
        time: '1天前',
        content: '从一开始的愤怒,到现在的释怀,这个过程虽然痛苦,但值得。姐妹们,相信时间会治愈一切!',
        tags: ['成长', '释怀'],
        likeCount: 189,
        commentCount: 41,
        liked: false
      }
    ];
  },

  // 发布帖子
  publishPost() {
    wx.showToast({
      title: '发布功能开发中',
      icon: 'none'
    });

    // TODO: 实现发布功能
    // 埋点
    app.trackEvent('click_publish_post', {});
  },

  // 点赞
  async likePost(e) {
    const postId = e.currentTarget.dataset.id;

    // 埋点
    app.trackEvent('click_like_post', {
      postId: postId
    });

    try {
      await wx.cloud.callFunction({
        name: 'share',
        data: {
          action: 'likePost',
          postId: postId
        }
      });

      // 更新本地状态
      const posts = this.data.posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1
          };
        }
        return post;
      });

      this.setData({ posts });
    } catch (error) {
      console.error('Like post failed:', error);
    }
  },

  // 评论
  commentPost(e) {
    const postId = e.currentTarget.dataset.id;

    // 埋点
    app.trackEvent('click_comment_post', {
      postId: postId
    });

    wx.showToast({
      title: '评论功能开发中',
      icon: 'none'
    });

    // TODO: 实现评论功能
  },

  // 发送拥抱
  async sendHug(e) {
    const postId = e.currentTarget.dataset.id;

    // 埋点
    app.trackEvent('click_send_hug', {
      postId: postId
    });

    try {
      await wx.cloud.callFunction({
        name: 'share',
        data: {
          action: 'sendHug',
          postId: postId
        }
      });

      wx.showToast({
        title: '拥抱已发送~',
        icon: 'success'
      });
    } catch (error) {
      console.error('Send hug failed:', error);
    }
  }
});
