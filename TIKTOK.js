(function() {

    chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

        if(request.action === 'dlTikToks'){
            await dlTikToks()
        }

    });

    async function dlTikToks() {

        //const existingFiles = getLocalDownloads()

        setupSFTab()

        const username = getCurrentUsername();
        if(!username) return;

        const tiktoksToDl = await getVidsInfoToDl();
        if(!tiktoksToDl) return;

        SFgetLinks({username,tiktoksToDl});

    }

    async function getVidsInfoToDl(existingFiles) {
        return new Promise(async (resolve) => {

            let alreadyRetrievedVideos = existingFiles || [];
            let reelsToDl = [];

            let retrieveInterval = setInterval(()=>{
                retrieveTiktoksHrefs(alreadyRetrievedVideos, reelsToDl)
                chrome.runtime.sendMessage({action:"focusIg"})
                window.scrollBy(0, 800);
            }, 1000);

            const canStopRes = await canStopRetrieve()
            if(canStopRes){
                clearInterval(retrieveInterval)
                resolve(reelsToDl)
            }

        })
    }

    function retrieveTiktoksHrefs(alreadyRetrievedVideos = [], reelsToDl) {

        document.querySelectorAll('a').forEach((a) => {

            const isTikTokVidLink = a?.classList[0]?.includes('VideoContainer') || null;
            const urlParts = a.href.split('/');
            const videoNameFile = urlParts[urlParts.length - 1];

            if (isTikTokVidLink && !alreadyRetrievedVideos.includes(videoNameFile)) {

                // Create a video object
                let video = {
                    fileName: videoNameFile,
                    url: a.href,
                    downloaded: false
                };

                reelsToDl.push(video);
                alreadyRetrievedVideos.push(videoNameFile);
            }
        });
    }

    async function canStopRetrieve(delay = 5000) {
        return new Promise(resolve => {

            const done = () => {
                observer.disconnect();
                resolve(true);
            };

            let timeout = setTimeout(done, delay);
            const selector = 'div';

            const observer = new MutationObserver(mutations => {
                for (const m of mutations) {
                    console.log(m)
                    for (const n of m.addedNodes) {
                        console.log(n)
                        if (n.nodeType === 1 && (n.matches(selector) || n.querySelector(selector))) {
                            clearTimeout(timeout);
                            timeout = setTimeout(done, delay);
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    function SFgetLinks(data){
        chrome.runtime.sendMessage({action:"addToQueue", data})
    }

    function setupSFTab(){
        chrome.runtime.sendMessage({action:"setupSFTabs"})
    }

    function getCurrentUsername(){
        return location.href.split("@")[1];
    }

})()