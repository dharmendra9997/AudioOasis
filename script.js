async function getSongs(folder) {
    console.log(currFolder)
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    //display songs on left container
    let songList = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songList.innerHTML = ''
    for (const song of songs) {
        songList.innerHTML = songList.innerHTML + `<li><img src="img/music.svg" width="34" class="invert">
        <div class="info">
            <div>${song.replaceAll("%20"," ").replaceAll(".mp3", "")}</div>
        </div>
        <div class="playnow">
            <img src="img/play.svg" alt=" " class="invert">
        </div>
    </li>`;
    }


    //eventlistener on each song in library

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playSong(e.querySelector(".info").firstElementChild.innerHTML.trim() + (".mp3"))
        })
    })

    return songs
}



async function main() {

    await getSongs(`songs/arijit`);

    playSong(songs[0], true)

    await displayAlbums()

    //eventlistener on play buttons
    play.addEventListener("click", e => {
        if (currentSong.paused) {
            console.log(currentSong)
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //events on playbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secToMin(currentSong.currentTime)}/${secToMin(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //events on seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //events on hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    //event on next-prev
    document.querySelector("#previous").addEventListener("click", () => {
        console.log(currentSong.src.split("/").slice(-1)[0])

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index)
        const newIndex = (index - 1 + songs.length) % songs.length;
        playSong(songs[newIndex]);
        index = newIndex;

    })
    document.querySelector("#next").addEventListener("click", () => {
        console.log(currentSong.src.split("/").slice(-1)[0])
        console.log(songs)

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        const newIndex = (index + 1) % songs.length;
        playSong(songs[newIndex]);
        index = newIndex;

    })

    //event on vol-Range

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        console.log(e.target.value)
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //event to mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })




} //main function ends here


let currentSong = new Audio();
let song;
let currFolder;
let songs;


function playSong(track, pause = false) {

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(".mp3", '')
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}


function secToMin(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

//display album function
async function displayAlbums() {

    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                    stroke-linejoin="round" />
                 </svg>
            </div>

           <img src="/songs/${folder}/cover.jpg">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playSong(songs[0])
        })
    })
}


main()