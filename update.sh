#!/bin/bash

# 《胖揍前男友》游戏快速更新脚本

echo "================================"
echo "   胖揍前男友 - 快速更新脚本"
echo "================================"
echo ""

# 检查是否有 Git 仓库
if [ ! -d ".git" ]; then
    echo "⚠️  还未初始化 Git 仓库"
    echo "是否要初始化？(y/n)"
    read answer
    if [ "$answer" = "y" ]; then
        git init
        echo "✅ Git 仓库已初始化"
    else
        echo "❌ 取消更新"
        exit 1
    fi
fi

# 显示当前状态
echo "📋 当前状态："
git status

echo ""
echo "开始更新..."
echo ""

# 添加所有更改
git add .

# 提交
echo "请输入更新说明（例如：修复了bug）: "
read message

if [ -z "$message" ]; then
    message="更新游戏内容"
fi

git commit -m "$message"

# 推送
echo "正在推送..."
git push

echo ""
echo "✅ 更新完成！"
echo ""
echo "📝 部署平台会自动检测并更新网站"
echo "⏱️  通常需要 1-2 分钟生效"
echo ""
