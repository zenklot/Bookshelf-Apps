window.onload = () => {
    connect_books_db()
    ValidationForm();
    if(!reading.checked){
        btnSave.innerText = W_BTN_SAVE_UNFINISH;
    }else{
        btnSave.innerText = W_BTN_SAVE_FINISH;
    }

    title_alert.style.display = 'none'
    author_alert.style.display = 'none'
    publish_alert.style.display = 'none'

    if(EDIT_MODE){
        ChangeDisplayStyle(btnCancleEdit, 'block')
    }else{
        ChangeDisplayStyle(btnCancleEdit, 'none')
    }
    
    GET_BOOKS();
    ChangeDisplayStyle(toast, 'none')
}

// Wording 
const W_BTN_SAVE_UNFINISH = "Masukan Buku Ke Rak Belum Selesai Dibaca";
const W_BTN_SAVE_FINISH = "Masukan Buku Ke Rak Selesai Dibaca";
const W_TITLE_REQUIRED = "Judul buku wajib diisi!";
const W_TITLE_MINLENGTH = "Judul buku minimal 3 karakter!";
const W_AUTHOR_REQUIRED = "Penulis buku wajib diisi!";
const W_AUTHOR_MINLENGTH = "Penulis buku minimal 2 karakter!";
const W_PUBLISH_REQUIRED = "Tahun buku wajib diisi!";
const W_PUBLISH_MINLENGTH = "Maukan Tahun buku yang benar!";
const W_PUBLISH_NUMBER_ONLY = "Maukan Tahun buku yang benar!";

// Variabel State
const GET_FINISHED_BOOKS_DATA = 'get_finished_books';
const GET_UNFINISHED_BOOKS_DATA = 'get_unfinished_books';
let EDIT_MODE = false;
let SEARCHING_MODE = false;
const readed = document.getElementById('readed-content');
const unreaded = document.getElementById('unreaded-content');
let readed_books = [];
let unreaded_books = [];
const books_form = document.getElementsByClassName('books')[0];
let START_TIME, END_TIME, DIFF_TIME;

// Variabel Input
const title = document.getElementById('judul_buku');
const author = document.getElementById('penulis_buku');
const publish = document.getElementById('tahun_buku');
const reading = document.getElementById('selesai_baca');
const search = document.getElementById('search_input');

// Variabel Alert
const title_alert = document.getElementById('judul_alert');
const author_alert = document.getElementById('penulis_alert');
const publish_alert = document.getElementById('tahun_alert');
const toast = document.getElementsByClassName('toast-info')[0];
const toast_title = document.getElementsByClassName('toast-title')[0];
const toast_description = document.getElementsByClassName('toast-description')[0];
const toast_icon = document.getElementsByClassName('toast-icon')[0];

// Variabel Btn
const btnSave = document.getElementById('btn-save');
const btnCancleEdit = document.getElementById('btn-reset');
const btnSearch = document.getElementsByClassName('search-btn')[0];

// Fungsi - Fungsi
function ChangeDisplayStyle(ids, display){
    ids.style.display = display;
}

function SetInnerText(ids, text){
    ids.innerText = text;
}

function AddRemoveClass(ids, classlist, type){
    if(type == 'add'){
        ids.classList.add(classlist)
    }else if(type == 'remove'){
        ids.classList.remove(classlist)
    }else{
        throw Error;
    }
}

function GetLength(ids){
    return ids.value.trim().length;
}

function ResetSearching(){
    SEARCHING_MODE = false;
    btnSearch.innerHTML = '&#128269; Cari...'
    GET_BOOKS();
    AddRemoveClass(btnSearch, 'searching', 'remove');
    search.value = '';
}

function StartTime() {
    START_TIME = new Date();
};
  
function EndTime() {
    END_TIME = new Date();
    let timeDiff = END_TIME - START_TIME;
    timeDiff /= 1000;
  
    let seconds = Math.round(timeDiff);
    DIFF_TIME = seconds + " detik";
}


function SetToast(icon, title, text){
    AddRemoveClass(toast, 'fadeIn', 'add');
    AddRemoveClass(toast_icon, icon, 'add');
    ChangeDisplayStyle(toast, 'flex');
    SetInnerText(toast_title, title);
    SetInnerText(toast_description, text);
    setTimeout(()=>{
        AddRemoveClass(toast, 'fadeIn', 'remove');
        AddRemoveClass(toast, 'fadeOut', 'add');
        setTimeout(()=>{
            AddRemoveClass(toast, 'fadeOut', 'remove');
            ChangeDisplayStyle(toast, 'none')
            AddRemoveClass(toast_icon, icon, 'remove');
            SetInnerText(toast_title, '');
            SetInnerText(toast_description, '');
        }, 1000)
    }, 2000)
}


