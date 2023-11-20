const timer = async (req, res, next) => {
  const start = new Date().getTime();
  await next();
  console.log(`Use ${new Date().getTime() - start}ms`);
};

export default timer
