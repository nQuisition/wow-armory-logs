function saveOptions() {
  var apiKey = document.getElementById('apikey').value;
  chrome.storage.sync.set({
    apiKey: apiKey
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'API key saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    apiKey: ''
  }, function(items) {
    document.getElementById('apikey').value = items.apiKey;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',
    saveOptions);
