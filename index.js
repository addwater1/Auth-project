let express = require('express')
let nodemailer = require('nodemailer')
require('./config/db').connect()
let cors = require('cors')
let bcrypt = require('bcryptjs')
let jwt = require('jsonwebtoken')
const User = require('./model/user')

const app = express()
const port = 8000
const secretKey = "123456"

//Email host info
const transporter = nodemailer.createTransport({
    service: '163',
    auth: {
        user: '18758564387@163.com',
        pass: 'JDPDGZECFINHHXMZ'
    }
})

app.use(express.json())
app.use(cors({
    origin: '*'
}))

app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>')
})

app.post('/register', async (req, res) => {
    //code
    try {
        const { name, email, password } = req.body
        if (!(name && password && email)) {
            return res.status(400).send('All input is required')
        }
        const oldUser = await User.findOne({ email })
        if (oldUser) {
            return res.status(409).send('User already exists')
        }
        salt = await bcrypt.genSalt()
        encryptedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            name,
            email,
            password: encryptedPassword
        })
        res.status(201).json(user)
    } catch (err) {
        console.log(err)
    }
})

app.post('/login', async (req, res) => {
    //code
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(400).send("All input is required");
        }
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            return res.status(200).json(user);
        } else {
            return res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.log(err);
    }
})

app.post('/sentEmail', (req, res) => {
    //code
    let email = req.body.email
    let code = Math.random().toString().slice(-6)

    //Produce a token
    let token = jwt.sign({
        code
    }, secretKey, {
        expiresIn: "10m"
    })

    let mailOptions = {
        subject: "邮箱验证",
        text: `您的邮箱验证码是：${code}，有效时间10分钟，请勿泄漏给他人。`,
        to: email,
        from: "18758564387@163.com"
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.status(400).send("发送失败")
        } else {
            res.status(200).send({
                status: "success",
                token: token
            })
        }
    })
})

app.post('/checkEmail', (req, res) => {
    //code
    let token = req.body.token
    try {
        decoded = jwt.verify(token, secretKey)
    } catch (err) {
        return res.status(400).send('验证码过期')
    }
    let code = decoded.code
    let inputCode = req.body.code
    if (code === inputCode) {
        res.status(200).send('success')
    }
    else {
        res.status(400).send('验证码错误')
    }
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})