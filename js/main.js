var AUTH_DOMAIN
if (window.location.hostname == "poolparty.jupeters.de") {
    AUTH_DOMAIN = "https://jpCore.logge.top"
} else {
    AUTH_DOMAIN = 'http://' + window.location.hostname + ':3000'
}

var BASE_ENDPOINT_URL = AUTH_DOMAIN + "/api/"

function jsonToQS(json) {
    var qs = []
    for (element in json) {
        qs.push(element + "=" + json[element])
    }
    return "?" + qs.join("&")
}

// Populate Select with items
function fillSelect(elements) {
    var input = document.getElementById('mitbringenInput')
    if (!input) return
    for (i = 0; i < elements.length; i++) {
        if (!elements[i]) continue
        var option = document.createElement('option')
        option.setAttribute('value', elements[i]._id)
        option.innerText = elements[i].name
        input.append(option)
    }
}

let itemNames = {}
let userNames = {}

var token = localStorage.getItem('token')
var email, name
if (token && !document.querySelector('a[name="danke"]')) {
    try {
        ; (async () => {
            const { id, email, name, roles } = JSON.parse(atob(token.split('.')[1]))

            if (!id || !email || !name) {
                localStorage.removeItem('token')
                alert("Altes Token Format. Bitte neu anmelden!")
                window.reload(true)
            }

            document.getElementById('personName').innerText = 'Eingeloggt als ' + name + ' (' + email + ').'

            document.body.classList.add('signedIn')
            if (roles == "admin") {
                document.body.classList.add('admin')
            }

            const response = await fetch(BASE_ENDPOINT_URL + 'private/poolparty/me', {
                method: 'get',
                headers: new Headers({
                    'Authorization': token,
                })
            })
            const data = await response.json()

            const { item, registration, volunteer } = data

            if (registration && item) {

                document.getElementById('volunteerForm').style.display = ''

                async function unregister() {
                    const unregisterResp = await fetch(BASE_ENDPOINT_URL + 'private/poolparty/registration', {
                        method: 'DELETE',
                        headers: new Headers({
                            'Authorization': token,
                        })
                    })
                    const success = await unregisterResp.json()
                    if (success) {
                        alert("Dein Registrierungsstatus wurde erfolgreich gelöscht.")
                        location.reload(true)
                    }
                }

                var anmeldenForm = document.getElementById('anmeldenForm')
                anmeldenForm.innerHTML = '<div class="alert alert-success">Du hast dich am ' + new Date(registration.lastActivity).toLocaleDateString() + ' mit ' + registration.people + ' Person' + (registration.people > 0 ? 'en' : '') + ' angemeldet. Du bringst "' + item.name + '" mit. </ br > </div > '
                var abmeldenButon = document.createElement('button')
                abmeldenButon.innerText = 'Abmelden'
                abmeldenButon.className = 'btn-warning row'
                abmeldenButon.onclick = () => {
                    abmeldenButon.className = 'btn-danger row'
                    abmeldenButon.innerText = 'Sicher?'
                    abmeldenButon.onclick = () => unregister()
                }
                anmeldenForm.append(abmeldenButon)


                if (volunteer) {

                    async function volunteerAbmelden() {

                        const volunteerResp = await fetch(BASE_ENDPOINT_URL + 'private/poolparty/volunteer', {
                            method: 'DELETE',
                            headers: new Headers({
                                'Authorization': token,
                            }),
                        })
                        const success = await volunteerResp.json()
                        if (success) {
                            alert("Dein Registrierungsstatus wurde erfolgreich gelöscht.")
                            location.reload(true)
                        }
                    }

                    var volunteerForm = document.getElementById('volunteerForm')
                    volunteerForm.innerHTML = '<div class="alert alert-success">Du hast dich am ' + new Date(volunteer.lastActivity).toLocaleDateString() + ' mit einer Dauer von "' + volunteer.duration + '" angemeldet.</ br > </div > '
                    var button = document.createElement('button')
                    button.innerText = 'Abmelden'
                    button.className = 'btn-warning row'
                    button.onclick = () => {
                        button.className = 'btn-danger row'
                        button.innerText = 'Sicher?'
                        button.onclick = () => volunteerAbmelden()
                    }
                    volunteerForm.append(button)
                } else {

                    document.getElementById('submitVolunteer').onclick = () => {
                        var duration = document.getElementById('durationInput').value
                        if (duration.length < 3 || duration.length > 512) return document.getElementById('durationInput').classList.add('invalid')
                        else document.getElementById('durationInput').classList.remove('invalid')

                        sendHandler({
                            path: 'private/poolparty/volunteer',
                            method: 'POST',
                            data: { duration }
                        })
                    }

                }

            } else {

                const itemInput = document.getElementById('itemInput')

                const response = await fetch(BASE_ENDPOINT_URL + 'private/poolparty/item', {
                    method: 'get',
                    headers: new Headers({
                        'Authorization': token,
                    })
                })

                const items = await response.json()

                for (let i = 0; i < items.length; i++) {
                    const item = items[i]
                    const opt = document.createElement("option");
                    opt.value = item.id;
                    opt.innerHTML = item.name; // whatever property it has
                    itemInput.appendChild(opt);
                }

                document.getElementById('submitRegistration').onclick = () => {
                    const itemID = itemInput.value
                    const people = Number(document.getElementById('peopleInput').value)
                    const music = document.getElementById('musicInput').value

                    if (!Number(itemID)) return itemInput.classList.add('invalid')
                    itemInput.classList.remove('invalid')
                    if (!people) return document.getElementById('peopleInput').classList.add('invalid')
                    if (people < 1 || people > 2) return document.getElementById('peopleInput').classList.add('invalid')
                    document.getElementById('peopleInput').classList.remove('invalid')

                    sendHandler({
                        path: 'private/poolparty/registration',
                        method: 'POST',
                        data: { people, itemID, music }
                    })
                }

            }
        })()
        // End of async block

    } catch (e) {
        alert('Etwas ist schief gelaufen...')
        console.error(e)
    }
}

