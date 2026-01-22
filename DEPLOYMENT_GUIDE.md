# 《胖揍前男友》游戏部署指南

## 🚀 方案一：GitHub Pages（推荐 - 完全免费）

### 步骤详解

#### 1. 创建GitHub账号
1. 访问 https://github.com
2. 点击 "Sign up" 注册账号
3. 验证邮箱

#### 2. 创建新仓库
1. 登录后点击右上角 "+" → "New repository"
2. 仓库名称：`fat-punch-game`（或其他名称）
3. 设置为 **Public** 公开仓库
4. 勾选 "Add a README file"
5. 点击 "Create repository"

#### 3. 上传游戏文件

**方法A：通过网页上传（简单）**
1. 进入新创建的仓库
2. 点击 "uploading an existing file"
3. 将 `index.html` 文件拖拽到上传区域
4. 在底部提交信息填写："初次上传"
5. 点击 "Commit changes"

**方法B：通过Git命令（推荐）**

在终端执行：

```bash
# 1. 进入游戏目录
cd "/Users/chenpeng/胖揍前男友"

# 2. 初始化Git仓库
git init

# 3. 添加所有文件
git add .

# 4. 提交更改
git commit -m "初次上传：胖揍前男友游戏"

# 5. 关联远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/fat-punch-game.git

# 6. 推送到GitHub
git push -u origin main
```

#### 4. 启用 GitHub Pages

1. 进入仓库页面
2. 点击 "Settings" 标签
3. 左侧菜单找到 "Pages"
4. 在 "Source" 下选择：
   - Branch: `main` 或 `master`
   - Folder: `/ (root)`
5. 点击 "Save"

#### 5. 等待部署

- 等待1-2分钟
- 刷新页面，会看到访问地址：
  ```
  https://YOUR_USERNAME.github.io/fat-punch-game/
  ```

#### 6. 访问游戏

将上面的链接分享给朋友即可！

---

## 🌐 方案二：Vercel（推荐 - 速度快）

### 优点
- ✅ 完全免费
- ✅ 部署超快
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 支持自定义域名

### 步骤

#### 1. 注册 Vercel
1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 使用 GitHub 账号登录（推荐）

#### 2. 导入项目
1. 登录后点击 "New Project"
2. 选择 "Import Git Repository"
3. 输入你的 GitHub 仓库地址
4. 或直接拖拽 `index.html` 文件

#### 3. 配置项目
- Project Name: `fat-punch-game`（自动生成）
- Framework Preset: "Other"
- Root Directory: `./`
- 点击 "Deploy"

#### 4. 等待部署
- 通常只需10-30秒
- 部署完成后会显示访问地址：
  ```
  https://fat-punch-game.vercel.app
  ```

#### 5. 访问游戏
分享这个链接即可！

---

## 🔥 方案三：Netlify（推荐 - 易用）

### 优点
- ✅ 完全免费
- ✅ 拖拽部署（最简单）
- ✅ 自动HTTPS
- ✅ 表单处理等高级功能

### 步骤

#### 方法A：拖拽部署（超简单）

1. 访问 https://www.netlify.com
2. 注册账号（可用邮箱或GitHub登录）
3. 登录后，将 `index.html` 文件**直接拖拽**到页面上的 "Drag and drop your site output here" 区域
4. 等待上传完成
5. 修改网站名称（可选）
6. 点击 "Deploy site"
7. 完成！获得访问链接

#### 方法B：通过Git部署

1. 登录 Netlify
2. 点击 "New site from Git"
3. 选择 GitHub
4. 授权并选择你的仓库
5. 构建设置保持默认
6. 点击 "Deploy site"

---

## 📱 方案四：码云 Gitee Pages（国内访问快）

### 优点
- ✅ 国内访问速度快
- ✅ 完全免费
- ✅ 中文界面

### 步骤

