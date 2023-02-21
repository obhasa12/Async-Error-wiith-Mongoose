//express var
const express = require('express');
const app = express();
const path = require('path');

const methodOverride = require('method-override');
const AppError = require('./AppError');

//mongo var
const mongoose = require('mongoose');
const Product = require('./models/product');

//mongoose init
mongoose.connect('mongodb://127.0.0.1:27017/farmStand2')
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch((err) => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    });

//cof path
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))

const categories = ['fruit', 'vegetable', 'dairy'];
//route
app.get('/products',  async (req, res, next) => {
    try{
        const { category } = req.query;
        if(category){
            const products = await Product.find({category})
            res.render('products/index', { products, category })
        }else{
            const products = await Product.find({})
            res.render('products/index', { products, category: 'ALL' })
        }
    }catch(err){
        next(e)
    }
})

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories })
})

app.post('/products', async (req, res, next) => {
    try{
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect(`/products/${newProduct._id}`)
    } catch(err){
        next(err)
    }       
})  

app.get('/products/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const product = await Product.findById(id);
        if(!product){
            throw new AppError("Product Not Found", 404);
        }
        res.render('products/show', { product })
    }catch(err){
        next(err)
    }
})

app.get('/products/:id/edit', async (req, res, next) => {
    try{
        const { id } = req.params;
        const product = await Product.findById(id);
        if(!product){
            throw new AppError("Product Not Found", 404);
        }
        res.render('products/edit', { product, categories })
    }catch(err){
        next(err)
    }
})

app.put('/products/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        res.redirect(`/products/${ product._id }`)    
    }catch(err){
        next(err)
    }
})

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    res.status(status).send(message);
})

//cof port
app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})