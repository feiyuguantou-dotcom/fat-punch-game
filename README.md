# 《失恋反击战》微信小程序

一个可以安全地"揍前任"的微信小程序小游戏,帮助用户通过游戏化的方式进行情感宣泄和疗愈。

## 项目简介

**产品定位**: 失恋/分手情感疗愈小游戏
**核心功能**: 虚拟暴揍前任 + 情感宣泄 + 社交分享
**目标用户**: 18-35岁失恋/分手女性群体

## 技术栈

- **前端**: 微信小程序原生框架 (WXML + WXSS + JS)
- **后端**: 微信云开发 (云函数 + 云数据库 + 云存储)
- **设计系统**: 自定义主题变量 + 组件化设计

## 项目结构

```
胖揍前男友/
├── pages/                  # 页面文件
│   ├── index/             # 首页
│   ├── game/              # 游戏页面
│   ├── result/            # 结果页面
│   ├── test/              # 性格测试
│   ├── community/         # 社区
│   └── user/              # 个人中心
├── components/            # 组件
├── utils/                 # 工具函数
├── styles/                # 全局样式
├── cloudfunctions/        # 云函数
├── app.js                 # 小程序入口
├── app.json               # 小程序配置
└── app.wxss               # 全局样式
```

## 核心功能

### 1. 单人挑战模式
- 选择渣男类型 (6种预设类型)
- 点击攻击、连击、蓄力大招
- 游戏结束释怀卡片
- 社交分享功能

### 2. 性格测试模式
- 5个问题测试
- 生成测试报告
- 分享裂变引流

## 配置说明

### 1. 云开发环境

需要在 `app.js` 中配置云开发环境ID:

```javascript
wx.cloud.init({
  env: 'your-env-id', // 替换为您的云开发环境ID
  traceUser: true,
});
```

### 2. 小程序AppID

需要在 `project.config.json` 中配置小程序AppID:

```json
{
  "appid": "your-appid"
}
```

## 部署步骤

### 1. 安装云函数依赖

```bash
cd cloudfunctions/gameLogic && npm install
cd ../user && npm install
cd ../share && npm install
cd ../analytics && npm install
```

### 2. 上传云函数

在微信开发者工具中右键云函数文件夹,选择"上传并部署"

### 3. 创建数据库集合

在云开发控制台创建:
- users (用户数据)
- game_sessions (游戏会话)
- share_records (分享记录)
- analytics (埋点数据)

## 运行项目

1. 使用微信开发者工具打开项目
2. 配置AppID和云开发环境ID
3. 点击"编译"即可预览

---

**打完就释怀,笑着向前看!** ❤️