1. 访问 https://gitee.com
2. 注册账号
3. 创建新仓库：`fat-punch-game`
4. 上传 `index.html` 文件
5. 进入仓库页面
6. 点击 "服务" → "Gitee Pages"
7. 点击 "启动"
8. 等待部署完成
9. 访问地址：`https://YOUR_USERNAME.gitee.io/fat-punch-game`

---

## 🎁 方案五：阿里云 OSS + CDN（企业级）

### 适用场景
- 需要高性能
- 需要自定义域名
- 企业级应用

### 费用
- 约 ¥0.5/GB/月
- CDN流量费用

### 步骤（略，较复杂）

---

## ⚡ 快速部署推荐

### 🏆 最简单方案：Netlify 拖拽部署

```
时间：2分钟
难度：⭐
适合：新手
```

**操作**：
1. 打开 https://app.netlify.com/drop
2. 把 `index.html` 拖进去
3. 完成！

### 🚀 最专业方案：GitHub Pages

```
时间：10分钟
难度：⭐⭐
适合：有GitHub账号的开发者
```

**优势**：版本控制、便于更新

### 💎 最快方案：Vercel

```
时间：3分钟
难度：⭐
适合：追求速度的用户
```

**优势**：部署最快、CDN最好

---

## 📋 部署前检查清单

在部署前，请确保：

- [ ] `index.html` 文件完整且能正常打开
- [ ] 图片路径使用正确的URL（本地路径在线上无法访问）
- [ ] 测试所有功能是否正常

**重要提示**：如果你使用的是本地图片路径（如 `/Users/chenpeng/Desktop/1.jpg`），需要：

1. **将图片放到网络**：
   - 上传到图床（如：https://imgtu.com/）
   - 或上传到 GitHub 仓库
   - 或使用 CDN

2. **修改图片路径**：

```html
<!-- 修改前（本地路径 - 无法访问）-->
<img src="/Users/chenpeng/Desktop/1.jpg">

<!-- 修改后（网络URL - 可访问）-->
<img src="https://your-cdn.com/1.jpg">
```

---

## 🔧 部署后测试

部署完成后，测试以下内容：

1. **基础功能**
   - [ ] 首页正常显示
   - [ ] 能点击"开始胖揍"
   - [ ] 测试功能正常
   - [ ] 游戏能正常玩
   - [ ] 结果页正常显示

2. **移动端测试**
   - [ ] 在手机浏览器中打开
   - [ ] 检查布局是否正常
   - [ ] 检查触摸操作是否流畅

3. **分享测试**
   - [ ] 复制链接发给朋友
   - [ ] 让朋友在不同设备上测试
   - [ ] 收集反馈

---

## 🌐 获得的访问链接示例

部署成功后，你会获得类似这样的链接：

```
# GitHub Pages
https://username.github.io/fat-punch-game/

# Vercel
https://fat-punch-game.vercel.app

# Netlify
https://amazing-pigskin.netlify.app

# Gitee Pages
https://username.gitee.io/fat-punch-game
```

**分享方法**：
1. 复制上面的链接
2. 发送给朋友："我做了个解压小游戏，快来试试！"
3. 或生成二维码图片发朋友圈

---

## ❓ 常见问题

### Q1：图片显示不出来？
**A**：本地图片路径在网上无法访问，需要上传到网络。

### Q2：如何更新游戏？
**A**：修改 `index.html` 后，重新上传或提交代码，平台会自动更新。

### Q3：域名可以自定义吗？
**A**：可以！在平台设置中添加自定义域名，并配置DNS。

### Q4：有多少人能玩？
**A**：GitHub Pages 每月 100GB 流量，Netlify 每月 100GB，通常足够使用。

---

## 🎉 推荐选择

**新手推荐**：Netlify 拖拽部署（2分钟搞定）
**开发者推荐**：GitHub Pages（免费且专业）
**追求速度**：Vercel（全球最快CDN）
**国内用户**：Gitee Pages（国内访问快）

选择任一方案，让朋友们都能玩到你做的游戏！🎮
