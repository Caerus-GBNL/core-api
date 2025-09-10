/**
 * Supported API versions (path-based only: /v1/, /v2/)
 */
const SUPPORTED_VERSIONS = ['1', '2'];
const DEFAULT_VERSION = '1';
const LATEST_VERSION = '2';

/**
 * Get API version from URL path
 * @param {Object} req - Express request object
 * @returns {string} API version
 */
const getVersionFromPath = (req) => {
  // Check originalUrl first, then baseUrl, then url
  const fullPath = req.originalUrl || req.baseUrl || req.url || '';
  const pathVersion = fullPath.match(/\/v(\d+)(?:\/|$)/)?.[1];
  return pathVersion && SUPPORTED_VERSIONS.includes(pathVersion) ? pathVersion : DEFAULT_VERSION;
};

/**
 * Simple API versioning middleware (path-based only)
 * @returns {Function} Express middleware
 */
const apiVersioning = () => (req, res, next) => {
  const version = getVersionFromPath(req);

  // Set version info in request
  req.apiVersion = version;

  // Add version header to response
  res.set('X-API-Version', version);

  next();
};

module.exports = {
  apiVersioning,
  SUPPORTED_VERSIONS,
  DEFAULT_VERSION,
  LATEST_VERSION,
};
