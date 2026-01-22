// pages/test/test.js
const app = getApp();

Page({
  data: {
    currentStep: 0,
    progress: 20,
    selectedOption: null,
    answers: [],
    testResult: null,
    questions: [
      {
        question: '你的前任最常说的是?',
        options: [
          { label: 'A', text: '"我忙"', type: 'cold' },
          { label: 'B', text: '"你无理取闹"', type: 'gaslight' },
          { label: 'C', text: '"都是你的错"', type: 'blame' }
        ]
      },
      {
        question: '分手时他的反应是?',
        options: [
          { label: 'A', text: '冷暴力,不回复消息', type: 'cold' },
          { label: 'B', text: '立刻有了新欢', type: 'rebound' },
          { label: 'C', text: '痛哭流涕,求原谅', type: 'fake' }
        ]
      },
      {
        question: '你最想对他说什么?',
        options: [
          { label: 'A', text: '"滚!"', type: 'angry' },
          { label: 'B', text: '"祝你幸福"', type: 'peaceful' },
          { label: 'C', text: '"为什么?"', type: 'confused' }
        ]
      },
      {
        question: '如果有机会,你会?',
        options: [
          { label: 'A', text: '揍他一顿', type: 'revenge' },
          { label: 'B', text: '骂他一顿', type: 'anger' },
          { label: 'C', text: '无视他', type: 'indifferent' }
        ]
      },
      {
        question: '你现在的心情是?',
        options: [
          { label: 'A', text: '愤怒', type: 'angry' },
          { label: 'B', text: '不甘心', type: 'unwilling' },
          { label: 'C', text: '释怀', type: 'relieved' }
        ]
      }
    ]
  },

  onLoad(options) {
    console.log('Test onLoad:', options);

    // 埋点
    app.trackEvent('test_page_view', {
      from: options.from || 'direct'
    });
  },

  onReady() {
    console.log('Test onReady');
  },

  onShow() {
    console.log('Test onShow');
  },

  onHide() {
    console.log('Test onHide');
  },

  onUnload() {
    console.log('Test onUnload');
  },

  onShareAppMessage() {
    if (this.data.testResult) {
      return {
        title: `测出我的渣男类型是"${this.data.testResult.scumbagType}",超准!`,
        path: '/pages/index/index?from=share&inviterId=' + (app.globalData.userId || ''),
        imageUrl: '/images/share-test.jpg'
      };
    }
    return {
      title: '测测你的渣男类型,超准!',
      path: '/pages/index/index?from=share&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-test.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '测测你的渣男类型,超准!💀',
      query: 'from=timeline&inviterId=' + (app.globalData.userId || ''),
      imageUrl: '/images/share-test.jpg'
    };
  },

  // 选择选项
  selectOption(e) {
    const index = e.currentTarget.dataset.index;

    this.setData({
      selectedOption: index
    });

    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
  },

  // 下一题
  nextQuestion() {
    if (this.data.selectedOption === null) {
      wx.showToast({
        title: '请先选择一个选项',
        icon: 'none'
      });
      return;
    }

    // 保存答案
    const answers = [...this.data.answers, this.data.selectedOption];

    // 判断是否还有下一题
    if (this.data.currentStep < this.data.questions.length - 1) {
      this.setData({
        currentStep: this.data.currentStep + 1,
        progress: ((this.data.currentStep + 2) / this.data.questions.length) * 100,
        selectedOption: null,
        answers: answers
      });
    } else {
      // 完成测试,生成结果
      this.generateResult(answers);
    }

    // 埋点
    app.trackEvent('test_answer', {
      step: this.data.currentStep,
      answer: this.data.selectedOption
    });
  },

  // 生成测试结果
  generateResult(answers) {
    // 分析答案类型
    const typeCount = {
      cold: 0,
      gaslight: 0,
      blame: 0,
      rebound: 0,
      fake: 0,
      angry: 0,
      peaceful: 0,
      confused: 0,
      revenge: 0,
      anger: 0,
      indifferent: 0,
      unwilling: 0,
      relieved: 0
    };

    answers.forEach((answerIndex, stepIndex) => {
      const type = this.data.questions[stepIndex].options[answerIndex].type;
      if (typeCount[type] !== undefined) {
        typeCount[type]++;
      }
    });

    // 找出最多的类型
    let maxType = 'cold';
    let maxCount = 0;
    for (const type in typeCount) {
      if (typeCount[type] > maxCount) {
        maxCount = typeCount[type];
        maxType = type;
      }
    }

    // 根据类型生成结果
    const result = this.getResultByType(maxType);

    this.setData({
      currentStep: this.data.questions.length,
      progress: 100,
      testResult: result
    });

    // 埋点
    app.trackEvent('test_complete', {
      resultType: maxType
    });
  },

  // 根据类型获取结果
  getResultByType(type) {
    const results = {
      cold: {
        emoji: '💀',
        title: '冷暴力渣男受害者',
        subtitle: '你经历了最折磨人的冷暴力',
        scumbagType: '冷暴力渣男',
        yourPersonality: '你是一个善良、有耐心的人,但常常因为太在意而受伤。你值得一个愿意倾听和回应的人。',
        matchAdvice: '你需要一个温暖、体贴的伴侣,能够在意你的感受,及时回应你的需求。'
      },
      gaslight: {
        emoji: '🎭',
        title: '煤气灯效应受害者',
        subtitle: '你的自信被摧毁了',
        scumbagType: '操控型渣男',
        yourPersonality: '你是一个温柔、信任他人的人,但容易被操纵。你需要学会相信自己,不被他人影响。',
        matchAdvice: '你需要一个真诚、尊重你的伴侣,不会利用你的善良来操控你。'
      },
      rebound: {
        emoji: '💔',
        title: '无缝衔接受害者',
        subtitle: '你被快速替代了',
        scumbagType: '无缝衔接渣男',
        yourPersonality: '你是一个深情、专一的人,对待感情认真。这种品质非常珍贵,只是遇到了错的人。',
        matchAdvice: '你需要一个同样认真对待感情的人,愿意和你一起成长,而不是随时准备离开。'
      },
      angry: {
        emoji: '🔥',
        title: '愤怒的复仇者',
        subtitle: '你的愤怒是正常的',
        scumbagType: '伤害型渣男',
        yourPersonality: '你是一个有原则、有底线的人,不容忍背叛。这显示了你的自尊和自爱。',
        matchAdvice: '你需要一个尊重你、珍视你的伴侣,不会轻易伤害你。'
      },
      peaceful: {
        emoji: '🕊️',
        title: '温柔的释怀者',
        subtitle: '你已经放下了',
        scumbagType: '过去式渣男',
        yourPersonality: '你是一个成熟、理智的人,能够从失败的感情中学习和成长。这是一种非常珍贵的品质。',
        matchAdvice: '你已经准备好迎接更好的感情了,继续加油!'
      },
      relieved: {
        emoji: '🌸',
        title: '坚强的幸存者',
        subtitle: '你已走出阴霾',
        scumbagType: '不值得回忆的渣男',
        yourPersonality: '你是一个非常坚强的人,能够从挫折中走出来。你的未来充满希望。',
        matchAdvice: '保持这种积极的心态,你一定会遇到对的人!'
      }
    };

    return results[type] || results.cold;
  },

  // 去玩游戏
  playGame() {
    console.log('Play game from test');

    // 埋点
    app.trackEvent('click_play_game_from_test', {
      resultType: this.data.testResult.scumbagType
    });

    wx.redirectTo({
      url: '/pages/game/game'
    });
  },

  // 重新测试
  retryTest() {
    console.log('Retry test');

    // 埋点
    app.trackEvent('click_retry_test', {});

    this.setData({
      currentStep: 0,
      progress: 20,
      selectedOption: null,
      answers: [],
      testResult: null
    });
  }
});
