import express from 'express';
import { engine } from 'express-handlebars';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.render('index.hbs');
});

app.post('/login', (req, res) => {
    // const { username, password } = req.body;
    // console.log(username, password);
    console.log(req.body);
});
app.get('/api', async (req, res) => {
    const token = "2B839E43-39F5-433D-4989-750312612B6C-d2ViX2IwNjJfZ2Z0dGhfY3VvbmdueDg=";
    const url = "https://viettel.vn/api/get-adsl-genenal-traffic";
    const data = {
        token: token,
        month: 1,
        year: 2022,
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
    res.send(json);
});

app.listen(port, () => {
    console.log("Server is running on port " + port);
})