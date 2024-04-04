// app.js
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./server/router/index");
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const YAML = require('js-yaml');

const fs = require('fs');


const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/userData")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
// app.use("/", userRouter);


// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'API for user registration, login, and profile management'
    },
    servers: [
      {
        url: 'http://localhost:3000' // Adjust the URL to match your server URL
      }
    ]
  },
  apis: ['./server/router/*.js'] // Adjust the path to match your router files
};

  
  // Initialize Swagger
  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  
  // Write Swagger YAML content to file
  fs.writeFileSync('swagger.yml', YAML.dump(swaggerSpec));

  // Initialize Swagger
// const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


