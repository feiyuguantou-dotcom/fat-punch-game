// cloudfunctions/analytics/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, ...params } = event;
  const wxContext = cloud.getWXContext();

  console.log('Analytics action:', action);
  console.log('Analytics params:', params);

  try {
    switch (action) {
      case 'reportEvent':
        return await reportEvent(params, wxContext);
      case 'getUserCount':
        return await getUserCount(params, wxContext);
      case 'getStatistics':
        return await getStatistics(params, wxContext);
      default:
        return {
          success: false,
          message: '未知操作'
        };
    }
  } catch (error) {
    console.error('Analytics error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// 上报事件
async function reportEvent(params, wxContext) {
  const { eventName, eventData } = params;

  const logData = {
    eventName: eventName,
    eventData: eventData,
    userId: wxContext.OPENID,
    timestamp: new Date(),
    createTime: new Date()
  };

  await db.collection('analytics').add({
    data: logData
  });

  return {
    success: true,
    data: {
      message: '事件上报成功'
    }
  };
}

// 获取用户数
async function getUserCount(params, wxContext) {
  const res = await db.collection('users').count();

  return {
    success: true,
    data: {
      count: res.total || 0
    }
  };
}

// 获取统计数据
async function getStatistics(params, wxContext) {
  // 获取今日活跃用户数
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDAURes = await db.collection('analytics')
    .where({
      timestamp: _.gte(today)
    })
    .count();

  // 获取总游戏次数
  const totalGamesRes = await db.collection('game_sessions')
    .where({
      gameStatus: 'ended'
    })
    .count();

  return {
    success: true,
    data: {
      todayDAU: todayDAURes.total || 0,
      totalGames: totalGamesRes.total || 0
    }
  };
}
