const background = document.getElementById("banner")

async function getChannelInfo(channel) {
	updateState("Getting channel info...", false)

	let gqlResponse = await fetch("https://gql.twitch.tv/gql", {
		method: "POST",
		headers: {
			"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"
		},
		body: `[{
			"operationName": "ChannelShell",
			"variables": {
				"login": "${channel}"
			},
			"extensions": {"persistedQuery": {
				"version": 1,
				"sha256Hash": "580ab410bcd0c1ad194224957ae2241e5d252b2c5173d8e0cce9d32d5bb14efe"
				}
			}
		}]`
	})

	json = await gqlResponse.json()

	if (json[0]?.data?.userOrError?.hasOwnProperty("userDoesNotExist")) {
		updateState("Couldn't find channel", true)
		return {error: true}
	}

	let banner = json[0].data.userOrError.bannerImageURL ?? ""
	background.style.backgroundImage = `url(${banner})`


	// god knows WHY twitch's channel ID isn't the same as the ones used by SullyGnome
	let sullyResponse = await fetch(`https://startiso-silly.hf.space/channel/${channel}/30/streams`)
	let sullyHTML = await sullyResponse.text()

	let id
	
	try {
		regex = new RegExp(`"urlpart":"${channel}","id":(\\d+)`)
		id = regex.exec(sullyHTML)[1]
	} catch(error) {
		console.log(error)
		return {
			error: false,
			id: 0,
		}
	}


	return {
		error: false,
		id: id
	}
}


async function copyM3U8(m3u8, element) {
	let textElement = element.querySelector("span")
	let iconElement = element.querySelector(".buttonIcon")

	copy(m3u8)
	textElement.innerText = "Copied M3U8"
	// check icon
	iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>'
}



async function getPublicVODs(channel) {
	updateState("Fetching public VODs...", false)

	let response = await fetch("https://gql.twitch.tv/gql", {
		method: "POST",
		headers: {
			"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"
		},
		body: `[{
			"operationName": "FilterableVideoTower_Videos",
			"variables": {
				"channelOwnerLogin": "${channel}",
				"limit": 75, "broadcastType": "ARCHIVE", "videoSort": "TIME"
			},
			"extensions": {"persistedQuery": {
				"version": 1,
				"sha256Hash": "a937f1d22e269e39a03b509f65a7490f9fc247d7f83d6ac1421523e3b68042cb"
				}
			}
		}]`
	})

	json = await response.json()
	let streams = []

	json[0].data.user.videos.edges.forEach((stream) => {
		let timestamp = Math.floor(new Date(stream.node.publishedAt).getTime() / 1000)
		let m3u8 = stream.node.animatedPreviewURL?.match(/.net\/(.*)\/storyboards/)[1] + "/chunked/index-dvr.m3u8"
		let m3u8pf = stream.node.animatedPreviewURL?.match(/^(.*).net\//)[0]
		let link = "https://www.twitch.tv/videos/" + stream.node.id
		
		streams.push({
			type: "public",
			thumbnail: stream.node.previewThumbnailURL,
			title: stream.node.title,
			duration: stream.node.lengthSeconds,
			timestamp: timestamp,
			m3u8: m3u8,
			m3u8pf: m3u8pf,
			link: link
		})
	})

	return streams
}
