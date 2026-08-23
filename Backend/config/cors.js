const environment = require("./environment");

const allowedOrigins = [
  environment.frontendUrl,
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, false);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS policy blocked this origin: ${origin}`)
    );
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],

  exposedHeaders: [
    "Content-Length",
  ],

  credentials: true,

  optionsSuccessStatus: 204,

  maxAge: 86400,
};

module.exports = corsOptions;