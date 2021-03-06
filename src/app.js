import express from 'express';
import { engine } from 'express-handlebars';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
//import morgan from 'morgan';
import session from 'express-session';
import favicon from 'serve-favicon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public/images', 'logo.ico')));
//app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'keyboard cat',
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    },
    resave: true,
    saveUninitialized: true,
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.get('/', (req, res) => {
    // ERR_HTTP_HEADERS_SENT
    res.render('login', {
        title: 'Home',
        user: req.session.user
    });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const url = "https://viettel.vn/api/login-user-by-contract";

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account: username,
            password,
        })
    });

    const data = await response.json();
    if (data.errorCode === '0') {
        req.session.token = data.data.data.token;
        req.session.username = data.data.data.fullName;
        res.redirect('/dashboard');
    } else {
        res.redirect('/');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.token)
        res.render('dashboard.hbs', {
            success: true,
            title: 'Dashboard',
            user: true,
            message: '????ng nh???p th??nh c??ng'
        });
    else
        res.redirect('/');
});

app.post('/dashboard', async (req, res) => {
    if (req.session.token) {
        const token = req.session.token;
        const url = "https://viettel.vn/api/get-adsl-genenal-traffic";
        const date = req.body.date;
        let month = date.split('/')[0];
        if (month.length === 2) {
            month = month.substring(1);
        }
        const year = date.split('/')[2];
        const data = {
            token: token,
            month: month,
            year: year,
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch(url, options);
        const json = await response.json();
        // divide by 1024 to get GB
        if (json.errorCode === '0') {
            const data_traffic = json.data.trafficMonths.map(item => {
                return {
                    date: item.date,
                    upload: Number.parseFloat(item.upload / 1073741824).toFixed(2),
                    download: Number.parseFloat(item.download / 1073741824).toFixed(2),
                    totalUse: Number.parseFloat(item.totalUse / 1073741824).toFixed(2)
                }
            });
            res.json({
                success: true,
                data: data_traffic
            });
        } else {
            res.json({
                success: false,
                message: json.message
            });
        }
    } else {
        res.redirect('/');
    }
});

app.get("/signout", (req, res) => {
    req.session.destroy();
    res.render('login', {
        title: 'Home',
        user: false,
        message: '????ng xu???t th??nh c??ng',
        success: false
    });
});

app.listen(port, () => {
    console.log("Server is running on port " + port);
})