
document.getElementById('btnDlTikToks').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'dlTikToks' });

    });
});

document.getElementById('resumeTikToksDownloads').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'resumeTikToksDownloads' });
    });
});
