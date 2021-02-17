//引入koa路由
const Router = require('koa-router')
//创建路由对象
const router = new Router()
//引入封装的调用云函数的模块
const callCloudFn = require('../utils/callCloudFn')
//引入封装的调用云数据库模块
const callCloudDB = require('../utils/callCloudDB')

//歌单模块： 获取歌单列表接口
router.get('/list', async (ctx, next) => {
    //从上下文获取请求参数
    const query = ctx.request.query
    //异步调用封装好的原函数调用功能，传递三个参数：上下文对象，云函数名称music
    //以及params参数对象（包含music云函数的具体url，当前页起始索引，每页记录数）
    const res = await callCloudFn(ctx, 'music', {
        $url: 'playlist',
        start: parseInt(query.start),
        count: parseInt(query.count),
    })
    let data = []
    //根据测试发现返回结果的数据在resp——data属性中（shiJSON字符串）
    if(res.resp_data) {
        //反序列化为JSON对象，取出data数据
        data = JSON.parse(res.resp_data).data
    }
    //想客户端返回结果
    ctx.body = {
        data, 
        code: 20000,
    }
})

//根据id查询歌单详情，通过封装的操作云数据库的函数实现，注意穿的id需是数据库唯一的_id
router.get('/detail', async (ctx, next) => {
    console.log(ctx.request.query.id)
    const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    ctx.body = {
        code: 20000,
        data: JSON.parse(res.data),
    }
})

// 更新歌单（名称和描述），传参为请求体json对象
router.post('/update', async(ctx, next) => {
    const params = ctx.request.body
    const query =  `db.collection('playlist').doc('${params._id}').update({
        data: {
            name:'${params.name}',
            description:'${params.description}'
        }
    })`
    const res = await callCloudDB(ctx, 'databaseupdate', query)
    ctx.body = {
        code: 20000,
        data: res
    }
})

//删除歌单
router.post('/delete', async (ctx, next) => {
    const params = ctx.request.query
    const query = `db.collection('playlist').doc('${params.id}').remove()`
    const res = await callCloudDB(ctx,'databasedelete', query)
    ctx.body = {
        code: 20000,
        data: res,
        
    }
})

module.exports = router