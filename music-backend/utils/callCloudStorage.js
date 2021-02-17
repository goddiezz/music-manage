const getAccessToken = require('./getAccessToken.js')
const rp = require('request-promise')
const fs = require('fs')
// const { delete } = require('request-promise')

const cloudStorage = {
    //上传文件
    async upload(ctx) {
        // 1.获取文件上传链接
        const ACCESS_TOKEN = await getAccessToken()
        const file = ctx.request.files.file //客户端文件对象
        console.log(ctx)
        const path = `swiper/${Date.now()}-${Math.random()}-${file.name}` //云存储路径
        //封装请求相关操作，包括请求方法，请求地址，请求体json对象，返回值转为JSON
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                path,
                env: ctx.state.env,
            },
            json: true,
        }

        //发起异步请求，返回值赋给info
        const info = await rp(options)
            .then(function (res) {
                return res
            })
            .catch(function (err) {
                console.log(err)
            })
        
        //2.上传图片
        //获取到返回数据后，需拼装一个HTTP POST请求，其中uri为返回包的url字段，Body部分格式为multipart/form-data
        const params = {
            method: 'POST',
            headers: {
                'content-type': 'multipart/form-data',

            },
            uri: info.url,
            formData: {
                key: path,
                Signature: info.authorization,
                'x-cos-security-token': info.token,
                'x-cos-meta-fileid': info.cos_file_id,
                file: fs.createReadStream(file.path),
            },
            json: true,
        }
        await rp(params)
        //返回云存储文件的file_id
        return info.file_id

    },

    //批量获取文件下载链接
    //https://
    async download(ctx, fileList) {
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                env: ctx.state.env,
                file_list: fileList,
            },
            json: true,
        }

        const info = await rp(options)
            .then(function (res) {
                return res
            })
            .catch(function (err) {
                console.log(err)
            })
        return info
    },


    //删除
    async delete(ctx, fileid_list) {
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
            body: {
                env: ctx.state.env,
                fileid_list: fileid_list,
            },
            json: true,
        }

        const info = await rp(options)
            .then(function (res) {
                return res
            })
            .catch(function (err) {
                console.log(err)
            })
        return info
    },
}

module.exports = cloudStorage