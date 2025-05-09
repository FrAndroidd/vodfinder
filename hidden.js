async function getM3U8(path, suggestion, element) {
	let textElement = element.querySelector("span")
	let iconElement = element.querySelector(".buttonIcon")

	textElement.innerText = "Getting M3U8"
	// loading icon
	iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>'


	var subdomains = [
		"d2e2de1etea730",
		"ddacn6pr5v0tl",
		"dgeft87wbj63p",
		"d3c27h4odz752x",
		"d2vjef5jvl6bfs",
		"d1mhjrowxxagfy",
		"d1ymi26ma8va5x",
		"ds0h3roq6wcgc",
		"d2nvs31859zcd8",
		"d3aqoihi2n8ty8",
		"dqrpb9wgowsf5",
		"d1m7jfoe9zdc1j",
		"d2aba1wr3818hz",
		"d3vd9lfkzbru3h"
	]

	if (suggestion !== "undefined") {
		// avoid duplicate requests
		let index = subdomains.indexOf(suggestion)
		if (index > -1) {
			subdomains.splice(index, 1)
		}

		// try suggestion first
		subdomains.unshift(suggestion)
	}


	for (let i = 0; i < subdomains.length; i++) {
		let response = await fetch(`https://kickapi.starsita.xyz/request?url=https://${subdomains[i]}.cloudfront.net/${path}`)

		if (response.status === 200) {
			copy(`https://${subdomains[i]}.cloudfront.net/${path}`)
			textElement.innerText = "Copied M3U8"
			// check icon
			iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>'
			return
		}
	}


	textElement.innerText = "Invalid M3U8"
	// x icon
	iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
}


async function getHiddenVODs(channel, channelID, thumbnailURL) {
	updateState("Searching hidden VODs...", false)


	let response = await fetch(`https://startiso-silly.hf.space/api/tables/channeltables/streams/90/${channelID}/%20/1/1/desc/0/100`)

	let json = await response.json()


	let streams = []

	for (let i = 0; i < json.data.length; i++) {
		let stream = json.data[i]

		let timestamp = Math.floor(new Date(stream.startDateTime).getTime() / 1000)
		let duration = stream.length * 60

		let urlPattern = `${channel}_${stream.streamId}_${timestamp}`
		let fullHash = await sha1(urlPattern)
		let hash = fullHash.slice(0, 20)

		let m3u8 = `${hash}_${urlPattern}/chunked/index-dvr.m3u8`

		let suggestion
		if (!/:\/\/[\w-]+\.twitch\.tv/.test(thumbnailURL ?? "")) {
			suggestion = thumbnailURL?.match(/cf_vods\/(\w+)/)[1]
		}

		let id = stream.streamId

		streams.push({
			type: "hidden",
			duration: duration,
			timestamp: timestamp,
			m3u8: m3u8,
			suggestion: suggestion,
			id: id
		})
	}


	return streams
}
