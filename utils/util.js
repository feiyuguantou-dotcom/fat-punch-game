// utils/util.js - 工具函数

/**
 * 格式化时间
 * @param {Date|Number} date - 日期对象或时间戳
 * @param {String} format - 格式化模板
 * @returns {String} 格式化后的时间字符串
 */
function formatTime(date, format = 'yyyy-MM-dd hh:mm:ss') {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('hh', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 格式化相对时间
 * @param {Date|Number} date - 日期对象或时间戳
 * @returns {String} 相对时间字符串
 */
function formatRelativeTime(date) {
  if (!date) return '';

  const now = Date.now();
  const timestamp = date instanceof Date ? date.getTime() : date;
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 12 * month;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < month) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前';
  } else {
    return Math.floor(diff / year) + '年前';
  }
}

/**
 * 格式化数字
 * @param {Number} num - 数字
 * @returns {String} 格式化后的数字字符串
 */
function formatNumber(num) {
  if (!num && num !== 0) return '0';

  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return String(num);
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {Number} wait - 等待时间(ms)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {Number} wait - 等待时间(ms)
 * @returns {Function} 节流后的函数
 */
function throttle(func, wait = 300) {
  let timeout;
  let previous = 0;

  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 深拷贝
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 生成随机ID
 * @param {Number} length - ID长度
 * @returns {String} 随机ID
 */
function generateId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 随机获取数组元素
 * @param {Array} arr - 数组
 * @returns {*} 随机元素
 */
function randomChoice(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 数组打乱
 * @param {Array} arr - 数组
 * @returns {Array} 打乱后的数组
 */
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 显示加载提示
 * @param {String} title - 提示文字
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title: title,
    mask: true
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示成功提示
 * @param {String} title - 提示文字
 * @param {Number} duration - 持续时间
 */
function showSuccess(title, duration = 2000) {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: duration
  });
}

/**
 * 显示错误提示
 * @param {String} title - 提示文字
 * @param {Number} duration - 持续时间
 */
function showError(title, duration = 2000) {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: duration
  });
}

/**
 * 显示确认弹窗
 * @param {String} content - 内容
 * @param {String} title - 标题
 * @returns {Promise<Boolean>} 用户是否确认
 */
function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

/**
 * 存储数据
 * @param {String} key - 键
 * @param {*} value - 值
 */
function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error('Set storage failed:', e);
    return false;
  }
}

/**
 * 获取存储数据
 * @param {String} key - 键
 * @returns {*} 存储的值
 */
function getStorage(key) {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    console.error('Get storage failed:', e);
    return null;
  }
}

/**
 * 删除存储数据
 * @param {String} key - 键
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('Remove storage failed:', e);
    return false;
  }
}

/**
 * 清空存储数据
 */
function clearStorage() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('Clear storage failed:', e);
    return false;
  }
}

module.exports = {
  formatTime,
  formatRelativeTime,
  formatNumber,
  debounce,
  throttle,
  deepClone,
  generateId,
  randomChoice,
  shuffle,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage
};
