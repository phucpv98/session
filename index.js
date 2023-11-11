const express = require('express');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require("connect-redis").default;

const app = express();
const PORT = 5000;
const clientRedis = new Redis();

app.set('trust proxy', 1)   // trust first proxy

app.use(session({ 
    secret: 'keyboard abc',
    resave: false,
    saveUninitialized: true,        // sid
    cookie: {                       // cookie này là của hệ  thống tự sinh ra (generate "cookie")
        secure: false,              // https
        httpOnly: false,            // method HTTP
        maxAge: 5 * 60 * 1000
    },
    store: new RedisStore({client: clientRedis})        // xét nơi lưu trữ data session
}))

app.get('/set-session', (req, res) => {
    req.session.user = {                    // set session.user
        username: "Demo Session",
        age: 3,
        email: "demo-session@email.com"
    }

    res.send(req.session)
})

app.get('/get-session', (req, res) => {
    res.send(req.session)
})

app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
})

/**
 * resave: true - set thêm thời gian tồn tại cho 'cookie' - trong phạm vi request đến server mà thời gian cookie còn tồn tại.
 * saveUninitialized: true  - đánh dấu cookie theo tiêu chuẩn SID theo mặc định.    (hiển thị: connect.sid)
 * 
 * Dùng express-session cần lưu ý:
 *  - "Không được" thiết kế cho môi trường product - release product.
 *  - lưu session ở MemoryStore phia Server -> khi lượng data phình to dẫn đến chết và mất hết session.
 * 
 *  => Redis Store: được recomment (gợi ý) nên sử dụng trong môi trường Product.
 *      + Ưu điểm: không bị mất dữ liệu - giống khi lưu session ở MemoryStore     (khi restart lai server)
 * 
 * lib ioredis: đại diện cho Redis giao tiếp với NodeJS.
 * lib RedisStore: bên trung gian ??? - cung cấp các API -> giúp tăng khả năng tương tác.
 */
