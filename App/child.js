const { ipcRenderer } = require('electron');

function startClient() {
    ipcRenderer.send('start-client');
}

function stopClient() {
    ipcRenderer.send('stop-client');
}

document.addEventListener("DOMContentLoaded", function() {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".navbar a");

    navLinks.forEach(link => {
        if (link.href.includes(currentPage)) {
            link.classList.add("active");
        }
    });
});

document.getElementById("copyButton").addEventListener("click", function() {
    let textArea = document.createElement("textarea");
    textArea.value = 'http://webvr-bmstu.ru';

    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';

    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand('copy');

    document.body.removeChild(textArea);
});


document.getElementById("copyButton").addEventListener("click", function() {
    this.classList.add("clicked");
    setTimeout(() => {
        this.classList.remove("clicked");
    }, 400);
});

document.getElementById("menu").innerHTML='<object type="text/html" data="menu.html"></object>';