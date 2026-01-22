// cloudfunctions/user/index.js
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

  console.log('User action:', action);
  console.log('User params:', params);

  try {
    switch (action) {
      case 'login':
        return await login(params, wxContext);
      case 'getStatistics':
        return await getStatistics(params, wxContext);
      case 'updateProfile':
        return await updateProfile(params, wxContext);
      default:
        return {
          success: false,
          message: '未知操作'
        };
    }
  } catch (error) {
    console.error('User error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// 用户登录
async function login(params, wxContext) {
  const openId = wxContext.OPENID;

  // 查找用户
  const userRes = await db.collection('users').where({
    openId: openId
  }).get();

  let isNewUser = userRes.data.length === 0;

  if (isNewUser) {
    // 创建新用户
    const userData = {
      openId: openId,
      nickName: '用户' + openId.substring(0, 8),
      avatar: '👩',
      gameCount: 0,
      attackCount: 0,
      shareCount: 0,
      coin: 10, // 新用户赠送10个复仇币
      createTime: new Date(),
      lastLoginTime: new Date()
    };

    const result = await db.collection('users').add({
      data: userData
    });

    return {
      success: true,
      data: {
        userId: result._id,
        openId: openId,
        isNewUser: true,
        userInfo: userData
      }
    };
  } else {
    // 更新最后登录时间
    const user = userRes.data[0];
    await db.collection('users').doc(user._id).update({
      data: {
        lastLoginTime: new Date()
      }
    });

    return {
      success: true,
      data: {
        userId: user._id,
        openId: openId,
        isNewUser: false,
        userInfo: user
      }
    };
  }
}

// 获取用户统计
async function getStatistics(params, wxContext) {
  const openId = wxContext.OPENID;

  const userRes = await db.collection('users').where({
    openId: openId
  }).get();

  if (userRes.data.length === 0) {
    return {
      success: false,
      message: '用户不存在'
    };
  }

  const user = userRes.data[0];

  return {
    success: true,
    data: {
      totalGames: user.gameCount || 0,
      totalAttacks: user.attackCount || 0,
      totalShares: user.shareCount || 0,
      coin: user.coin || 0
    }
  };
}

// 更新用户资料
async function updateProfile(params, wxContext) {
  const openId = wxContext.OPENID;
  const { nickName, avatar } = params;

  const userRes = await db.collection('users').where({
    openId: openId
  }).get();

  if (userRes.data.length === 0) {
    return {
      success: false,
      message: '用户不存在'
    };
  }

  const user = userRes.data[0];
  const updateData = {};
  if (nickName) updateData.nickName = nickName;
  if (avatar) updateData.avatar = avatar;

  await db.collection('users').doc(user._id).update({
    data: updateData
  });

  return {
    success: true,
    data: {
      message: '更新成功'
    }
  };
}