function EmptyForm(){
    title.value = "";
    author.value = "";
    publish.value = "";
    reading.checked = false;
    // reading.dispatchEvent(new Event('change'));
}

function GET_BOOKS(type = ''){
    StartTime()
    connect_books_db('',type);
    document.dispatchEvent(new Event(GET_FINISHED_BOOKS_DATA));
    document.dispatchEvent(new Event(GET_UNFINISHED_BOOKS_DATA));
    EndTime()
}


function Searching(){
    
    SEARCHING_MODE = true;
    let books = select_book_by_title(search.value)
    save_new_book_db(books, 'searching')
    GET_BOOKS('searching')
    SetInnerText(btnSearch, 'Reset')
    AddRemoveClass(btnSearch, 'searching', 'add') 
    
}

// Fungsi Create Element
function CreateBook(book, type){
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');
    bookElement.setAttribute('draggable', true);
    bookElement.setAttribute('ondragstart', "drag(event)");
    bookElement.setAttribute('id', 'book-'+book.id)
    bookElement.setAttribute('ondragover', false)    
    bookElement.innerHTML = `<h1 class="book-title">${book.title}</h1>
    <p class="book-author">Penulis : ${book.author}</p>
    <p class="book-publish">Tahun : ${book.year}</p>
    <div class="book-status">
        <span class="book-badge-info">${book.isComplete ? 'Selesai Dibaca' : 'Belum Selesai'}</span>
        <div class="book-btn">
            <span class="book-badge-delete" onClick="deleteBook(${book.id}, ${book.isComplete})">Hapus Buku</span>
            <span class="book-badge-edit" onClick="editBook(${book.id})">Edit Buku</span>
        </div>
    </div>`;

    if(type == 'finish'){
        readed.append(bookElement)
    }else{
        unreaded.append(bookElement);
    }
}

function CreateSearchResult(book, type){
    const searchResult = document.createElement('div');
    searchResult.classList.add('search-result');
    searchResult.innerHTML = `<div class="search-result-content">
    <h3 class="search-result-title">Hasil Pencarian : ${search.value}</h3>
    <p class="search-result-description">${book.length ? 'Ditemukan ' + book.length + ' Buku dalam ' + DIFF_TIME : 'Buku tidak ditemukan'}</p>
    </div>
    <button class="search-result-btn-close" onClick="ResetSearching()">Reset </button>`

    if(type == 'finish'){
        readed.append(searchResult)
    }else{
        unreaded.append(searchResult);
    }
    
}




// Fungsi Model
function connect_books_db(type = '', db = ''){
    if(db == ''){
        readed_books = localStorage.getItem('READED_BOOKS_LIBRARY') ? JSON.parse(localStorage.getItem('READED_BOOKS_LIBRARY')) : [];
        unreaded_books = localStorage.getItem('UNREADED_BOOKS_LIBRARY') ? JSON.parse(localStorage.getItem('UNREADED_BOOKS_LIBRARY')) : [];
    }else if(db == 'searching'){
        readed_books = sessionStorage.getItem('READED_BOOKS_LIBRARY') ? JSON.parse(sessionStorage.getItem('READED_BOOKS_LIBRARY')) : [];
        unreaded_books = sessionStorage.getItem('UNREADED_BOOKS_LIBRARY') ? JSON.parse(sessionStorage.getItem('UNREADED_BOOKS_LIBRARY')) : [];
    }
    if(type && type == 'finish'){
        return readed_books
    }else if(type && type == 'unfinish'){
        return unreaded_books
    }
}

function save_book_db(books, type){
    if(type == 'finish'){
        localStorage.setItem('READED_BOOKS_LIBRARY', JSON.stringify(books));
    }else if(type == 'unfinish'){
        localStorage.setItem('UNREADED_BOOKS_LIBRARY', JSON.stringify(books));
    }
}

function set_edit_book_session(book){
    sessionStorage.setItem('EDITED_BOOK', JSON.stringify(book));
}

function get_edited_book_session(type = ''){
    let book = sessionStorage.getItem('EDITED_BOOK') ? JSON.parse(sessionStorage.getItem('EDITED_BOOK')) : false;
    if(book && type == ''){
        title.value = book.title;
        author.value = book.author;
        publish.value = book.year;
        reading.checked = book.isComplete;
        reading.dispatchEvent(new Event('change'));
    }
    return book;
}

function select_book_by_id(id){
    let books = connect_books_db('finish');
    books.push(...connect_books_db('unfinish'))

    let index = books.findIndex(book => {
        return book.id == id
    });

    return books[index];
}

function select_book_by_title(title){
    let books = connect_books_db('finish');
    books.push(...connect_books_db('unfinish'))

    let book = books.filter(book => {
        return book.title.toLowerCase().indexOf(title) !== -1
    })

    return book;
}

