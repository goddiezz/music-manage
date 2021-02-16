
// 引入异步请求库
const rp = require('request-promise')
//微信小程序的APPID和APPSECRET
const APPID = 'wx71a981549bfa7fbb'
const APPSECRET = '8bbfa2b3ff79133c93723b7d23cb7ea8'
//请求access——token的URL
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
//引入node.js的文件操作模块【自带】
const fs = require('fs')
//引入node.js的文件路径模块【自带】
const path = require('path')
//定义access-token的缓存路径和文件名
const fileName = path.resolve(__dirname, './access_token.json')

//异步方法,请求更新access——token
const updateAccessToken = async () => {
    //发布异步get请求，得到结果（JSON字符串，这和axios库得到的就是Json对象有所不同
    const resStr = await rp(URL)
    //将JSON字符串反序列化为JSON对象
    const res = JSON.parse(resStr)
    console.log(res)
    //如果返回结果有access——token。则写入文件
    if(res.access_token) {
        fs.writeFileSync(
            fileName,
            JSON.stringify({
                access_token: res.access_token,
                createTime: new Date(),
            })
        )
    } else {
        //否则继续请求
        await updateAccessToken()
    }
}

//定义一个getAccessToken为异步执行的函数
const getAccessToken = async () => {
    try {
        //同步读取文件（结果为字符串)
        const readRes = fs.readFileSync(fileName, 'utf8')
        //将结果转为对象
        const readObj = JSON.parse(readRes)
        //得到其中的创建时间
        const createTime = new Date(readObj.createTime).getTime()
        //计算和当前时间的差值（是否超过7200秒/2小时）
        const nowTime = new Date().getTime()
        //token超时，重新请求
        if ((nowTime - createTime) / 1000 / 60 / 60 >=2) {
            await updateAccessToken()
            await getAccessToken()
        }
        //未超时，则返回access_token
        return readObj.access_token
    } catch (error) {
        await updateAccessToken()
        await getAccessToken()
    }
}

//定时器，快到7200秒请求更新access_token
setInterval(async () => {
    await updateAccessToken()
}, (7200 - 300) * 1000)

updateAccessToken()

module.exports = getAccessToken