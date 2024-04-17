export default () => ({
  database: {
    connectionString: process.env.DB_CONNECTION_STRING,
  },
security:{
  jwtSecret: process.env.JWT_ACCESS_SECRET,
  accessTokenExpiry: 1,
  refreshTokenLength: 10,
  refreshTokenExpiry: 10

},

  port: process.env.PORT,
});
