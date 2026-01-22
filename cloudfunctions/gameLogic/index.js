// cloudfunctions/gameLogic/index.js
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

  console.log('GameLogic action:', action);
  console.log('GameLogic params:', params);

  try {
    switch (action) {
      case 'startGame':
        return await startGame(params, wxContext);
      case 'attack':
        return await attack(params, wxContext);
      case 'endGame':
        return await endGame(params, wxContext);
      default:
        return {
          success: false,
          message: '未知操作'
        };
    }
  } catch (error) {
    console.error('GameLogic error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// 开始游戏
async function startGame(params, wxContext) {
  const { characterType } = params;
  const openId = wxContext.OPENID;

  // 创建游戏会话
  const sessionData = {
    userId: openId,
    openId: openId,
    characterType: characterType,
    blood: 100,
    maxBlood: 100,
    attackCount: 0,
    comboCount: 0,
    gameStatus: 'playing',
    startTime: new Date(),
    createTime: new Date()
  };

  const result = await db.collection('game_sessions').add({
    data: sessionData
  });

  console.log('Game session created:', result._id);

  return {
    success: true,
    data: {
      sessionId: result._id,
      maxBlood: 100
    }
  };
}

// 处理攻击
async function attack(params, wxContext) {
  const { sessionId, damage, combo } = params;

  // 获取游戏会话
  const sessionRes = await db.collection('game_sessions').doc(sessionId).get();
  const session = sessionRes.data;

  if (!session) {
    return {
      success: false,
      message: '游戏会话不存在'
    };
  }

  // 更新血量和攻击数据
  const newBlood = Math.max(0, session.blood - damage);
  const updateData = {
    blood: newBlood,
    attackCount: session.attackCount + 1,
    comboCount: Math.max(session.comboCount, combo)
  };

  await db.collection('game_sessions').doc(sessionId).update({
    data: updateData
  });

  return {
    success: true,
    data: {
      damage: damage,
      blood: newBlood,
      combo: combo,
      gameStatus: newBlood <= 0 ? 'ended' : 'playing'
    }
  };
}

// 结束游戏
async function endGame(params, wxContext) {
  const { gameResult } = params;
  const { characterType, attackCount, maxCombo, gameDuration } = gameResult;
  const openId = wxContext.OPENID;

  // 更新游戏会话
  const sessionData = {
    gameStatus: 'ended',
    endTime: new Date(),
    finalAttackCount: attackCount,
    finalCombo: maxCombo,
    gameDuration: gameDuration
  };

  // 如果有sessionId,更新会话
  if (params.sessionId) {
    await db.collection('game_sessions').doc(params.sessionId).update({
      data: sessionData
    });
  }

  // 更新用户统计数据
  const userRes = await db.collection('users').where({
    openId: openId
  }).get();

  if (userRes.data.length > 0) {
    const user = userRes.data[0];
    await db.collection('users').doc(user._id).update({
      data: {
        gameCount: _.inc(1),
        attackCount: _.inc(attackCount)
      }
    });
  } else {
    // 创建用户记录
    await db.collection('users').add({
      data: {
        openId: openId,
        gameCount: 1,
        attackCount: attackCount,
        createTime: new Date()
      }
    });
  }

  return {
    success: true,
    data: {
      message: '游戏结束,数据已保存'
    }
  };
}
