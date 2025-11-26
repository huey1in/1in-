Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    },
    background: {
      type: String,
      value: '#ffffff'
    },
    color: {
      type: String,
      value: '#111111'
    },
    autoBack: {
      type: Boolean,
      value: true
    }
  },

  data: {
    statusBarHeight: 0
  },

  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {}
      this.setData({
        statusBarHeight: info.statusBarHeight || 0
      })
    }
  },

  methods: {
    onBackTap() {
      this.triggerEvent('back')
      if (this.data.autoBack) {
        wx.navigateBack({
          fail: () => {
            wx.switchTab({
              url: '/pages/index/index',
              fail: () => {}
            })
          }
        })
      }
    }
  }
})
