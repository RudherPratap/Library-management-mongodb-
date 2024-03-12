const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(express.static(__dirname));


mongoose.connect('mongodb://localhost:27017/library', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

const bookSchema = new mongoose.Schema({
  bookId: String,
  title: String,
  author: String,
  borrowed: Boolean
});

const Book = mongoose.model('Book', bookSchema);

app.post('/addBook', async (req, res) => {
  const { bookId, title, author } = req.body;

  try {
    const newBook = new Book({ bookId, title, author, borrowed: false });
    await newBook.save();
    console.log('Book added:', newBook);
    res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/searchBook/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const result = await Book.find({ title: { $regex: title, $options: 'i' } });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getBooks/:page', async (req, res) => {
  const page = req.params.page;
  const pageSize = 7;
  const skip = (page - 1) * pageSize;

  try {
    const books = await Book.find().skip(skip).limit(pageSize);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/updateBook/:id', async (req, res) => {
  const bookId = req.params.id;
  const { newTitle, newAuthor } = req.body;

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { title: newTitle, author: newAuthor },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/deleteBook/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(deletedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/toggleBorrow/:id', async (req, res) => {
  const bookId = req.params.id;
  const { borrowed } = req.body;

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { borrowed: !borrowed },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getBookCount', async (req, res) => {
  try {
    const count = await Book.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
