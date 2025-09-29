let downloadQueue = [];
let availableTabs = [];
chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {

    if(message.action === 'dlReelFromServiceWorker') {
        dlReel(message.url, message.filename)

    } else if(message.action === 'setupSFTabs') {
        setupSFTabs()
    }else if(message.action === 'addToQueue'){
        addToQueue(message.data)
    }else if(message.action === 'tabReady'){
        setAvailableTab(sender, message.currentUsername)

    }else if(message.action === 'focusIg'){
        focusTabById(sender.tab.id)
    }else if(message.action === 'focusSF'){
        focusTabById(sender.tab.id)
    }else if(message.action==='keepAlive'){
        console.log("keep-alive")
    }

})

function addToQueue(data){

    const queueVids = data.tiktoksToDl

    availableTabs.forEach(tabId => {
        const linkInfo = queueVids.shift();
        if (linkInfo) {
            chrome.tabs.sendMessage(tabId, { action: 'processLink', linkInfo, username: data.username });
        }
    });

    if(data && data.tiktoksToDl && data.tiktoksToDl.length > 0){
        downloadQueue.push(...queueVids)
    }

}

function setAvailableTab(sender, username) {
    const tabId = sender.tab.id;

    if (downloadQueue.length > 0) {
        console.log(downloadQueue)
        const linkInfo = downloadQueue.shift();

        function onDownloadChanged(downloadItem) {
            if (downloadItem.state && downloadItem.state.current === 'complete') {
                setTimeout(()=>{
                    chrome.tabs.sendMessage(tabId, { action: 'processLink', linkInfo, username });
                },2000)
                focusTabById(tabId);
                chrome.downloads.onChanged.removeListener(onDownloadChanged);
            }
        }
        chrome.downloads.onChanged.addListener(onDownloadChanged);
    }
}


async function setupSFTabs() {
    chrome.tabs.query({}, (tabs) => {
        let targetTabs = tabs.filter(tab => tab.url === "https://es.savefrom.net/159dZ/download-from-tiktok");

        // Close extra tabs if there are 5 or more
        targetTabs.slice(1).forEach(tab => chrome.tabs.remove(tab.id));

        if(targetTabs.length > 0){
            availableTabs.push(targetTabs[0].id)
        }

        while (targetTabs.length < 1) {
            chrome.tabs.create({ url: "https://es.savefrom.net/159dZ/download-from-tiktok" },(newTab)=>{
                availableTabs.push(newTab.id);
            });
            targetTabs.push({});
        }

    });
}



function dlReel(url, filename){
    chrome.downloads.download({filename, url})
    deleteSFCookies()
}

function showProgress(index, total) {
    // Calculate the percentage
    const percentage = (index / total) * 100;

    // Create a progress bar (text-based)
    const barLength = 40;  // Length of the progress bar (characters)
    const progress = Math.floor(barLength * index / total);
    const bar = "█".repeat(progress) + "-".repeat(barLength - progress);

    // Display percentage and progress bar
    console.log(`Progress: ${percentage.toFixed(2)}%`);
    console.log(`[${bar}] ${index}/${total}`);
}

function focusTabById(tabId) {
    chrome.tabs.update(tabId, { active: true });
}

function deleteSFCookies() {
    chrome.cookies.getAll({ domain: 'es.savefrom.net' }, cookies => {
        cookies.forEach(cookie => {
            const url = `https://${cookie.domain}${cookie.path}`;
            chrome.cookies.remove({ url: url, name: cookie.name });
        });
    });
}
