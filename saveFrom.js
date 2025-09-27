(function(){

    let keepAliveInterval;

    chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

        if(request.action === 'processLink' ){
            console.log(request.linkInfo)
            await dlReelByInstaLink(request.linkInfo)
        }
    });


    let findDlBtnInterval

    async function dlReelByInstaLink(linkInfo){

        const fileUrl = linkInfo.url
        const fileName = linkInfo.fileName
        const currentUsername = fileUrl.split("/")[3]

        let fillInputRes = await fillUrlInput(fileUrl)
        if(!fillInputRes) return

        let retrieveVidHrefRes = await retrieveVidHref(fileUrl)
        if(!retrieveVidHrefRes) return

        dlReel(retrieveVidHrefRes,currentUsername,fileName)

    }

    async function fillUrlInput(url){
        return new Promise((resolve)=>{

            let input = document.querySelector('input')
            let dlButton = document.querySelector('button')

            let findInputInterval = setInterval(()=>{

                if(input && dlButton){

                    clearInterval(findInputInterval)
                    input.focus()
                    input.value = url
                    delay(() => dlButton.click() , 100)
                    resolve(true)

                }

            },100)

        })
    }


    function delay(cb, delay){
        setTimeout(()=>{
            cb()
        },delay)
    }

    async function retrieveVidHref(url){

        return new Promise(resolve => {

            findDlBtnInterval = setInterval(async ()=>{

                let confirmDownloadBtn = document.querySelector('a.link') || null
                let errorMsgElement = document.querySelector('.result-box')

                if(confirmDownloadBtn){
                    resolve(confirmDownloadBtn.href)
                    clearInterval(findDlBtnInterval)
                }else if(errorMsgElement && (errorMsgElement.textContent === 'The download link not found.' || errorMsgElement.textContent === 'Error en la solicitud. Inténtelo de nuevo.')){
                    clearInterval(findDlBtnInterval)
                    await dlReelByInstaLink(url)
                }

            },400)

        })
    }

    function dlReel(url,currentUsername, fileName){
        chrome.runtime.sendMessage({action:'dlReelFromServiceWorker', url, filename: `instagram/${currentUsername}/${fileName}.mp4`})
            chrome.runtime.sendMessage({action:'tabReady'})
    }

    function keepAlive(){
        keepAliveInterval = setInterval(()=>{
            chrome.runtime.sendMessage({action:'keepAlive'})
        },5000)
    }
    keepAlive()

})()