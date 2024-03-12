document.addEventListener('DOMContentLoaded', function () {
  const addBookButton = document.getElementById('add_book');
  const updateBookButton = document.getElementById('update-book');
  const searchBookButton = document.getElementById('search_book');
  const bookList = document.getElementById('book_list');
  const pagination = document.getElementById('pagination');

  let currentPage = 1;

  addBookButton.addEventListener('click', async function () {
    const bookId = document.getElementById('book_id').value;
    const title = document.getElementById('book_title').value;
    const author = document.getElementById('book_author').value;

    try {
      const response = await fetch('/addBook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId, title, author }),
      });

      const data = await response.json();
      console.log('Book added:', data);

      displayBooks(currentPage);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  });

  searchBookButton.addEventListener('click', async function () {
    const title = document.getElementById('searchbook').value;

    try {
      const response = await fetch(`/searchBook/${title}`);
      const data = await response.json();

      displaySearchResult(data);
    } catch (error) {
      console.error('Error searching for book:', error);
    }
  });

  updateBookButton.addEventListener('click', async function () {
    const bookId = document.getElementById('update_book_id').value;
    const newTitle = document.getElementById('new_book_title').value;
    const newAuthor = document.getElementById('new_book_author').value;

    try {
      const response = await fetch(`/updateBook/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newTitle, newAuthor }),
      });

      const data = await response.json();
      console.log('Book updated:', data);

      displayBooks(currentPage);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  });

  async function displayBooks(page) {
    try {
      const response = await fetch(`/getBooks/${page}`);
      const data = await response.json();

      const bookList = document.getElementById('book_list');
      bookList.innerHTML = '';

      data.forEach(book => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${book.title} by ${book.author} 
          <button onclick="deleteBook('${book._id}')">Delete</button>
          <button onclick="updateBook('${book._id}', '${book.title}', '${book.author}')">Update</button>
          <button onclick="toggleBorrow('${book._id}', ${book.borrowed})">${book.borrowed ? 'Return' : 'Borrow'}</button>`;
        bookList.appendChild(listItem);
      });
      updatePagination();
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }

  function displaySearchResult(results) {
    const resultContainer = document.getElementById('book_result');
    resultContainer.innerHTML = '';

    results.forEach(result => {
      const listItem = document.createElement('li');
      listItem.textContent = `${result.title} by ${result.author}`;
      resultContainer.appendChild(listItem);
    });
  }

  async function deleteBook(bookId) {
    try {
      const response = await fetch(`/deleteBook/${bookId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('Book deleted:', data);

      displayBooks(currentPage);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }

  async function toggleBorrow(bookId, borrowed) {
    try {
      const response = await fetch(`/toggleBorrow/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ borrowed: !borrowed }),
      });

      const data = await response.json();
      console.log('Borrow status updated:', data);

      displayBooks(currentPage);
    } catch (error) {
      console.error('Error toggling borrow status:', error);
    }
  }

  async function updatePagination() {
    try {
      const response = await fetch('/getBookCount');
      const data = await response.json();

      const totalPages = Math.ceil(data.count / 7);

      const paginationContainer = document.getElementById('pagination');
      paginationContainer.innerHTML = '';

      for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', function () {
          currentPage = i;
          displayBooks(currentPage);
        });

        paginationContainer.appendChild(pageButton);
      }
    } catch (error) {
      console.error('Error updating pagination:', error);
    }
  }
});