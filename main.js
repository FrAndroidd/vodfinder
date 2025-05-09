// --- misc

const inputElement = document.getElementById("input")

inputElement.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		getVODs(inputElement.value)
	}
	if (inputElement.value === "" && !inResults) {
		cleanup()
	}
})


async function copy(text) {
	try {
		await navigator.clipboard.writeText(text)
	} catch {
		console.log("Failed to copy")
	}
}


function unixToDate(seconds) {
	let date = new Date(seconds * 1000)
	let day = String(date.getDate()).padStart(2, "0")
	let month = String(date.getMonth() + 1).padStart(2, "0")
	let year = date.getFullYear()

	return `${day}/${month}/${year}`
}


function secondsToHMS(seconds) {
	let h = Math.floor(seconds / 3600)
	let m = Math.floor((seconds % 3600) / 60)
	let s = seconds % 60

	let mm = String(m).padStart(2, "0")
	let ss = String(s).padStart(2, "0")

	return `${h}:${mm}:${ss}`
}


var stateUpdates = 0
const loadingContainer = document.getElementById("loading")
const loadingState = document.getElementById("states")

function updateState(state, isError) {
	stateUpdates++
	let text = document.createElement("span")
	text.innerText = state
	loadingState.insertBefore(text, loadingState.firstChild)
	loadingState.style.height = stateUpdates * 20 + 6 + "px"

	if (isError) {
		loadingContainer.classList.add("error")
		isSearching = false
	} else {
		loadingContainer.classList.remove("error")
	}
}


async function sha1(message) {
	const encoder = new TextEncoder()
	const data = encoder.encode(message)
	const hashBuffer = await crypto.subtle.digest("SHA-1", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")

	return hash
}


function cleanup() {
	loadingState.style.height = null
	loadingState.innerHTML = null

	publicContainer.innerHTML = null
	hiddenContainer.innerHTML = null
	allContainer.innerHTML = null

	logoContainer.onclick = null
	checkboxContainer.style.display = null

	resultsCSS.remove()

	params.delete("q")
	let newQuery = params.toString()
	let newUrl = `${window.location.pathname}${newQuery ? '?' + newQuery : ""}`
	window.history.replaceState({}, "", newUrl)

	stateUpdates = 0
	inResults = false
}



// --- main

var isSearching = false
var inResults = false

const logoContainer = document.getElementById("logoContainer")
const checkboxContainer = document.getElementById("checkboxContainer")
const checkbox = document.getElementById("checkbox")
const resultsCSS = document.createElement("link")
resultsCSS.rel = "stylesheet"
resultsCSS.href = "results.css"

async function getVODs(channelUpperCase) {
	if (isSearching) {
		return
	}
	isSearching = true
	
	cleanup()

	let channel = channelUpperCase.toLowerCase()


	checkboxContainer.style.display = "none"

	let publicVODs
	let channelInfo

	try {
		channelInfo = await getChannelInfo(channel)
		if (channelInfo.error) {
			return
		}

		publicVODs = await getPublicVODs(channel)
	} catch(error) {
		updateState("Unknown error on channel info", true)
		console.log(error)
		return
	}



	let hiddenVODs

	try {
		hiddenVODs = await getHiddenVODs(channel, channelInfo.id, publicVODs[0]?.thumbnail)

		if (publicVODs.length + hiddenVODs.length === 0) {
			updateState("No VODs were found", true)
			return
		}
	} catch(error) {
		updateState("Unknown error with hidden VODs", true)
		console.log(error)
		return
	}



	try {
		parseVODs([...publicVODs, ...hiddenVODs], checkbox.checked)
	} catch(error) {
		updateState("Unknown error parsing data", true)
		console.log(error)
		return
	}

	logoContainer.onclick = () => {
		cleanup()
		inputElement.value = ""
	}

	// apply results.css
	document.head.appendChild(resultsCSS)

	params.set("q", channelUpperCase)
	let newUrl = `${window.location.pathname}?${params.toString()}`
	window.history.replaceState({}, "", newUrl)

	isSearching = false
	inResults = true
}



// initialization

const examples = [
	"OptiJuegos",
	"UnFantasmaMas",
	"Julio_Coci",
	"chaleoff",
	"ezeqwiel",
	"tomexoff",
	"Bananirou",
	"rageylo0",
	"zKrasy",
	"madorni",
	"snoopdogg",
	"KaiCenat",
	"IlloJuan",
	"MattKCLive"
]

inputElement.placeholder = examples[Math.floor(Math.random() * examples.length)]


var params = new URLSearchParams(window.location.search)

if (params.get("q")) {
	inputElement.value = params.get("q")
	getVODs(params.get("q"))
}


const cookieValue = document.cookie
	.split("; ")
	.find(row => row.startsWith("checkboxState="))
if (cookieValue) {
	const value = cookieValue.split("=")[1]
  	checkbox.checked = value === "true"
}

checkbox.addEventListener("change", () => {
	document.cookie = `checkboxState=${checkbox.checked}; path=/; max-age=31536000`
})
