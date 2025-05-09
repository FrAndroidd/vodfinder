const publicContainer = document.getElementById("publicContainer")
const hiddenContainer = document.getElementById("hiddenContainer")
const allContainer = document.getElementById("allContainer")


function parseVODs(vods, merge) {
	updateState("Putting it all together...", false)

	// sort
	vods.sort((a, b) => b.timestamp - a.timestamp)

	// remove duplicates
	let seen = new Set()
	vods = vods.filter(vod => {
		if (seen.has(vod.m3u8)) {
			return false
		}
		seen.add(vod.m3u8)
		return true
	})

	vods.forEach((vod) => {
		let date = unixToDate(vod.timestamp)
		let duration = secondsToHMS(vod.duration)
		
		let vodElement = document.createElement("article")
		vodElement.id = vod.type
		if (vod.type === "public") {
			vodElement.innerHTML = `
			<img class="thumbnail box-shadow" draggable="false" src="${vod.thumbnail}">
			<div class="info">
				<h3 class="title">${vod.title}</h3>
				<span class="date">${date}</span>
				<span class="duration">${duration}</span>
				<div class="buttons">
					<a href="${vod.link}">
						<div class="buttonIcon">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
								fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-external-link-icon lucide-external-link">
								<path d="M15 3h6v6" />
								<path d="M10 14 21 3" />
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							</svg>
						</div>
						<span>Open</span>
					</a>
					<div onclick="copyM3U8('${vod.m3u8pf}${vod.m3u8}', this)">
						<div class="buttonIcon">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
								fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round" class="lucide lucide-link-icon lucide-link">
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
							</svg>
						</div>
						<span>Copy M3U8</span>
					</div>
				</div>
			</div>`
		} else if (vod.type === "hidden") {
			vodElement.innerHTML = ` 
			<div class="info">
				<span class="date">${date}</span>
				<span class="duration">${duration}</span>
				<div class="buttons">
					<div onclick="getM3U8('${vod.m3u8}', '${vod.suggestion}', this)">
						<div class="buttonIcon">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
								fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round" class="lucide lucide-link-icon lucide-link">
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
							</svg>
						</div>
						<span>Copy M3U8</span>
					</div>
				</div>
			</div>`
		}

		if (!merge) {
			if (vod.type === "public") {
				publicContainer.appendChild(vodElement)
			} else if (vod.type === "hidden") {
				hiddenContainer.appendChild(vodElement)
			}
		} else {
			allContainer.appendChild(vodElement)
		}
	})
}
