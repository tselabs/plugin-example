import fs from 'fs';
import fetch from 'node-fetch';
import plugin from '../../lib/plugins/plugin.js';

if (!global.segment) {
  global.segment = (await import('oicq')).segment
}

const _path = process.cwd();
const cachePath = `${_path}/data/grassPicCache`;

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

// Init cache path
if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath);
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
        }
        // {
        //   reg: '^(#)?草图状态$',
        //   fnc: 'sendServiceStatus'
        // }
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
}
