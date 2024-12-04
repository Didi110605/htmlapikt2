let latitude, longitude;

document.getElementById('getLocation').onclick = function() {
    navigator.geolocation.getCurrentPosition(position => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        document.getElementById('locationInfo').innerText = `Широта: ${latitude}, Долгота: ${longitude}`;
    });
};

document.getElementById('commentForm').onsubmit = function(event) {
    event.preventDefault();
    const comment = document.getElementById('comment').value;
    const location = { latitude, longitude };
    const data = { comment, location };

    // Сохранение в LocalStorage
    localStorage.setItem(Date.now(), JSON.stringify(data));
    displayComments();
    addCommentToIndexedDB(data);
    document.getElementById('comment').value = '';
};

function displayComments() {
    const list = document.getElementById('commentList');
    list.innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
        const item = JSON.parse(localStorage.getItem(localStorage.key(i)));
        list.innerHTML += `<li>${item.comment} (Широта: ${item.location.latitude}, Долгота: ${item.location.longitude})</li>`;
    }
}

document.getElementById('viewIndexedDB').onclick = function() {
    displayCommentsIndexedDB();
};

function displayCommentsIndexedDB() {
    const request = indexedDB.open('commentsDB', 1);
    request.onsuccess = event => {
        const db = event.target.result;
        const transaction = db.transaction('comments', 'readonly');
        const store = transaction.objectStore('comments');

        store.getAll().onsuccess = event => {
            const indexedDBList = document.getElementById('indexedDBList');
            indexedDBList.innerHTML = '';
            event.target.result.forEach(comment => {
                indexedDBList.innerHTML += `<li>${comment.comment} (Широта: ${comment.location.latitude}, Долгота: ${comment.location.longitude})</li>`;
            });
        };
    };
}

function addCommentToIndexedDB(data) {
    const request = indexedDB.open('commentsDB', 1);
    request.onsuccess = event => {
        const db = event.target.result;
        const transaction = db.transaction('comments', 'readwrite');
        const store = transaction.objectStore('comments');
        store.add({ id: Date.now(), ...data });
    };
}

// Инициализация отображения комментариев LocalStorage при загрузке страницы
window.onload = displayComments;