function update_book(id, payload){
    let books = connect_books_db('finish');
    books.push(...connect_books_db('unfinish'));
    let index = books.findIndex(book => {
        return book.id == id
    })
    books[index] = payload;
    save_new_book_db(books);
    GET_BOOKS()
}

function save_new_book_db(books, type = ''){

    let finishedBooks = books.filter(book => {
        return book.isComplete == true
    })

    let unfinishBooks = books.filter(book => {
        return book.isComplete == false
    })

    if(type == ''){
        save_book_db(finishedBooks, 'finish');
        save_book_db(unfinishBooks, 'unfinish');
    }else if(type == 'searching'){
        sessionStorage.setItem('READED_BOOKS_LIBRARY', JSON.stringify(finishedBooks));
        sessionStorage.setItem('UNREADED_BOOKS_LIBRARY', JSON.stringify(unfinishBooks));
    }

}


// Fungsi Validasi
function ValidationForm(){
    if(title.value.trim().length >= 3 && author.value.trim().length >= 2 && publish.value.trim().length == 4){
        // btnSave.setAttribute('disabled', false)
        return true
    }else{
        // btnSave.setAttribute('disabled', true)
        return false
    }
}

function ValidationInput(ids = ''){
    if(ids == ''){
        ids = ['title', 'author', 'publish'];
    }
    if(ids.includes('title')){
        if(GetLength(title) == 0){
            ChangeDisplayStyle(title_alert, 'block');
            SetInnerText(title_alert, W_TITLE_REQUIRED);
            AddRemoveClass(title, 'input-error', 'add');
        }else if(GetLength(title) > 0 && GetLength(title) < 3){
            ChangeDisplayStyle(title_alert, 'block');
            SetInnerText(title_alert, W_TITLE_MINLENGTH);
            AddRemoveClass(title, 'input-error', 'add');
        }else{
            AddRemoveClass(title, 'input-error', 'remove');
            ChangeDisplayStyle(title_alert, 'none');
        }
    }

    if(ids.includes('author')){
        if(GetLength(author) == 0){
            ChangeDisplayStyle(author_alert, 'block');
            SetInnerText(author_alert, W_AUTHOR_REQUIRED);
            AddRemoveClass(author, 'input-error', 'add')
        }else if(GetLength(author) > 0 && GetLength(author) < 2){
            ChangeDisplayStyle(author_alert, 'block');
            SetInnerText(author_alert, W_AUTHOR_MINLENGTH);
            AddRemoveClass(author, 'input-error', 'add')
        }else{
            ChangeDisplayStyle(author_alert, 'none');
            AddRemoveClass(author, 'input-error','remove');
        }
    }

    if(ids.includes('publish')){
        if(GetLength(publish) == 0){
            ChangeDisplayStyle(publish_alert, 'block');
            SetInnerText(publish_alert, W_PUBLISH_REQUIRED);
            AddRemoveClass(publish, 'input-error', 'add')
        }else if(GetLength(publish) > 0 && GetLength(publish) < 4){
            ChangeDisplayStyle(publish_alert, 'block');
            SetInnerText(publish_alert, W_PUBLISH_MINLENGTH);
            AddRemoveClass(publish, 'input-error', 'add')
        }else if(!(parseInt(publish.value) >= 1800 && parseInt(publish.value) <= new Date().getFullYear())){
            ChangeDisplayStyle(publish_alert, 'block');
            SetInnerText(publish_alert, W_PUBLISH_NUMBER_ONLY);
            AddRemoveClass(publish, 'input-error', 'add')
        }else{
            ChangeDisplayStyle(publish_alert, 'none');
            AddRemoveClass(publish, 'input-error','remove');
        }
    }
}



// Fungsi CRUD
function SaveBook(){
    if(SEARCHING_MODE){
        ResetSearching()
    }
    if(ValidationForm() && !EDIT_MODE){
        let book = {
            id : Date.now(),
            title : title.value,
            author : author.value,
            year: publish.value,
            isComplete: reading.checked,
        }
        if(reading.checked){
            let books = connect_books_db('finish');
            books.push(book);
            save_book_db(books, 'finish');
            CreateBook(book, 'finish');
        }else{
            let books = connect_books_db('unfinish');
            books.push(book);
            save_book_db(books, 'unfinish');
            CreateBook(book, 'unfinish');
        }
        EmptyForm();
        SetToast('success', 'Berhasil', 'Buku Berhasil Disimpan!')
    }else if(ValidationForm() && EDIT_MODE){
        let id = get_edited_book_session('data').id 
        let book = {
            id,
            title : title.value,
            author : author.value,
            year: publish.value,
            isComplete: reading.checked,    
        }

        update_book(id, book);
        EmptyForm()
        SetInnerText(btnSave, W_BTN_SAVE_UNFINISH);
        AddRemoveClass(books_form, 'edited', 'remove')
        EDIT_MODE = false
        ChangeDisplayStyle(btnCancleEdit, 'none')
        SetToast('success', 'Berhasil', 'Buku Berhasil Diperbarui!')
    }else{
        ValidationInput()
        SetToast('error', 'Error', 'Silahkan Input Buku yang benar!')
    }
    
}


