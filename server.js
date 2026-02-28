const express = require('express') ;
const dotenv = require('dotenv') ;
const cookieParser = require('cookie-parser') ;
const mongoSanitize = require('@exortek/express-mongo-sanitize') ;
const helmet = require('helmet') ;
const {xss} =require('express-xss-sanitizer');
const cors = require('cors') ;
const rateLimit = require('express-rate-limit') ;
const hpp = require('hpp') ;

const swaggerJsDoc = require('swagger-jsdoc') ;
const swaggerUI = require('swagger-ui-express') ;

const connectDB = require('./config/db') ;
const campgrounds = require ('./routes/campgrounds') ;
const auth = require('./routes/auth') ;
const bookings = require('./routes/bookings') ;
//Load env vars
dotenv.config({path: './config/config.env'}) ;

connectDB() ;

const app=express() ;

app.set('query parser', 'extended') ;

app.use(express.json()) ;
app.use(cookieParser()) ;
app.use(cors()) ;
app.use(mongoSanitize()) ;
app.use(helmet()) ;
app.use(xss()) ;

const limiter= rateLimit({
    windowMs:10*60*1000,
    max : 100
}) ;

app.use(limiter) ;
app.use(hpp()) ;

app.use('/api/v1/campgrounds', campgrounds) ;
app.use('/api/v1/auth', auth) ;
app.use('/api/v1/bookings', bookings) ;

const swaggerOptions={
    swaggerDefinition:{
        openapi : '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis: ['./routes/*.js']
} ;

const swaggerDocs=swaggerJsDoc(swaggerOptions) ;
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs)) ;

const PORT=process.env.PORT || 5000 ;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT)) ;

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1)) ;
})