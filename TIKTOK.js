(function() {

    chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

        if(request.action === 'dlReelsOnly'){

        }

    });



    function dlTikToks(){

    }
    //getAttributeNode("class").textContent.includes('VideoContainer')



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



})()