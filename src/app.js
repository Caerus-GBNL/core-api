const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const routesV1 = require('./routes/v1');
const routesV2 = require('./routes/v2');
const { errorConverter, errorHandler } = require('./middlewares/error');
const correlationId = require('./middlewares/correlation-id');
const { apiVersioning } = require('./middlewares/api-versioning');
const ApiError = require('./utils/api-error');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// add correlation ID to all requests
app.use(correlationId);

// add API versioning support
app.use(apiVersioning());

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: config.request.sizeLimit }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: config.request.sizeLimit }));

// gzip compression
app.use(compression());

// enable cors
const corsOptions = {
  origin: config.cors.origins,
  credentials: config.cors.credentials,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/', express.static(path.join(__dirname, '..', 'public')));

// api routes
app.use(`/${config.service.name}`, routesV1);
app.use(`/${config.service.name}`, routesV2);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
