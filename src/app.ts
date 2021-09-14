import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Welcome to pointing poker API');
});
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});