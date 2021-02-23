const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/callCloudStorage.js')
const callCloudFn = require('../utils/callCloudFn.js')

//获取博客列表
router.get('/list', async (ctx, next) => {
    const params = ctx.request.query
    const query = `
        db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createTime', 'desc').get()
    `
    const res = await callCloudDB(ctx, 'databasequery', query)
    ctx.body = {
        code: 20000,
        data: res.data,
    }
})

//博客详情
router.get('/detail', async (ctx, next) => {
    const params = ctx.request.query
    console.log(params.blogId)
    const res = await callCloudFn(ctx, 'blog', {
        $url: 'detail',
        blogId: params.blogId,
    })
    //解析出博客详情，建议挨个打印所有层级
    const detail = JSON.parse(res.resp_data).list[0]

    //请求博客图片下载链接
    let files = []
    for (let i = 0, len = detail.imgs.length; i < len; i++) {
        files.push({
            fileid: detail.imgs[i],
            max_age: 7200,
        })
    }
    const download = await cloudStorage.download(ctx, files)

    //博客图片数组
    let urls = []
    for (let i = 0, len = download.file_list.length; i < len; i++) {
        urls.push(download.file_list[i].download_url)
    }

    detail.imgs = urls
    console.log(detail)

    ctx.body = {
        code : 20000,
        data : detail,
    }
})

//批量删除博客（同时删除评论和博客图片）
router.post('/delete', async (ctx, next) => {
    const params = ctx.request.body
    // console.log(params)
    console.log(typeof params)
    //postman测试的时候，不反序列化
    const ids = params.ids
    const imgs = params.imgs

    // 前端页面测试需要反序列化
    // const ids = JSON.parse(params.ids)
    // const imgs = JSON.parse(params.imgs)

    console.log(ids)
    console.log(imgs)

    //批量删除博客，记录返回结果
    const batchDelete = `db.collection('blog').where({_id: _.in(["${params.ids}"])}).remove()`
    const delBlogRes = await callCloudDB(ctx, 'databasedelete', batchDelete)
    console.log('博客删除结果')
    console.log(batchDelete)
    console.log(delBlogRes)

    //删除所有图片
    const delStorageRes = await cloudStorage.delete(ctx, imgs)
    console.log('图片删除结果')
    console.log(delStorageRes)

    let delCommentRes = []
    //遍历，删除每篇博客的评论，并把删除结果计入数组
    for (let i = 0, len = ids.length; i < len; i++) {
        const id = ids[i]
        //删除每篇博客评论
        const delComment = `db.collection('blog-comment').where({blogId: '${id}'}).remove()`
        const res = await callCloudDB(ctx, 'databasedelete', delComment)
        delCommentRes.push(res)
    }
    console.log('评论删除结果')
    console.log(delCommentRes)

    ctx.body = {
        code: 20000,
        data: {
            delBlogRes,
            delCommentRes,
            delStorageRes,
        },
    }
})

module.exports = router