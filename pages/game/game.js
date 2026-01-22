// pages/game/game.js
const app = getApp();

Page({
  data: {
    // 游戏状态: select(选择), battle(战斗)
    gameState: 'select',

    // 角色选择相关
    characterTypes: [],
    selectedCharacter: '',
    selectedCharacterInfo: null,

    // 战斗相关
    currentCharacter: null,
    blood: 100,
    maxBlood: 100,
    bloodPercentage: 100,
    bloodColor: '#4CAF50',
    combo: 0,
    maxCombo: 0,
    attackCount: 0,
    characterScale: 1,
    characterShaking: false,
    characterTransforming: false,
    transformedType: false,
    transformedEmoji: '🐸',

    // 特效相关
    damageNumbers: [],
    particles: [],
    showComboHint: false,
    comboHintText: '',
    showDialog: false,
    dialogText: '',

    // 蓄力相关
    showChargeBar: false,
    chargeProgress: 0,
    chargeTimer: null,
    longPressTimer: null,

    // 技能相关
    skillCD: {
      combo: 0,
      truth: 0,
      transform: 0
    },
    skillUnlocked: {
      truth: false,
      transform: false
    },
    skillTimers: {},

    // 游戏控制
    isPaused: false,
    gameStartTime: null,
    lastAttackTime: 0,

    // 游戏结果
    gameResult: null
  },

  onLoad(options) {
    console.log('Game onLoad:', options);

    // 获取角色类型
    const characterTypes = app.globalData.characterTypes;
    this.setData({
      characterTypes: characterTypes
    });

    // 埋点
    app.trackEvent('game_page_view', {
      from: options.from || 'direct'
    });
  },

  onReady() {
    console.log('Game onReady');
  },

  onShow() {
    console.log('Game onShow');
  },

  onHide() {
    console.log('Game onHide');
    this.clearTimers();
  },

  onUnload() {
    console.log('Game onUnload');
    this.clearTimers();
  },

  // ==================== 角色选择相关 ====================

  // 选择角色
  selectCharacter(e) {
    const characterId = e.currentTarget.dataset.id;
    const characterInfo = this.data.characterTypes.find(c => c.id === characterId);

    this.setData({
      selectedCharacter: characterId,
      selectedCharacterInfo: characterInfo
    });

    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    });

    // 埋点
    app.trackEvent('select_character', {
      characterId: characterId
    });
  },

  // 跳过选择
  skipSelect() {
    const defaultCharacter = this.data.characterTypes[0];
    this.startBattle(defaultCharacter);
  },

  // 确认选择
  confirmSelect() {
    if (!this.data.selectedCharacterInfo) {
      wx.showToast({
        title: '请先选择一个渣男类型',
        icon: 'none'
      });
      return;
    }

    this.startBattle(this.data.selectedCharacterInfo);
  },

  // ==================== 游戏战斗相关 ====================

  // 开始战斗
  startBattle(character) {
    console.log('Start battle with:', character);

    this.setData({
      gameState: 'battle',
      currentCharacter: character,
      blood: this.data.maxBlood,
      bloodPercentage: 100,
      bloodColor: '#4CAF50',
      combo: 0,
      attackCount: 0,
      gameStartTime: new Date()
    });

    // 埋点
    app.trackEvent('game_start', {
      characterType: character.id
    });

    // 创建游戏会话
    this.createGameSession();
  },

  // 创建游戏会话
  async createGameSession() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'gameLogic',
        data: {
          action: 'startGame',
          characterType: this.data.currentCharacter.id
        }
      });

      if (res.result.success) {
        this.gameSessionId = res.result.data.sessionId;
        console.log('Game session created:', this.gameSessionId);
      }
    } catch (error) {
      console.error('Create game session failed:', error);
    }
  },

  // 处理攻击
  handleAttack(e) {
    if (this.data.isPaused) return;

    const currentTime = Date.now();
    const timeSinceLastAttack = currentTime - this.data.lastAttackTime;

    // 连击判定
    if (timeSinceLastAttack < app.globalData.gameConfig.comboThreshold) {
      this.setData({
        combo: this.data.combo + 1
      });
    } else {
      this.setData({
        combo: 1
      });
    }

    this.setData({
      lastAttackTime: currentTime,
      attackCount: this.data.attackCount + 1
    });

    // 计算伤害
    const isCritical = this.data.combo >= 3;
    const damage = isCritical ? 2 : 1;

    // 更新血量
    this.updateBlood(damage);

    // 显示特效
    this.showDamageEffect(e.detail, e.touches[0], damage, isCritical);
    this.showParticleEffect(e.touches[0]);

    // 触觉反馈
    this.triggerVibrate(isCritical);

    // 检查连击
    this.checkCombo();

    // 显示对话
    this.showCharacterDialogue();

    // 埋点
    app.trackEvent('attack', {
      damage: damage,
      combo: this.data.combo,
      isCritical: isCritical
    });

    // 同步到服务器
    this.syncAttackData(damage, this.data.combo);
  },

  // 更新血量
  updateBlood(damage) {
    const newBlood = Math.max(0, this.data.blood - damage);
    const percentage = (newBlood / this.data.maxBlood) * 100;
    let color = '#4CAF50';

    if (percentage <= 30) {
      color = '#F44336';
    } else if (percentage <= 60) {
      color = '#FF9800';
    }

    this.setData({
      blood: newBlood,
      bloodPercentage: percentage,
      bloodColor: color
    });

    // 检查是否结束
    if (newBlood <= 0) {
      this.endGame();
    }

    // 检查变身
    this.checkTransform(percentage);
  },

  // 检查变身
  checkTransform(percentage) {
    let scale = 1;
    let transformed = false;
    let emoji = '🐸';

    if (percentage <= 80) {
      scale = 0.95;
    }
    if (percentage <= 60) {
      scale = 0.9;
    }
    if (percentage <= 40) {
      scale = 0.8;
    }
    if (percentage <= 20) {
      scale = 0.6;
      transformed = true;
      const emojis = ['🐸', '🐷', '🐸', '👹'];
      emoji = emojis[Math.floor(Math.random() * emojis.length)];
    }

    if (this.data.characterScale !== scale || this.data.transformedType !== transformed) {
      this.setData({
        characterScale: scale,
        transformedType: transformed,
        transformedEmoji: emoji,
        characterTransforming: true
      });

      setTimeout(() => {
        this.setData({
          characterTransforming: false
        });
      }, 500);
    }
  },

  // 显示伤害特效
  showDamageEffect(detail, touch, damage, isCritical) {
    const x = touch ? touch.x : Math.random() * 600 + 100;
    const y = touch ? touch.y : Math.random() * 400 + 200;

    const damageNumber = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      damage: damage,
      isCritical: isCritical,
      opacity: 1
    };

    this.setData({
      damageNumbers: [...this.data.damageNumbers, damageNumber]
    });

    // 移除旧的伤害数字
    setTimeout(() => {
      const numbers = this.data.damageNumbers.filter(n => n.id !== damageNumber.id);
      this.setData({
        damageNumbers: numbers
      });
    }, 1000);

    // 角色晃动
    this.setData({
      characterShaking: true
    });

    setTimeout(() => {
      this.setData({
        characterShaking: false
      });
    }, 100);
  },

  // 显示粒子特效
  showParticleEffect(touch) {
    if (!touch) return;

    const particles = [];
    const icons = ['⭐', '💫', '✨', '💖', '💥'];

    for (let i = 0; i < 5; i++) {
      particles.push({
        id: Date.now() + i,
        x: touch.x + (Math.random() - 0.5) * 100,
        y: touch.y + (Math.random() - 0.5) * 100,
        icon: icons[Math.floor(Math.random() * icons.length)],
        opacity: 1,
        '--tx': (Math.random() - 0.5) * 200 + 'rpx',
        '--ty': -Math.random() * 200 + 'rpx'
      });
    }

    this.setData({
      particles: [...this.data.particles, ...particles]
    });

    // 移除粒子
    setTimeout(() => {
      const remaining = this.data.particles.filter(p => !particles.find(item => item.id === p.id));
      this.setData({
        particles: remaining
      });
    }, 800);
  },

  // 触发震动
  triggerVibrate(isCritical) {
    if (isCritical) {
      wx.vibrateShort({
        type: 'heavy'
      });
    } else {
      wx.vibrateShort({
        type: 'light'
      });
    }
  },

  // 检查连击
  checkCombo() {
    const combo = this.data.combo;

    if (combo >= 3 && combo % 5 === 0) {
      const texts = ['暴击!', '太棒了!', '继续!', '加油!', '帅气!'];
      this.setData({
        showComboHint: true,
        comboHintText: texts[Math.floor(Math.random() * texts.length)]
      });

      setTimeout(() => {
        this.setData({
          showComboHint: false
        });
      }, 500);
    }

    // 更新最大连击
    if (combo > this.data.maxCombo) {
      this.setData({
        maxCombo: combo
      });
    }
  },

  // 显示角色对话
  showCharacterDialogue() {
    const dialogues = app.globalData.apologyMessages;
    const randomIndex = Math.floor(Math.random() * dialogues.length);

    this.setData({
      showDialog: true,
      dialogText: dialogues[randomIndex]
    });

    setTimeout(() => {
      this.setData({
        showDialog: false
      });
    }, 2000);
  },

  // ==================== 长按蓄力相关 ====================

  handleTouchStart(e) {
    if (this.data.isPaused || e.touches.length > 1) return;

    // 开始蓄力
    this.longPressTimer = setTimeout(() => {
      this.startCharge();
    }, app.globalData.gameConfig.longPressTime);
  },

  handleTouchEnd(e) {
    // 清除长按定时器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // 释放蓄力
    if (this.data.showChargeBar) {
      this.releaseCharge();
    }
  },

  startCharge() {
    this.setData({
      showChargeBar: true,
      chargeProgress: 0
    });

    // 蓄力动画
    let progress = 0;
    this.chargeTimer = setInterval(() => {
      progress += 2;
      this.setData({
        chargeProgress: progress
      });

      if (progress >= 100) {
        clearInterval(this.chargeTimer);
      }
    }, 10);

    // 震动反馈
    wx.vibrateShort({
      type: 'medium'
    });
  },

  releaseCharge() {
    clearInterval(this.chargeTimer);

    const chargeDamage = app.globalData.gameConfig.specialDamage;
    this.updateBlood(chargeDamage);

    this.setData({
      showChargeBar: false,
      chargeProgress: 0
    });

    // 屏幕震动
    wx.vibrateShort({
      type: 'heavy'
    });

    // 特效
    this.setData({
      characterShaking: true
    });

    setTimeout(() => {
      this.setData({
        characterShaking: false
      });
    }, 200);

    // 埋点
    app.trackEvent('special_attack', {
      damage: chargeDamage
    });
  },

  // ==================== 技能相关 ====================

  useSkill(e) {
    const skill = e.currentTarget.dataset.skill;

    if (this.data.skillCD[skill] > 0) {
      wx.showToast({
        title: '技能冷却中',
        icon: 'none'
      });
      return;
    }

    switch (skill) {
      case 'combo':
        this.useComboSkill();
        break;
      case 'truth':
        this.useTruthSkill();
        break;
      case 'transform':
        this.useTransformSkill();
        break;
    }
  },

  useComboSkill() {
    // 闪电五连鞭 - 连续5次攻击
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.updateBlood(2);
        this.showComboHint = true;
        this.comboHintText = '连击!';
      }, i * 100);
    }

    // 设置冷却
    this.setSkillCD('combo', 30);

    // 埋点
    app.trackEvent('use_skill', {
      skill: 'combo'
    });
  },

  useTruthSkill() {
    if (!this.data.skillUnlocked.truth) {
      wx.showModal({
        title: '解锁技能',
        content: '分享后即可解锁真心话炸弹技能',
        confirmText: '去分享',
        success: (res) => {
          if (res.confirm) {
            // 跳转到分享
          }
        }
      });
      return;
    }

    // 显示扎心语录
    const quotes = [
      '他不爱你,与你无关',
      '你值得更好的',
      '放下过去,拥抱未来',
      '感谢他的不娶之恩'
    ];

    wx.showModal({
      title: '真心话',
      content: quotes[Math.floor(Math.random() * quotes.length)],
      showCancel: false
    });

    // 埋点
    app.trackEvent('use_skill', {
      skill: 'truth'
    });
  },

  useTransformSkill() {
    if (!this.data.skillUnlocked.transform) {
      wx.showModal({
        title: '解锁技能',
        content: '花费10复仇币即可使用变形术',
        confirmText: '去充值',
        success: (res) => {
          if (res.confirm) {
            // 跳转到充值页面
          }
        }
      });
      return;
    }

    // 变形
    this.setData({
      transformedType: true,
      characterTransforming: true
    });

    setTimeout(() => {
      this.setData({
        characterTransforming: false
      });
    }, 500);

    // 埋点
    app.trackEvent('use_skill', {
      skill: 'transform'
    });
  },

  setSkillCD(skill, seconds) {
    this.setData({
      [`skillCD.${skill}`]: seconds
    });

    const timer = setInterval(() => {
      const cd = this.data.skillCD[skill] - 1;
      this.setData({
        [`skillCD.${skill}`]: cd
      });

      if (cd <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    this.data.skillTimers[skill] = timer;
  },

  // ==================== 游戏控制相关 ====================

  pauseGame() {
    this.setData({
      isPaused: true
    });
  },

  resumeGame() {
    this.setData({
      isPaused: false
    });
  },

  exitGame() {
    wx.showModal({
      title: '确认退出',
      content: '退出后游戏进度将不会保存',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  // ==================== 游戏结束相关 ====================

  endGame() {
    console.log('Game end');

    const gameDuration = Date.now() - this.data.gameStartTime.getTime();

    // 生成游戏结果
    const result = {
      characterType: this.data.currentCharacter.id,
      characterName: this.data.currentCharacter.name,
      attackCount: this.data.attackCount,
      maxCombo: this.data.maxCombo,
      gameDuration: gameDuration,
      reliefMessage: this.getReliefMessage()
    };

    this.setData({
      gameResult: result
    });

    // 埋点
    app.trackEvent('game_end', {
      ...result
    });

    // 跳转到结果页面
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/result/result?result=${encodeURIComponent(JSON.stringify(result))}`
      });
    }, 1000);
  },

  getReliefMessage() {
    const messages = app.globalData.reliefMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  },

  // ==================== 数据同步相关 ====================

  async syncAttackData(damage, combo) {
    try {
      await wx.cloud.callFunction({
        name: 'gameLogic',
        data: {
          action: 'attack',
          sessionId: this.gameSessionId,
          damage: damage,
          combo: combo
        }
      });
    } catch (error) {
      console.error('Sync attack data failed:', error);
    }
  },

  // ==================== 清理定时器 ====================

  clearTimers() {
    if (this.chargeTimer) {
      clearInterval(this.chargeTimer);
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    Object.values(this.data.skillTimers).forEach(timer => {
      clearInterval(timer);
    });
  }
});
