// Import stylesheets
// import './style.css';

// Write Javascript code!
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const searchBook = document.getElementById('searchBook');
  searchBook.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });
});

function searchBooks() {
  const searchTerm = document
    .getElementById('searchBookTitle')
    .value.toLowerCase();
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm)
  );

  const uncompletedBookList = document.getElementById(
    'incompleteBookshelfList'
  );
  const completedBookList = document.getElementById('completeBookshelfList');

  uncompletedBookList.innerHTML = '';
  completedBookList.innerHTML = '';

  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
}

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;
  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    bookTitle,
    bookAuthor,
    bookYear,
    isCompleted
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const actionDiv = document.createElement('div');
  actionDiv.classList.add('action');

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(textContainer, actionDiv);
  container.setAttribute('id', `book-${bookObject.id}`);

  const trashButton = document.createElement('button');
  trashButton.classList.add('red');
  trashButton.innerText = 'Hapus Buku';
  trashButton.setAttribute('id', `trashButton-${bookObject.id}`);

  trashButton.addEventListener('click', function () {
    removeTaskFromCompleted(bookObject.id);
  });

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('green');
    undoButton.innerText = 'Belum Selesai Dibaca';
    undoButton.setAttribute('id', `undoButton-${bookObject.id}`);

    undoButton.addEventListener('click', function () {
      moveBookToUncompleted(bookObject.id);
    });

    actionDiv.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('green');
    checkButton.innerText = 'Selesai dibaca';

    checkButton.addEventListener('click', function () {
      moveBookToCompleted(bookObject.id);
    });

    actionDiv.append(checkButton, trashButton);
  }

  return container;
}
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById(
    'incompleteBookshelfList'
  );
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completeBookshelfList');
  completedBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function addBookToCompleted(bookId) {
  moveBookToCompleted(bookId);
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(bookId) {
  const bookTargetIndex = findBookIndex(bookId);

  if (bookTargetIndex === -1) return;

  books.splice(bookTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  moveBookToCompleted(bookId);
  saveData();
}

function findBookIndex(bookId) {
  for (let index = 0; index < books.length; index++) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function moveBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null || bookTarget.isCompleted) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function moveBookToUncompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null || !bookTarget.isCompleted) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  const toastMessage = document.createElement('div');
  toastMessage.classList.add('toast-message');
  toastMessage.innerText = 'Data buku berhasil disimpan!';

  document.body.appendChild(toastMessage);

  setTimeout(() => {
    toastMessage.remove();
  }, 3000); //hapus pesan after 3 sec
});
