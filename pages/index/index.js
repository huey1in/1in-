// index.js
const BASE_URL = 'https://douyin.yinxh.fun'

Page({
  data: {
    shareUrl: '',
    loading: false,
    errorMsg: ''
  },

  // 输入链接
  onUrlInput(e) {
    this.setData({
      shareUrl: e.detail.value,
      errorMsg: ''
    })
  },

  // 粘贴剪贴板内容
  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({
          shareUrl: res.data,
          errorMsg: ''
        })
        wx.showToast({
          title: '已粘贴',
          icon: 'success',
          duration: 1000
        })
      },
      fail: () => {
        wx.showToast({
          title: '获取剪贴板失败',
          icon: 'none'
        })
      }
    })
  },

  // 从分享文案中提取主流短视频链接（抖音/快手/小红书等）
  extractShareUrl(text = '') {
    const patterns = [
      /https?:\/\/v\.douyin\.com\/[\w-]+\/?/i,
      /https?:\/\/(?:www\.)?douyin\.com\/[^\s]+/i,
      /https?:\/\/(?:www\.)?iesdouyin\.com\/[^\s]+/i,
      /https?:\/\/v\.kuaishou\.com\/[\w-]+/i,
      /https?:\/\/(?:www\.)?kuaishou\.com\/[^\s]+/i,
      /https?:\/\/(?:www\.)?xiaohongshu\.com\/[^\s]+/i,
      /https?:\/\/xhslink\.com\/[^\s]+/i,
      /https?:\/\/(?:www\.)?pipix\.com\/[^\s]+/i,
      /https?:\/\/(?:www\.)?huoshan\.com\/[^\s]+/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[0]
    }

    const fallback = text.match(/https?:\/\/[^\s]+/i)
    return fallback ? fallback[0] : null
  },

  // 解析视频
  async parseVideo() {
    let { shareUrl } = this.data

    if (!shareUrl.trim()) {
      this.setData({
        errorMsg: '请输入分享链接'
      })
      return
    }

    // 从分享文案中提取真实的可解析链接
    const extractedUrl = this.extractShareUrl(shareUrl)
    if (extractedUrl) {
      shareUrl = extractedUrl
      console.log('提取到的链接:', extractedUrl)
    } else {
      this.setData({
        errorMsg: '未找到有效的短视频链接'
      })
      return
    }

    this.setData({
      loading: true,
      errorMsg: '',
      videoData: null
    })

    try {
      console.log('请求URL:', `${BASE_URL}/video/share/url/parse?url=${shareUrl}`)

      const res = await this.request({
        url: `${BASE_URL}/video/share/url/parse`,
        data: { url: shareUrl }
      })

      console.log('API响应:', res)

      if (res.code === 200) {
        this.setData({
          loading: false
        })

        // 跳转到结果页面
        wx.navigateTo({
          url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(res.data))}`
        })
      } else {
        this.setData({
          loading: false,
          errorMsg: res.msg || '解析失败'
        })
        wx.showToast({
          title: res.msg || '解析失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('解析失败:', error)
      this.setData({
        loading: false,
        errorMsg: error.errMsg || '网络错误，请稍后重试'
      })
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 封装请求方法
  request({ url, data = {}, method = 'GET' }) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        data,
        method,
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
})
