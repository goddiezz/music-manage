const Router = require('koa-router')
const router = new Router()
router.get('/list',async (ctx, next) => {
    let data = [
    {
        name: '张仨',
        age: 19,
    },
    {
        name: '张三丰',
        age: 20,
    },
    {
        name: '李四',
        age: 21,
    },
    ]
    ctx.body = {
        data,
        code: 200000,
    }
})

module.exports = router