function deleteBook(id, isComplete){
    if(!EDIT_MODE){
        if(isComplete){
            let books = connect_books_db('finish')
            books = books.filter(book => {
                return book.id != id
            })
            save_book_db(books, 'finish')
            GET_BOOKS()   
        }else{
            let books = connect_books_db('unfinish')
            books = books.filter(book => {
                return book.id != id
            })
            save_book_db(books, 'unfinish')
            GET_BOOKS()   
        }

    }else{
        SetToast('error', 'Error', 'Tidak bisa menghapus buku kertika dalam mode Edit')
    }
}

function editBook(id){
    let book = select_book_by_id(id)
    set_edit_book_session(book);
    AddRemoveClass(books_form, 'edited', 'add');
    EDIT_MODE = true;
    ChangeDisplayStyle(btnCancleEdit, 'block');
    SetInnerText(btnSave, 'Update Buku');
    get_edited_book_session();
    if(window.screen.width <= 1024){
        console.log('kurang')
        window.scrollTo(0,0)
    }
}

function cancelEditBook(){
    ChangeDisplayStyle(btnCancleEdit, 'none');
    SetInnerText(btnSave, W_BTN_SAVE_UNFINISH);
    AddRemoveClass(books_form, 'edited', 'remove');
    EDIT_MODE = false;


}




function allowDrop(event) {
    event.preventDefault();
  }
  
  function drag(event) {
    event.dataTransfer.setData("id", event.target.id);
    AddRemoveClass(readed, 'drop-here', 'add')
    AddRemoveClass(unreaded, 'drop-here', 'add')
  }
  
  function drop(event) {
    event.preventDefault();
    let books = connect_books_db('finish');
    books.push(...connect_books_db('unfinish'));

    let id = event.dataTransfer.getData("id");
    if(event.target.id == 'readed-content' || event.target.id == 'unreaded-content'){
        event.target.appendChild(document.getElementById(id));
    }

    
    let id_book = id.replace('book-','');
    let index = books.findIndex(book => {
        return book.id == id_book
    })

    let updated_book = books[index]
    if(event.target.id == 'readed-content'){
        updated_book.isComplete = true
    }
    if(event.target.id == 'unreaded-content'){
        updated_book.isComplete = false
    }
    
    books[index] = updated_book
    save_new_book_db(books)
    ResetSearching()
    AddRemoveClass(readed, 'drop-here', 'remove')
    AddRemoveClass(unreaded, 'drop-here', 'remove')
    GET_BOOKS()
    
  }



// Event Listener

title.addEventListener('input', (event) => {
    ValidationForm()
    ValidationInput('title')
})

author.addEventListener('input', (event) => {
    ValidationForm()
    ValidationInput('author')
})

publish.addEventListener('input', (event) => {
    ValidationForm()
    ValidationInput('publish')
})

reading.addEventListener('change', (event) => {
    ValidationForm()
    ValidationInput()
    if(!EDIT_MODE){
        if(reading.checked){
            btnSave.innerText = W_BTN_SAVE_FINISH
        }else{
            btnSave.innerText = W_BTN_SAVE_UNFINISH
        }
    }
})


btnSave.addEventListener('click', (event) =>{
    event.preventDefault();
    SaveBook();
    
})


document.addEventListener(GET_FINISHED_BOOKS_DATA, () =>{
    readed.innerHTML = '';
    if(SEARCHING_MODE){
        CreateSearchResult(readed_books, 'finish');
    }

    for (const book of readed_books) {
        CreateBook(book, 'finish')
    }
});

document.addEventListener(GET_UNFINISHED_BOOKS_DATA, () =>{
    unreaded.innerHTML = '';
    if(SEARCHING_MODE){
        CreateSearchResult(unreaded_books, 'unfinish');
    }
    for (const book of unreaded_books) {
        CreateBook(book, 'unfinish')
    }
});


btnCancleEdit.addEventListener('click', (event) => {
    cancelEditBook()
    SetToast('info', 'Info', 'Batal Mengedit!')
})

btnSearch.addEventListener('click', (event) => {
    if(event.target.innerText == 'Reset'){
        ResetSearching();
        return;
    }
    if(search.value.trim().length > 2){
       Searching();       
    }
    
    
})

search.addEventListener('input', (event) => {
    if(event.target.value == ''){
        ResetSearching();
    }
})


search.addEventListener('keydown', (event) => {
    if(event.code == 'Enter' && search.value.trim().length > 2){
        Searching()
    }
})