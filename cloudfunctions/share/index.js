// cloudfunctions/share/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, ...params } = event;
  const wxContext = cloud.getWXContext();

  console.log('Share action:', action);
  console.log('Share params:', params);

  try {
    switch (action) {
      case 'recordShare':
        return await recordShare(params, wxContext);
      case 'recordInvitation':
        return await recordInvitation(params, wxContext);
      case 'getPosts':
        return await getPosts(params, wxContext);
      case 'likePost':
        return await likePost(params, wxContext);
      case 'sendHug':
        return await sendHug(params, wxContext);
      default:
        return {
          success: false,
          message: '未知操作'
        };
    }
  } catch (error) {
    console.error('Share error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// 记录分享
async function recordShare(params, wxContext) {
  const { shareType, shareContent } = params;
  const openId = wxContext.OPENID;

  // 创建分享记录
  const shareData = {
    userId: openId,
    shareType: shareType,
    shareContent: shareContent,
    clickCount: 0,
    registerCount: 0,
    createTime: new Date()
  };

  await db.collection('share_records').add({
    data: shareData
  });

  // 更新用户分享次数
  const userRes = await db.collection('users').where({
    openId: openId
  }).get();

  if (userRes.data.length > 0) {
    await db.collection('users').doc(userRes.data[0]._id).update({
      data: {
        shareCount: _.inc(1),
        coin: _.inc(1) // 分享获得1个复仇币
      }
    });
  }

  return {
    success: true,
    data: {
      shareId: shareData._id,
      message: '分享记录成功'
    }
  };
}

// 记录邀请
async function recordInvitation(params, wxContext) {
  const { inviterId } = params;
  const inviteeId = wxContext.OPENID;

  // 创建邀请记录
  const invitationData = {
    inviterId: inviterId,
    inviteeId: inviteeId,
    status: 'completed',
    createTime: new Date()
  };

  await db.collection('invitations').add({
    data: invitationData
  });

  // 给邀请者奖励
  const inviterRes = await db.collection('users').where({
    openId: inviterId
  }).get();

  if (inviterRes.data.length > 0) {
    await db.collection('users').doc(inviterRes.data[0]._id).update({
      data: {
        coin: _.inc(5) // 邀请获得5个复仇币
      }
    });
  }

  // 给被邀请者奖励
  const inviteeRes = await db.collection('users').where({
    openId: inviteeId
  }).get();

  if (inviteeRes.data.length > 0) {
    await db.collection('users').doc(inviteeRes.data[0]._id).update({
      data: {
        coin: _.inc(5)
      }
    });
  }

  return {
    success: true,
    data: {
      message: '邀请记录成功'
    }
  };
}

// 获取帖子列表
async function getPosts(params, wxContext) {
  const { limit = 20 } = params;

  const res = await db.collection('posts')
    .orderBy('createTime', 'desc')
    .limit(limit)
    .get();

  return {
    success: true,
    data: {
      posts: res.data
    }
  };
}

// 点赞帖子
async function likePost(params, wxContext) {
  const { postId } = params;
  const openId = wxContext.OPENID;

  // 检查是否已点赞
  const likeRes = await db.collection('post_likes')
    .where({
      postId: postId,
      userId: openId
    })
    .get();

  if (likeRes.data.length > 0) {
    // 取消点赞
    await db.collection('post_likes')
      .where({
        postId: postId,
        userId: openId
      })
      .remove();

    await db.collection('posts').doc(postId).update({
      data: {
        likeCount: _.inc(-1)
      }
    });

    return {
      success: true,
      data: {
        liked: false
      }
    };
  } else {
    // 添加点赞
    await db.collection('post_likes').add({
      data: {
        postId: postId,
        userId: openId,
        createTime: new Date()
      }
    });

    await db.collection('posts').doc(postId).update({
      data: {
        likeCount: _.inc(1)
      }
    });

    return {
      success: true,
      data: {
        liked: true
      }
    };
  }
}

// 发送拥抱
async function sendHug(params, wxContext) {
  const { postId } = params;
  const openId = wxContext.OPENID;

  // 创建拥抱记录
  await db.collection('post_hugs').add({
    data: {
      postId: postId,
      userId: openId,
      createTime: new Date()
    }
  });

  await db.collection('posts').doc(postId).update({
    data: {
      hugCount: _.inc(1)
    }
  });

  return {
    success: true,
    data: {
      message: '拥抱已发送'
    }
  };
}
