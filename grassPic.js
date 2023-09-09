import fetch from 'node-fetch';
import plugin from '../../lib/plugins/plugin.js';

/**
 * 是否启用开发模式
 * @type {boolean}
 */
let devMode = false;
/**
 * API基础URL
 */
let getPicUrl = `https://oss.grass.starxw.com/service/image?type=download`;
let getStatusUrl = `https://oss.grass.starxw.com/service/status`;
// let postUploadUrl = `https://oss.grass.starxw.com/service/upload`
// let getInfoUrl = `https://oss.grass.starxw.com/service/info`

if (devMode) {
  getPicUrl += `&devmode=normal`;
  getStatusUrl += `?devmode=normal`;
}

export class GrassPic extends plugin {
  constructor() {
    super({
      name: '[草图大全]grassPic.js',
      dsc: '发送草图',
      event: 'message',
      priority: 114,
      rule: [
        {
          reg: '^(#)?生草$',
          fnc: 'sendGrassPic'
        },
        {
          reg: '^(#)?草图状态$',
          fnc: 'sendServiceStatus'
        }
      ]
    })
  }

  /** 发送生草 */
  async sendGrassPic(e) {
    // 从api获取图片
    const response = await fetch(getPicUrl);
    // 判断请求是否成功
    if (response.status !== 200) {
      // 请求失败，发送错误信息
      await e.reply('请求草图失败，请稍后重试。');
      return;
    }
    // 获取图片数据
    const imageData = await response.arrayBuffer();
    // 转换为Buffer类型
    const buffer = Buffer.from(imageData);
    // 发送图片
    await e.reply(segment.image(buffer), true);
  }

  /** 发送服务状态 */
  async sendServiceStatus(e) {
    try {
      // 发送服务状态请求
      const response = await fetch(getStatusUrl);
      if (!response.ok) {
        throw new Error(`请求草图服务状态失败: ${response.status} ${response.statusText}`);
      }
      // 解析服务状态
      const data = await response.json();
      const model = `
        图库中图片的总数：${data.totalImage}
        图库占用的空间大小：${data.totalImageSizeHuman}
        审核队列的状态：${data.waitImage}
        图片接口的累计请求数：${data.apiCount}
        图片接口的今日请求数：${data.apiCountToday}
        图片接口的今日流量：${data.apiFlowTodayHuman}
        服务是否正常：${data.service ? '是' : '否'}
      `;
      // 发送服务状态
      await e.reply(model, true);
    } catch (error) {
      // 发送请求错误信息
      await e.reply(`请求草图服务状态失败: ${error.message}`);
    }
  }
}
