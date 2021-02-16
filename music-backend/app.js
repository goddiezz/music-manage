const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const koaBody = require('koa-body')

//全局中间件，ctx。body即向客户端的返回内容
app.use(async (ctx, next) => {
    console.log('全局中间件')
    // ctx.body = 'hello world'
    await next()
})

//通过require引入student模块
const student = require('./controller/student.js')

//给student模块使用定义跟路由为‘/student’
router.use('/student', student.routes())

//使用路由
app.use(router.routes())

//对3000接口开启监听，这是node。js的默认端口，如果已经占用，可以停止相应窗口或换端口
app.listen(3000, () => {
    console.log('服务器在3000端口开启')
})