var isDark = localStorage.getItem('dark')
function toggleDark() {
    document.body.classList.toggle('darkmode')
    isDark = !isDark
    localStorage.setItem('dark', isDark)
    console.log(isDark)
}

if (isDark == 'true') {
    toggleDark()
}

isDark = !isDark

function createPhotos(year, count) {
    var photos = document.getElementById('photos' + year)
    let photosString = ''
    for (i = 1; i <= count; i++) {

        photosString += `
        <a data-fslightbox="gallery${year}" href="img/${year}/full/img${i}.jpg">
            <img src="img/${year}/thumb/img${i}.${imgType}" class="thumb" type="image/${imgType}" alt="Img${i}" onload='thumbnailHandler(this)'>
        </a>
        `
    }
    photos.innerHTML = photosString
}

function thumbnailHandler(elem) {
    if (elem.src.includes('/thumb/')) {
        const width = elem.width * window.devicePixelRatio || 1
        let size = 'large'
        if (width > 600) {
            size = 'large'
        } else if (width > 400) {
            size = 'medium'
        } else {
            size = 'small'
        }
        elem.setAttribute('src', elem.src.replace('thumb', size))
    } else {
        elem.classList.remove('thumb')
    }
}

function cloudAuth() {
    window.location = AUTH_DOMAIN + '/login.html'
}

let imgType = 'jpg'
window.onload = function () {
    const webP = new Image();
    webP.onload = webP.onerror = function () {
        imgType = webP.height == 2 ? 'webp' : 'jpg'
        createPhotos(2021, 18)
        createPhotos(2020, 25)
        createPhotos(2019, 18)
        createPhotos(2018, 7)
        refreshFsLightbox()
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
}

var submitData

function sendHandler(data) {
    submitData = data

    var str = ""
    for (key in submitData.data) {
        str += key + ': ' + submitData.data[key] + '\n'
    }
    document.getElementById('confirmationData').innerText = str
    showModal(data)
}

var modalState = document.getElementById('confirmModal')
var closeTimer

modalState.addEventListener('change', function (e) {
    if (!event.target.checked) {
        window.location.reload(true)
        hideModal()
    }
})

function hideModal() {
    //window.location.reload(true)
    if (closeTimer) clearInterval(closeTimer)
    modalState.checked = false
    progress.style.visibility = 'hidden'
    success.style.display = 'none'
    error.style.display = 'none'
    progress.children[0].className = 'bar success w-0'
    progress.children[0].style.width = '0%'
}

function showModal() {
    modalState.checked = true
}

var progress = document.getElementById('progress')
var success = document.getElementById('success')
var error = document.getElementById('error')

// Send Data to Backend
function submitModal() {
    console.log('Daten in DB eintragen: ' + JSON.stringify(submitData.data))
    progress.style.visibility = 'visible'
    progress.children[0].style.width = '100%'
    fetch(BASE_ENDPOINT_URL + submitData.path, {
        method: submitData.method,
        headers: new Headers({
            'Authorization': token,
        }),
        body: new URLSearchParams(jsonToQS(submitData.data)),
    }).then(response =>
        response.json().then(json => {
            modalFeedback(json)
        })
    ).catch(console.error)
}

// Answer from Backend
function modalFeedback(data) {
    if (data.error) {
        error.style.display = 'block'
        error.innerText = data.error
        progress.children[0].className = "bar danger w-0"
    } else {
        success.style.display = 'block'
        success.innerText = data.success
    }
    closeTimer = setTimeout(function () {
        window.location.reload(true)
    }, 3000)
}

if (!submitData) hideModal()

console.info(`Wilkommen in der Entewicklerkonsole
    ,~~.
    (  6 )-_,
(\___ )=='-'
\ .   ) )
 \ \`- ' /    
~'\`~'\`~'\`~'\`~
    
Falls dir WebDev auch Spaß macht schreib mir doch auf Discord: Logge#1337`)