const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const { notFoundHandler, errorHandler } = require("./middleware/globalErrorHandler");
const authMiddleware = require("./middleware/authMiddleware");

const sequelize = require("./utils/db");

const app = express();
const cors = require("cors");

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  credentials: true,
};

app.use(cors(corsOptions));

if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection established");
    })
    .catch((error) => {
      console.log(error);
    });
}

const authRoutes = require("./routes/auth.routes");
const pinRoutes = require("./routes/pin.routes");
const animeRoutes = require("./routes/anime.routes");
const statsRoutes = require("./routes/stats.routes");

app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/anime", animeRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
