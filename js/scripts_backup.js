/*!
* Start Bootstrap - Simple Sidebar v6.0.6 (https://startbootstrap.com/template/simple-sidebar)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-simple-sidebar/blob/master/LICENSE)
*/
// 
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});

async function checkBluetooth() {
    const idInput = document.getElementById('participantId').value.trim().toUpperCase();
    const targetName = `Verisense-01-22011801${idInput}`;
    const resultEl = document.getElementById('bt-result');

    let status = "No";
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: targetName }]
        });
        status = "Yes";
        resultEl.textContent = `✅ Device "${targetName}" is paired.`;
    } catch (error) {
        resultEl.textContent = `❌ Device not found or user cancelled.`;
    }

    // Fill hidden form fields
    document.getElementById('btId').value = idInput;
    document.getElementById('btStatus').value = status;
    document.getElementById('btDate').value = new Date().toISOString();
}
