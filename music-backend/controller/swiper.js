const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/callCloudStorage.js')
const callCloudFn = require('../utils/callCloudFn.js')

//获取轮播图列表    
router.get('/list', async (ctx, next) => {
    //查询数据库swiper集合的字符串模版
    const query = `db.collection('swiper').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    const data = res.data
    console.log('data数组')
    console.log(data)
    //遍历查询结果data，将每个结果的fileid和有效时间拼成对象存入files数组
    let files = []
    for (let i = 0, len = data.length;i < len; i++) {
        files.push({
            fileid: JSON.parse(data[i]).fileid,
            max_age: 7200,
        })
    }
    console.log('files数组')
    console.log(files)
    //调用封装好的cloudStorage模块的下载功能，注意观察返回结果包含那些内容
    const download = await cloudStorage.download(ctx, files)
    console.log('download')
    console.log(download)
    //返回结果数组
    let returnData = []
    //返回结果的每个对象包括：文件https地址download_url（用于在页面显示轮播图）
    //文件云存储id： fileid（用于删除文件）以及这条记录在云数据库的唯一id（用于在数据库删除记录 
    for( let i = 0, len = download.file_list.length; i < len; i++) {
        returnData.push({
            download_url: download.file_list[i].download_url,
            fileid: download.file_list[i].fileid,
            _id: JSON.parse(data[i])._id,
        })
    }
    console.log('returnData数组')
    console.log(returnData)
    ctx.body = {
        code: 20000,
        data: returnData,

    }
})

//上传轮播图
router.post('/upload', async (ctx, next) => {
    //上传到云存储
    const fileid = await cloudStorage.upload(ctx)
    console.log(fileid)
    //写入数据库
    const query = `
        db.collection('swiper').add({
            data: {
                fileid: '${fileid}'
            }
        })
    `
    const res = await callCloudDB(ctx, 'databaseadd', query)
    console.log(res)
    ctx.body = {
        code: 20000,
        id_list: res.id_list,
    }
})

//删除轮播图
router.get('/delete', async (ctx, next) => {
    const params = ctx.request.query
    console.log(params)
    //删除云数据库中的内容
    const query = `db.collection('swiper').doc('${params._id}').remove()`
    const delDBRes = await callCloudDB(ctx, 'databasedelete', query)

    //删除云存储中的文件
    const delStorageRes = await cloudStorage.delete(ctx, [params.fileid])
    ctx.body = {
        code: 20000,
        data: {
            delDBRes,
            delStorageRes
        },
    }
})

module.exports = router