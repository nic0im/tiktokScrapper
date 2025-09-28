(function() {


    chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

        if(request.action === 'dlReelsOnly'){
            dlReels()
        }else if(request.action === 'resumeReelsDownloads' ){
            //implement this
        }

    });


    async function dlReels() {

        setupSFTabs()

        const username = getUsername()

        const selReelTabRes = await selectReelsTab(username)
        if (!selReelTabRes) return;

        const localFiles = await getLocalFiles(username)

        console.log(localFiles)
        const reelsToDL =  await getVidsInfoToDl(localFiles)
        if(!reelsToDL) return;

        SFgetLinks({username,reelsToDL})

    }



    function getUsername(){
        const username = document.querySelectorAll('span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft')[0]?.textContent
        if(username){
            return username
        }else{
            console.log("username span element not found")
            return false
        }
    }

    async function selectReelsTab(username) {
        return new Promise((resolve)=>{
            let reelsTabBtn = document.querySelector(`a[href*="/${username}/reels/"]`);
            if (reelsTabBtn) {
                reelsTabBtn.click();
                setTimeout(()=>{
                    resolve(true);
                },1500)
            } else {
                console.log("Reels tab not found for user:", username);
            }

        })
    }

    async function getLocalFiles(username) {
        try {
            const response = await fetch(`http://localhost:3000?profile=${username}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (!data || !data.files || data.files.length === 0) {
                return false;
            }

            return data.files.map((filename) => {
                return filename.split('.')[0]
            });

        } catch (error) {
            console.error('Error fetching local files:', error);
            return false;
        }
    }


    async function getVidsInfoToDl(existingFiles) {
        return new Promise(async (resolve) => {

            let alreadyRetrievedVideos = existingFiles || [];
            let reelsToDl = [];

            let retrieveInterval = setInterval(()=>{
                retrieveReelsHrefs(alreadyRetrievedVideos, reelsToDl)
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

    async function canStopRetrieve(delay = 5000) {
        return new Promise(resolve => {

            const done = () => {
                observer.disconnect();
                resolve(true);
            };

            let timeout = setTimeout(done, delay);
            const selector = 'div[data-visualcompletion="loading-state"]';

            const observer = new MutationObserver(mutations => {
                for (const m of mutations) {
                    for (const n of m.addedNodes) {
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


    function retrieveReelsHrefs(alreadyRetrievedVideos, reelsToDl) {

        document.querySelectorAll('a').forEach((a) => {

            const urlParts = a.href.split('/');
            const isReel = urlParts[4] === 'reel';
            const videoNameFile = urlParts[5] || null;

            if (isReel && videoNameFile && !alreadyRetrievedVideos.includes(videoNameFile)) {

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

    function SFgetLinks(data){
        chrome.runtime.sendMessage({action:"addToQueue", data})
    }

    function setupSFTabs(){
        chrome.runtime.sendMessage({action:"setupSFTabs"})
    }

})()