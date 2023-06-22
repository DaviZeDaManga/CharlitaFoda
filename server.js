const express = require("express")
const app = express()
const http = require("http").createServer(app)
const bcrypt = require("bcrypt")
const UserModel = require("./src/models/user.model")
const MessageModel = require("./src/models/message.model")
const MongoStore = require("connect-mongo")
const session = require("express-session")
const io = require("socket.io")(http, {
    cors: `${process.env.BASE_URL}:${process.env.PORT}`
})
const port = process.env.PORT

app.set('view engine', 'ejs')
app.set('views', 'src/views')

const sessionMiddleware = session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionID',
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    })
})

app.use(express.static("src/views"))
app.use(express.urlencoded({extended: false}))
app.use(sessionMiddleware)


// CHAT


io.use((socket, next) => sessionMiddleware(socket.request, {}, next))
io.on('connect', async socket => {
    if (!socket.request.session.userID) return socket.emit('message', {author: 'ADMIN', message: 'VOCÊ NÃO TEM UMA CONTA'})
    const previewMessages = await MessageModel.find({})
    socket.emit('previewMessages', previewMessages)
    socket.on('message', async message => {
        const user = await UserModel.findById(socket.request.session.userID)
        io.emit('message', {author: user.username, message: message.message})
        await MessageModel.create({author: user.username, message: message.message})
    })
})


// GET ROUTES


app.get('/', (req, res) => res.redirect('/pagehome%20CN'))
app.get('/pagehome%20CN', (req, res) => res.render('pages/pagehome CN/index'))
app.get('/Login%20CN/Entrar%20CN', (req, res) => res.render('pages/Login CN/Entrar CN/index'))
app.get('/Login%20CN/cadastro%20CN', (req, res) => res.render('pages/Login CN/cadastro CN/index'))
app.get('/FeedTV', (req, res) => res.render('pages/FeedTV/index'))
app.get('/FeedJogar', (req, res) => res.render('pages/FeedJogar/index'))
app.get('/FeedEsportes', (req, res) => res.render('pages/FeedEsportes/index'))
app.get('/FeedEsportes/Noticias-Esportes/FutCasaDeApostas-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/FutCasaDeApostas-Esporte/index'))
app.get('/FeedEsportes/Noticias-Esportes/FutCasosEmblematicos-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/FutCasosEmblematicos-Esporte/index'))
app.get('/FeedEsportes/Noticias-Esportes/FutCasosEmblematicosInter-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/FutCasosEmblematicosInter-Esporte/index'))
app.get('/FeedEsportes/Noticias-Esportes/JiuJitsu-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/JiuJitsu-Esporte/index'))
app.get('/FeedEsportes/Noticias-Esportes/JiuJitsuMundo-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/JiuJitsuMundo-Esporte/index'))
app.get('/FeedEsportes/Noticias-Esportes/Noticia1-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/Noticia1-Esporte/index'))
app.get('/FeedEsportes/Noticias-Esportes/VoleiEscolas-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/VoleiEscolas-Esporte/index'))
app.get('/FeedEsportes/Noticias-Esportes/VoleiLigaNacoes-Esporte', (req, res) => res.render('pages/FeedEsportes/Noticias-Esportes/VoleiLigaNacoes-Esporte/index'))
app.get('/FeedEconomia', (req, res) => res.render('pages/FeedEconomia/index'))
app.get('/FeedDiversos', (req, res) => res.render('pages/FeedDiversos/index'))
app.get('/FeedCultura', (req, res) => res.render('pages/FeedCultura/index'))


// POST ROUTES


app.post('/register', async (req, res) => {
    // VERIFICAR SE USUÁRIO JÁ EXISTE
    if (await UserModel.findOne({username: req.body.nome})) return res.redirect('/Login%20CN/cadastro%20CN')
    const username = req.body.nome
    const birthday = req.body.data_nascimento.split('-')
    const age = new Date().getFullYear() - new Date(birthday[0], birthday[1], birthday[2]).getFullYear()
    const password = await bcrypt.hash(req.body.senha, 10)
    await UserModel.create({username: username, age: age, password: password})
    res.redirect('/Login%20CN/Entrar%20CN')
})

app.post('/login', async (req, res) => {
    const user = await UserModel.findOne({username: req.body.nome})
    if (await bcrypt.compare(req.body.senha, user.password)) {
        req.session.regenerate(err => {
            if (err) console.log(err)
            req.session.userID = user._id
            res.redirect('/')
        })
    }
    else res.redirect('/Login%20CN/Entrar%20CN')
})

http.listen(port, '0.0.0.0', () => console.log('Server running in port '+port))
