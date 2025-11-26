// result.js
Page({
  data: {
    videoData: null,
    showVideoModal: false,
    isVideo: false
  },

  onLoad(options) {
    // 从页面参数获取数据
    if (options.data) {
      try {
        const videoData = JSON.parse(decodeURIComponent(options.data))
        console.log('videoData:', videoData)
        console.log('video_url:', videoData.video_url)
        console.log('video_url type:', typeof videoData.video_url)
        console.log('video_url length:', videoData.video_url ? videoData.video_url.length : 0)
        
        // 判断是否是视频类型 - 更严格的检查
        const isVideo = !!(videoData.video_url && videoData.video_url.trim() !== '')
        console.log('isVideo:', isVideo)
        
        this.setData({ 
          videoData,
          isVideo
        })
      } catch (error) {
        console.error('解析数据失败:', error)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    }
  },

  // 播放视频
  playVideo() {
    this.setData({
      showVideoModal: true
    })
  },

  // 关闭视频模态框
  closeVideoModal() {
    this.setData({
      showVideoModal: false
    })
  },

  // 下载视频
  downloadVideo() {
    const { videoData } = this.data
    if (!videoData || !videoData.video_url) {
      wx.showToast({
        title: '视频链接不存在',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '提示',
      content: '是否下载视频到相册？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '下载中...' })
          
          wx.downloadFile({
            url: videoData.video_url,
            success: (res) => {
              if (res.statusCode === 200) {
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: () => {
                    wx.hideLoading()
                    wx.showToast({
                      title: '保存成功',
                      icon: 'success'
                    })
                  },
                  fail: (err) => {
                    wx.hideLoading()
                    if (err.errMsg.includes('auth')) {
                      wx.showModal({
                        title: '需要授权',
                        content: '需要您授权保存视频到相册',
                        success: (modalRes) => {
                          if (modalRes.confirm) {
                            wx.openSetting()
                          }
                        }
                      })
                    } else {
                      wx.showToast({
                        title: '保存失败',
                        icon: 'none'
                      })
                    }
                  }
                })
              } else {
                wx.hideLoading()
                wx.showToast({
                  title: '下载失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({
                title: '下载失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 保存封面
  saveCover() {
    const { videoData } = this.data
    
    // 如果没有 cover_url，则使用第一张图片作为封面
    const coverUrl = videoData.cover_url || (videoData.images && videoData.images.length > 0 ? videoData.images[0] : null)
    
    if (!coverUrl) {
      wx.showToast({
        title: '封面不存在',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })
    
    wx.downloadFile({
      url: coverUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading()
              wx.showToast({
                title: '封面已保存',
                icon: 'success'
              })
            },
            fail: (err) => {
              wx.hideLoading()
              if (err.errMsg.includes('auth')) {
                wx.showModal({
                  title: '需要授权',
                  content: '需要您授权保存图片到相册',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting()
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const { videoData } = this.data
    
    wx.previewImage({
      current: videoData.images[index],
      urls: videoData.images
    })
  }
})
