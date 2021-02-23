const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
const koaBody = require('koa-body')
const ENV = 'porice-5gymfr7u94e3079c'
//跨域
app.use(
    cors({
        origin: ['http://localhost:9528'],
        credentials: true,
    })
)
//接收post参数解析
app.use(
    koaBody({
        multipart: true,
    })
)

//全局中间件，ctx。body即向客户端的返回内容
app.use(async (ctx, next) => {
    ctx.state.env = ENV
    // ctx.body = 'hello world'
    await next()
})

//通过require引入student模块
const playlist = require('./controller/playlist.js')
const swiper = require('./controller/swiper.js')
const blog = require('./controller/blog.js')

//给student模块使用定义跟路由为‘/student’
router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog', blog.routes())

//使用路由
app.use(router.routes())
app.use(router.allowedMethods())

//对3000接口开启监听，这是node。js的默认端口，如果已经占用，可以停止相应窗口或换端口
app.listen(3000, () => {
    console.log('服务器在3000端口开启')
})